import type { Response, Request, NextFunction } from "express"

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`${req.ip} : ${req.method} : ${req.url}`)
  // don't forget to call next() in middlewares. 
  next()
}