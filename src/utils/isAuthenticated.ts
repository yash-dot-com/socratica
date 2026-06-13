import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../env.js";
import { errorResponse, HTTPStatus } from "./responses.js";

export const isAuthenticated = (req: Request<{currentUser: any}>, res: Response, next: NextFunction) => {
    const {token} = req.cookies
    if(!token){
        return errorResponse(res,HTTPStatus.UNAUTHORIZED,"Unauthorized user, signin again")
    }

    try{
        const decoded = jwt.verify(token, env.JWT_SECRET) as {userId: string, email: string}
        req.currentUser = decoded
        next()
    }catch(err){
        next(err)
    }
}