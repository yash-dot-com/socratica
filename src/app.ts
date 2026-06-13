// express app configuration here
// setup middlewares (json, cors, logger, rateLimiter)
// mount error handler (always last)

import express from "express"
import type { Request, Response, NextFunction } from "express";
import { errorHandler } from "./middlewares/errorHandler.js";
import { errorResponse, HTTPStatus, successResponse } from "./utils/responses.js";
import { requestLogger } from "./middlewares/requestLogger.js";
import { rateLimiter } from "./middlewares/rateLimiter.js";
import authRouter from "./routes/auth.routes.js"
import cookieParser from "cookie-parser";

const app = express()
app.use(express.json())

// request logger 
app.use(requestLogger)

// cookie parser middleware to parse cookies from incoming requests
app.use(cookieParser())

// rate limiter, 50 is the no of requests per IP
app.use(rateLimiter(50))

// mount routers here 
app.use("/auth", authRouter) 

// using validator 
// all the routes that can produce error needs to have next() function as well to be able to call the errorHandler middleware
// app.get("/users", validate(userSchema), async(req,res,next)=>{
// })

// health route 
app.get("/health", (req: Request, res: Response) => {
  successResponse(res, "OK", {})
})

// catch all route 
app.use((req: Request, res: Response) => {
  errorResponse(res, HTTPStatus.NOT_FOUND, `Route ${req.method} ${req.url} not found`)
})

// error handler middleware 
app.use(errorHandler)


export default app