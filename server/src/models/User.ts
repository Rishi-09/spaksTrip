import { Schema, model, HydratedDocument } from "mongoose";

export const ROLES = ["customer", "partner", "agent"] as const;
export type Role = (typeof ROLES)[number];

export interface IUser {
  email: string;
  passwordHash: string;
  role: Role;
  createdAt: Date;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ROLES, required: true, default: "customer" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

userSchema.set("toJSON", {
  transform: (_doc, ret) => {
    const out = ret as unknown as Record<string, unknown>;
    out.id = String(out._id);
    delete out._id;
    delete out.__v;
    delete out.passwordHash;
    return out;
  },
});

export type UserDoc = HydratedDocument<IUser>;
export const UserModel = model<IUser>("User", userSchema);
