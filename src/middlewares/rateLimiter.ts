import rateLimit from "express-rate-limit"

// by default we are using in-memory store. 
// we can swap with redis store if required.
// just do the following steps 

// import { RedisStore } from "express-rate-limit"
// export const rateLimiter = (limit: number) => rateLimit({
//   windowMs: 15 * 60 * 1000,
//   limit,
//   store: new RedisStore({
//     client: redisClient
//   })
// })

// basic in-memory store with default 100 requests per ip
export const rateLimiter = (limit: number = 100) => rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins cool down
  limit,
  message: "Too many requests, please try again later.",
  standardHeaders: true, // add rateLimit header to response
 legacyHeaders: false, // disable old X-RateLimit headers. 
})