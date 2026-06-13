import type { Request, Response, NextFunction } from "express"
import { errorResponse } from "../utils/responses.js"


export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction) {
  // first we will console the error 
  console.error(err)
  
  // get the error message out 
  const errorMessage = err instanceof Error ? err.message : "Internal Server Error"
  
  // then return error response using errorResponse function 
  errorResponse(res,500,errorMessage)
}