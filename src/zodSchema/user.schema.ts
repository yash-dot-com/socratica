import { z } from "zod"

export const userSchema = z.object({
    name: z.string().max(255),
    email: z.email().max(255),
    password: z.string().min(6).max(24),
    grade: z.number().min(1).max(10),
    preferredLanguage: z.string().max(100),
    favorites: z.array(z.string()).default([]),
    createdAt: z.date().default(() => new Date()),
    updatedAt: z.date().default(() => new Date()),
})

export type User = z.infer<typeof userSchema>


