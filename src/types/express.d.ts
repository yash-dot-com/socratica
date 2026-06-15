import type { JwtPayload } from "jsonwebtoken";

declare global {
  namespace Express {
    interface Request {
      currentUser?: JwtPayload & {
        userId: string;
        email: string;
      };
    }
  }
}

export {};
