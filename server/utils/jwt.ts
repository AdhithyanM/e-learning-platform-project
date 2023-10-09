require("dotenv").config();
import { Response } from "express";
import { IUser } from "../models/user.model";
import { redis } from "../setup/redis";

interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

export const sendToken = (user: IUser, statusCode: number, res: Response) => {
  const accessToken = user.signAccessToken();
  const refreshToken = user.signRefreshToken();

  // upload session to redis
  redis.set(user._id, JSON.stringify(user) as any);

  // parse environment variables to integrate with fallback values
  const accessTokenExpiration = parseInt(
    process.env.ACCESS_TOKEN_EXPIRATION || "300",
    10
  );
  const refreshTokenExpiration = parseInt(
    process.env.REFRESH_TOKEN_EXPIRATION || "1200",
    10
  );

  // options for cookies
  const accessTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + accessTokenExpiration * 1000),
    maxAge: accessTokenExpiration * 1000,
    httpOnly: true,
    sameSite: "lax",
  };
  const refreshTokenOptions: ITokenOptions = {
    expires: new Date(Date.now() + refreshTokenExpiration * 1000),
    maxAge: refreshTokenExpiration * 1000,
    httpOnly: true,
    sameSite: "lax",
  };

  // only set secure to true in production
  if (process.env.NODE_ENV === "production") {
    accessTokenOptions.secure = true;
  }

  res.cookie("access_token", accessToken, accessTokenOptions);
  res.cookie("refresh_token", refreshToken, refreshTokenOptions);

  res.status(statusCode).json({
    success: true,
    user,
    accessToken,
  });
};