import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import { env } from "./config/env";
import { connectDb } from "./config/db";
import authRoutes from "./routes/auth.routes";
import partnerRoutes from "./routes/partner.routes";
import flightRoutes from "./routes/flight.routes";
import { errorHandler } from "./middleware/error";

async function main(): Promise<void> {
  await connectDb();

  const app = express();

  app.use(
    cors({
      origin: env.clientOrigin,
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/partner", partnerRoutes);
  app.use("/api/flights", flightRoutes);

  app.use(errorHandler);

  app.listen(env.port, () => {
    console.log(`[server] listening on http://localhost:${env.port}`);
  });
}

main().catch((err) => {
  console.error("[fatal]", err);
  process.exit(1);
});
