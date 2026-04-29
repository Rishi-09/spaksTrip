import { HttpError } from "../middleware/error";
import { ROLES, type Role } from "../models/User";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

export interface RegisterInput {
  email: string;
  password: string;
  role: Role;
}

export interface LoginInput {
  email: string;
  password: string;
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function validateRegister(body: unknown): RegisterInput {
  if (!isObject(body)) throw new HttpError(400, "Invalid body");
  const { email, password, role } = body;

  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    throw new HttpError(400, "Invalid email");
  }
  if (typeof password !== "string" || password.length < MIN_PASSWORD) {
    throw new HttpError(400, `Password must be at least ${MIN_PASSWORD} characters`);
  }

  let resolvedRole: Role = "customer";
  if (role !== undefined) {
    if (typeof role !== "string" || !(ROLES as readonly string[]).includes(role)) {
      throw new HttpError(400, `Invalid role. Allowed: ${ROLES.join(", ")}`);
    }
    resolvedRole = role as Role;
  }

  return {
    email: email.toLowerCase().trim(),
    password,
    role: resolvedRole,
  };
}

export function validateLogin(body: unknown): LoginInput {
  if (!isObject(body)) throw new HttpError(400, "Invalid body");
  const { email, password } = body;
  if (typeof email !== "string" || !EMAIL_RE.test(email)) {
    throw new HttpError(400, "Invalid email");
  }
  if (typeof password !== "string" || password.length === 0) {
    throw new HttpError(400, "Password required");
  }
  return { email: email.toLowerCase().trim(), password };
}
