import { HttpError } from "../middleware/error";
import { RESOURCE_TYPES, type ResourceType } from "../models/PartnerResource";

export interface ResourceCreateInput {
  type: ResourceType;
  title: string;
  description: string;
  price: number;
  metadata: Record<string, unknown>;
}

export type ResourceUpdateInput = Partial<ResourceCreateInput>;

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isValidType(v: unknown): v is ResourceType {
  return typeof v === "string" && (RESOURCE_TYPES as readonly string[]).includes(v);
}

export function validateResourceCreate(body: unknown): ResourceCreateInput {
  if (!isObject(body)) throw new HttpError(400, "Invalid body");
  const { type, title, description, price, metadata } = body;

  if (!isValidType(type)) {
    throw new HttpError(400, `type must be one of: ${RESOURCE_TYPES.join(", ")}`);
  }
  if (typeof title !== "string" || title.trim().length === 0) {
    throw new HttpError(400, "title is required");
  }
  if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
    throw new HttpError(400, "price must be a non-negative number");
  }
  if (description !== undefined && typeof description !== "string") {
    throw new HttpError(400, "description must be a string");
  }
  if (metadata !== undefined && !isObject(metadata)) {
    throw new HttpError(400, "metadata must be an object");
  }

  return {
    type,
    title: title.trim(),
    description: typeof description === "string" ? description.trim() : "",
    price,
    metadata: isObject(metadata) ? metadata : {},
  };
}

export function validateResourceUpdate(body: unknown): ResourceUpdateInput {
  if (!isObject(body)) throw new HttpError(400, "Invalid body");
  const { type, title, description, price, metadata } = body;
  const out: ResourceUpdateInput = {};

  if (type !== undefined) {
    if (!isValidType(type)) {
      throw new HttpError(400, `type must be one of: ${RESOURCE_TYPES.join(", ")}`);
    }
    out.type = type;
  }
  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length === 0) {
      throw new HttpError(400, "title must be a non-empty string");
    }
    out.title = title.trim();
  }
  if (description !== undefined) {
    if (typeof description !== "string") throw new HttpError(400, "description must be a string");
    out.description = description.trim();
  }
  if (price !== undefined) {
    if (typeof price !== "number" || !Number.isFinite(price) || price < 0) {
      throw new HttpError(400, "price must be a non-negative number");
    }
    out.price = price;
  }
  if (metadata !== undefined) {
    if (!isObject(metadata)) throw new HttpError(400, "metadata must be an object");
    out.metadata = metadata;
  }

  if (Object.keys(out).length === 0) {
    throw new HttpError(400, "No updatable fields provided");
  }
  return out;
}
