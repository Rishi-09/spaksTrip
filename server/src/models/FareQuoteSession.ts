import { Schema, model, HydratedDocument } from "mongoose";

export interface ITboFareBreakdown {
  Currency?: string;
  PassengerType: number;   // 1=ADT, 2=CHD, 3=INF
  PassengerCount: number;
  BaseFare: number;
  Tax: number;
  YQTax: number;
  AdditionalTxnFeeOfrd: number;
  AdditionalTxnFeePub: number;
}

export interface IFareQuoteSession {
  traceId: string;
  resultIndex: string;
  isLCC: boolean;
  isPriceChanged: boolean;
  isTimeChanged: boolean;
  publishedFare: number;
  fareBreakdown: ITboFareBreakdown[];
  /** Full TBO Results object, kept for debugging / re-render */
  rawResult: Record<string, unknown>;
  expiresAt: Date;
}

const fareBreakdownSchema = new Schema<ITboFareBreakdown>(
  {
    Currency: String,
    PassengerType: { type: Number, required: true },
    PassengerCount: { type: Number, required: true },
    BaseFare: { type: Number, required: true },
    Tax: { type: Number, required: true },
    YQTax: { type: Number, default: 0 },
    AdditionalTxnFeeOfrd: { type: Number, default: 0 },
    AdditionalTxnFeePub: { type: Number, default: 0 },
  },
  { _id: false },
);

const schema = new Schema<IFareQuoteSession>(
  {
    traceId: { type: String, required: true, index: true },
    resultIndex: { type: String, required: true },
    isLCC: { type: Boolean, required: true },
    isPriceChanged: { type: Boolean, required: true },
    isTimeChanged: { type: Boolean, required: true },
    publishedFare: { type: Number, required: true },
    fareBreakdown: { type: [fareBreakdownSchema], required: true },
    rawResult: { type: Schema.Types.Mixed },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

schema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
schema.index({ traceId: 1, resultIndex: 1 });

export type FareQuoteSessionDoc = HydratedDocument<IFareQuoteSession>;
export const FareQuoteSession = model<IFareQuoteSession>("FareQuoteSession", schema);
