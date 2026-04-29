import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import { UserModel } from "../models/User";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../lib/tokens";
import { setAuthCookies, setAccessCookie, clearAuthCookies } from "../lib/cookies";
import { validateLogin, validateRegister } from "../validators/auth.validators";
import { HttpError } from "../middleware/error";

const BCRYPT_ROUNDS = 12;

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password, role } = validateRegister(req.body);

    const existing = await UserModel.findOne({ email });
    if (existing) throw new HttpError(409, "Email already in use");

    const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
    const user = await UserModel.create({ email, passwordHash, role });

    const userId = String(user._id);
    const accessToken = signAccessToken({ sub: userId, role: user.role, email: user.email });
    const refreshToken = signRefreshToken({ sub: userId, tokenType: "refresh" });

    setAuthCookies(res, accessToken, refreshToken);
    res.status(201).json({ user: user.toJSON() });
  } catch (e) {
    next(e);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = validateLogin(req.body);

    const user = await UserModel.findOne({ email });
    if (!user) throw new HttpError(401, "Invalid credentials");

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new HttpError(401, "Invalid credentials");

    const userId = String(user._id);
    const accessToken = signAccessToken({ sub: userId, role: user.role, email: user.email });
    const refreshToken = signRefreshToken({ sub: userId, tokenType: "refresh" });

    setAuthCookies(res, accessToken, refreshToken);
    res.json({ user: user.toJSON() });
  } catch (e) {
    next(e);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) throw new HttpError(401, "Missing refresh token");

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new HttpError(401, "Invalid or expired refresh token");
    }

    const user = await UserModel.findById(payload.sub);
    if (!user) throw new HttpError(401, "User no longer exists");

    const accessToken = signAccessToken({
      sub: String(user._id),
      role: user.role,
      email: user.email,
    });
    setAccessCookie(res, accessToken);
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
}

export async function logout(_req: Request, res: Response): Promise<void> {
  clearAuthCookies(res);
  res.json({ ok: true });
}

export async function me(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) throw new HttpError(401, "Unauthorized");
    const user = await UserModel.findById(req.user.sub);
    if (!user) throw new HttpError(401, "User not found");
    res.json({ user: user.toJSON() });
  } catch (e) {
    next(e);
  }
}
