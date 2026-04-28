function required(name: string): string {
  const v = process.env[name];
  if (!v || v.length === 0) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return v;
}

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 4000),
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:3000",
  mongoUri: required("MONGO_URI"),
  accessSecret: required("ACCESS_TOKEN_SECRET"),
  refreshSecret: required("REFRESH_TOKEN_SECRET"),
  accessTtl: process.env.ACCESS_TOKEN_TTL ?? "15m",
  refreshTtl: process.env.REFRESH_TOKEN_TTL ?? "7d",
};

export const isProd = env.nodeEnv === "production";
