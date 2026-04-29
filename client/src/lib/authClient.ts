import { api } from "@/lib/api";

export type UserRole = "customer" | "partner" | "agent";

export type ApiAuthUser = {
  id: string;
  email: string;
  role: UserRole;
};

type AuthResponse = {
  user: ApiAuthUser;
};

export type LoginInput = {
  email: string;
  password: string;
  role: UserRole;
};

export type RegisterInput = LoginInput & {
  role: UserRole;
};

export const authClient = {
  async login(input: LoginInput): Promise<ApiAuthUser> {
    const response = await api<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: input,
    });

    return response.user;
  },

  async register(input: RegisterInput): Promise<ApiAuthUser> {
    const response = await api<AuthResponse>("/api/auth/register", {
      method: "POST",
      body: input,
    });

    return response.user;
  },

  async me(): Promise<ApiAuthUser> {
    const response = await api<AuthResponse>("/api/auth/me");
    return response.user;
  },

  async logout(): Promise<void> {
    await api<{ ok: true }>("/api/auth/logout", { method: "POST" });
  },
};
