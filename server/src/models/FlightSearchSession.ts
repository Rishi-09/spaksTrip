import { Schema, model, HydratedDocument } from "mongoose";

export interface IFlightSearchSession {
  traceId: string;
  tokenId: string;
  searchPayload: Record<string, unknown>;
  /** Results[0] = OB flights; Results[1] = IB flights (round-trip) */
  obResults: unknown[];
  ibResults: unknown[];
  expiresAt: Date;
}

const schema = new Schema<IFlightSearchSession>(
  {
    traceId: { type: String, required: true, unique: true, index: true },
    tokenId: { type: String, required: true },
    searchPayload: { type: Schema.Types.Mixed, required: true },
    obResults: { type: [Schema.Types.Mixed], default: [] },
    ibResults: { type: [Schema.Types.Mixed], default: [] },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type FlightSearchSessionDoc = HydratedDocument<IFlightSearchSession>;
export const FlightSearchSession = model<IFlightSearchSession>("FlightSearchSession", schema);
