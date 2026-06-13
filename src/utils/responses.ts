
// standard success response looks like, always a 200 success status code 
// {
//  success: true,
//  message: "success",
//  data: {}
// }

// standard error response looks like, need to specify the statusCode and error message
// {
//  success: false,
//  statusCode:500,401... ,
//  error: ""
// }

import type { Response } from "express"

// msg argument is optional & default is "success"
export function successResponse<T>(res: Response, message: string = "success", data: T) {
  return res.status(200).json({
    success: true, 
    message, 
    data,
  })
}

export function errorResponse(res: Response, statusCode: number, error: string) {
  return res.status(statusCode).json({
    success: false,
    error,
  })
}

export const HTTPStatus = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// as const makes every value a literal type
// so HttpStatus.OK is typed as 200, not just number.
// use errorResponse(res, HTTPStatus.NOT_FOUND, "Link not found")