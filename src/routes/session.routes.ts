import express from "express";
import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { errorResponse, successResponse, HTTPStatus } from "../utils/responses.js";

const router = express.Router();

const OPENAI_REALTIME_SESSION_URL = "https://api.openai.com/v1/realtime/sessions";
const REALTIME_MODEL = "gpt-4o-realtime-preview";
const OPENAI_REQUEST_TIMEOUT_MS = 10_000;

const curiosityInstructions =
  "You are an enthusiastic curiosity partner for a 12-year-old child in India. Explain concepts using absolute fundamental truths (first principles). Do not give textbook definitions. Force them to pass 'The Gauntlet' by asking them to explain the concept back to you using a unique, creative analogy. Once they explain it back successfully and demonstrate clear understanding, immediately trigger the `unlockCuriosityWallet` tool.";

const sessionRequestBody = {
  model: REALTIME_MODEL,
  modalities: ["audio", "text"],
  voice: "alloy",
  instructions: curiosityInstructions,
  tools: [
    {
      type: "function",
      name: "unlockCuriosityWallet",
      description: "Unlock the curiosity wallet after the child masters a concept.",
      parameters: {
        type: "object",
        properties: {
          conceptName: {
            type: "string",
            description: "The core concept the child just mastered",
          },
        },
        required: ["conceptName"],
        additionalProperties: false,
      },
    },
  ],
  tool_choice: "auto",
} as const;

const clientSecretSchema = z.object({
  value: z.string().min(1),
  expires_at: z.number().int().positive(),
});

const openAIRealtimeSessionSchema = z.object({
  client_secret: clientSecretSchema,
}).passthrough();

const openAIErrorSchema = z.object({
  error: z.object({
    message: z.string().optional(),
    type: z.string().optional(),
    code: z.union([z.string(), z.number()]).optional(),
    param: z.string().nullable().optional(),
  }).optional(),
}).passthrough();

router.post("/session", async (_req: Request, res: Response, next: NextFunction) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return errorResponse(res, HTTPStatus.INTERNAL_SERVER_ERROR, "OpenAI API key is not configured");
  }

  const abortController = new AbortController();
  const timeout = setTimeout(() => abortController.abort(), OPENAI_REQUEST_TIMEOUT_MS);

  try {
    const openAIResponse = await fetch(OPENAI_REALTIME_SESSION_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(sessionRequestBody),
      signal: abortController.signal,
    });

    const responseBody: unknown = await openAIResponse.json().catch(() => null);

    if (!openAIResponse.ok) {
      const parsedError = openAIErrorSchema.safeParse(responseBody);
      const message = parsedError.success
        ? parsedError.data.error?.message ?? "Failed to create OpenAI realtime session"
        : "Failed to create OpenAI realtime session";

      return errorResponse(res, openAIResponse.status, message);
    }

    const parsedSession = openAIRealtimeSessionSchema.safeParse(responseBody);
    if (!parsedSession.success) {
      return errorResponse(res, 502, "OpenAI realtime session response was invalid");
    }

    return successResponse(res, "Realtime session token created", {
      client_secret: parsedSession.data.client_secret,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      return errorResponse(res, 504, "OpenAI realtime session request timed out");
    }

    return next(error);
  } finally {
    clearTimeout(timeout);
  }
});

export default router;
