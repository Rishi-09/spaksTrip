import { Schema, model, HydratedDocument } from "mongoose";

export interface ITboToken {
  tokenId: string;
  userName: string;
  expiresAt: Date;
}

const schema = new Schema<ITboToken>(
  {
    tokenId: { type: String, required: true },
    userName: { type: String, required: true, index: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// MongoDB TTL: auto-delete expired tokens
schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type TboTokenDoc = HydratedDocument<ITboToken>;
export const TboToken = model<ITboToken>("TboToken", schema);
