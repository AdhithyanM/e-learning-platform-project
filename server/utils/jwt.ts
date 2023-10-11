require("dotenv").config();
import { Response } from "express";
import { IUser } from "../models/user.model";
import { redis } from "./redis";

interface ITokenOptions {
  expires: Date;
  maxAge: number;
  httpOnly: boolean;
  sameSite: "lax" | "strict" | "none" | undefined;
  secure?: boolean;
}

const accessTokenExpiration = parseInt(
  process.env.ACCESS_TOKEN_EXPIRATION || "300",
  10
);
const refreshTokenExpiration = parseInt(
  process.env.REFRESH_TOKEN_EXPIRATION || "1200",
  10
);

// options for cookies

export const accessTokenOptions: ITokenOptions = Object.freeze({
  expires: new Date(Date.now() + accessTokenExpiration * 60 * 1000),
  maxAge: accessTokenExpiration * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
});

export const refreshTokenOptions: ITokenOptions = Object.freeze({
  expires: new Date(Date.now() + refreshTokenExpiration * 24 * 60 * 60 * 1000),
  maxAge: refreshTokenExpiration * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "lax",
});
