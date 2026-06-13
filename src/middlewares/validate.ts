import type { Request, Response, NextFunction } from "express";
import { z, type ZodSchema } from "zod"

export const validate = <T>(schema: ZodSchema<T>) => (req: Request, res: Response, next: NextFunction) => {
  // parsing the request body against our specific schema
  const result = schema.safeParse(req.body)

  if (!result.success) {
    return res.status(400).json({
      success: false,
      errors: result.error.issues
    })
  }

  // success,  attach the data to request body, tbh no need to attach the data, its already attached to req body.
  // my bad, safeParse strips away any extras fields that the request body carries, therefore, following is mandatory
  req.body = result.data
  // call next function
  next()
}

// use 
// 1. create schema
// 2. add validate middleware to the route expecting data from user 
// 3. pass defined schema for that route 
// 4. request body will be properly parsed & ready to use

