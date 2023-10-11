require("dotenv").config();
import { Request, Response, NextFunction } from "express";
import CatchAsyncError from "./catchAsyncErrors";
import ErrorHandler from "../utils/ErrorHandler";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { redis } from "../utils/redis";

export const isAuthenticated = CatchAsyncError(
  async (req: Request, res: Response, next: NextFunction) => {
    console.log("req.cookies: ", req.cookies);
    const accessToken = req.cookies.access_token;

    if (!accessToken) {
      return next(
        new ErrorHandler("Please login to access this resource", 400)
      );
    }

    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET as Secret
    ) as JwtPayload;

    if (!decoded) {
      return next(new ErrorHandler("Access Token is not valid", 400));
    }

    const user = await redis.get(decoded.id);

    if (!user) {
      return next(new ErrorHandler("User not found", 400));
    }

    req.user = JSON.parse(user);

    next();
  }
);

export const authorizeRoles = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!roles.includes(req.user?.role || "")) {
      return next(
        new ErrorHandler(
          `Role ${req.user?.role} is not allowed to access this resource`,
          403
        )
      );
    }
    next();
  };
};
