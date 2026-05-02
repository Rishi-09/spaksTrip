import { Schema, model, HydratedDocument } from "mongoose";

export const BOOKING_STATUS = [
  "Pending", "Booked", "Ticketed", "Cancelled", "Failed",
] as const;
export type BookingStatus = (typeof BOOKING_STATUS)[number];
export type LegType = "OW" | "OB" | "IB";

export interface IBookingPassenger {
  paxType: "ADT" | "CHD" | "INF";
  title: string;
  firstName: string;
  lastName: string;
  gender: "M" | "F";
  dob: string;
  passport?: string;
  nationality?: string;
  ticketNumber?: string;
}

export interface IBooking {
  /** Shared across OB + IB legs of the same round-trip */
  correlationId?: string;
  legType: LegType;
  bookingId?: number;
  pnr?: string;
  ticketNumbers: string[];
  passengers: IBookingPassenger[];
  resultIndex: string;
  traceId: string;
  isLCC: boolean;
  bookingStatus: BookingStatus;
  contactEmail: string;
  contactPhone: string;
  publishedFare: number;
}

const passengerSchema = new Schema<IBookingPassenger>(
  {
    paxType: { type: String, enum: ["ADT", "CHD", "INF"], required: true },
    title: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    gender: { type: String, enum: ["M", "F"], required: true },
    dob: String,
    passport: String,
    nationality: String,
    ticketNumber: String,
  },
  { _id: false },
);

const schema = new Schema<IBooking>(
  {
    correlationId: { type: String, index: true },
    legType: { type: String, enum: ["OW", "OB", "IB"], required: true, default: "OW" },
    bookingId: { type: Number, index: true, sparse: true },
    pnr: { type: String, index: true, sparse: true },
    ticketNumbers: { type: [String], default: [] },
    passengers: { type: [passengerSchema], required: true },
    resultIndex: { type: String, required: true },
    traceId: { type: String, required: true },
    isLCC: { type: Boolean, required: true },
    bookingStatus: { type: String, enum: BOOKING_STATUS, required: true, default: "Pending" },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String, required: true },
    publishedFare: { type: Number, required: true },
  },
  { timestamps: true },
);

export type BookingDoc = HydratedDocument<IBooking>;
export const Booking = model<IBooking>("Booking", schema);
