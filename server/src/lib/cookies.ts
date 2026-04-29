import { Response, CookieOptions } from "express";
import { isProd } from "../config/env";

const ACCESS_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const REFRESH_PATH = "/api/auth";

const baseOptions: CookieOptions = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? "none" : "lax",
  path: "/",
};

export function setAuthCookies(res: Response, accessToken: string, refreshToken: string): void {
  res.cookie("accessToken", accessToken, { ...baseOptions, maxAge: ACCESS_MAX_AGE_MS });
  res.cookie("refreshToken", refreshToken, {
    ...baseOptions,
    maxAge: REFRESH_MAX_AGE_MS,
    path: REFRESH_PATH,
  });
}

export function setAccessCookie(res: Response, accessToken: string): void {
  res.cookie("accessToken", accessToken, { ...baseOptions, maxAge: ACCESS_MAX_AGE_MS });
}

export function clearAuthCookies(res: Response): void {
  res.clearCookie("accessToken", baseOptions);
  res.clearCookie("refreshToken", { ...baseOptions, path: REFRESH_PATH });
}
