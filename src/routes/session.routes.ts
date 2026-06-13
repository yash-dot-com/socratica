import express from 'express';
import type { Request, Response, NextFunction } from "express";
import { errorResponse } from '../utils/responses.js';
import { isAuthenticated } from '../utils/isAuthenticated.js';
import { db } from '../db/db.js';
import { user } from '../db/schema/user.js';
import { eq } from 'drizzle-orm'
import { createSessionPrompt } from '../utils/groqClient.js';

const router = express.Router()

router.post("/session", isAuthenticated, async(req: Request,res: Response, next: NextFunction) => {
    const {userId, topic} = req.body
    if (!userId || !topic) {
        return errorResponse(res, 400, "User ID and topic are required")
    }

    try{
        // get all user information to spread into get LLMResponse function 
        const [currentUser] = await db.select().from(user).where(eq(user.id, userId))
        if(!currentUser){
            return errorResponse(res, 404, "User not found")
        }

        // need to start from creating child specifc prompt and passing it to LLM to get response 
    }
})