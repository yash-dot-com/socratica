import express from "express"
import type { Request, Response, NextFunction } from "express";
import { validate } from "../middlewares/validate.js";
import { userSchema } from "../zodSchema/user.schema.js";
import { user } from "../db/schema/user.js";
import { db } from "../db/db.js";
import { eq } from "drizzle-orm";
import { errorResponse, HTTPStatus, successResponse } from "../utils/responses.js";
import { comparePassword, hashPassword } from "../utils/hashPassword.js";
import { loginSchema } from "../zodSchema/login.schema.js";
import jwt from "jsonwebtoken"
import { env } from "../env.js";


const router = express.Router()

router.post("/signup", validate(userSchema), async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password, grade, preferredLanguage, favorites } = req.body
    if (!name || !email || !password || !grade || !preferredLanguage || !favorites) {
        return res.status(400).json({ error: "All fields are required" })
    }

    try {
        // check if user already exists
        const existingUser = await db.select().from(user).where(eq(user.email, email))
        if (existingUser.length !== 0) {
            return res.status(400).json({ error: "User already exists" })
        }

        // create new user 
        const [newUser] = await db.insert(user).values({
            name,
            email,
            password: await hashPassword(password),
            grade,
            preferredLanguage,
            favorites
        }).returning()

        if (!newUser) {
            return errorResponse(res, 500, "Failed to create user")
        }

        return successResponse(res, "User created successfully", { ...newUser })

    } catch (err) {
        next(err)
    }
})

router.post("/signin", validate(loginSchema), async (req: Request<{ userId: string, email: string}>, res: Response, next: NextFunction) => {
    const { email, password } = req.body
    if (!email || !password) {
        return errorResponse(res, 400, "Email and password are required")
    }

    try {
        // check if user exists 
        const [existingUser] = await db.select().from(user).where(eq(user.email, email))
        if (!existingUser) {
            return errorResponse(res, HTTPStatus.NOT_FOUND, "User not found")
        }

        // check if password is correct
        const isMatch = await comparePassword(password, existingUser.password)
        if (!isMatch) {
            return errorResponse(res, HTTPStatus.UNAUTHORIZED, "Invalid credentials")
        }

        const token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            env.JWT_SECRET,
            { expiresIn: '7d' } // Token expires in 7 days
        );

        res.cookie('token', token, {
            httpOnly: true,                  // Protects against XSS attacks
            secure: process.env.NODE_ENV === 'production', // Use HTTPS in production
            sameSite: 'strict',             // Protects against CSRF attacks
            maxAge: 7 * 24 * 60 * 60 * 1000 // Match token expiration (7 days in ms)
        });

        return successResponse(res, "Login successful", {
            userId: existingUser.id,
            email: existingUser.email,
            token
        })

    } catch (err) {
        next(err)
    }
})

export default router;