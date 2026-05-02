import axios from "axios";
import { randomUUID } from "crypto";
import { env } from "../config/env";
import { getToken } from "./tboAuthService";
import { buildPassengerFare, TboFareBreakdown } from "./fareCalculatorService";
import { FlightSearchSession } from "../models/FlightSearchSession";
import { FareQuoteSession } from "../models/FareQuoteSession";
import { Booking, LegType } from "../models/Booking";

// ─── Error types ────────────────────────────────────────────────────────────

export class TboApiError extends Error {
  constructor(message: string, public readonly code: number = 0) {
    super(message);
    this.name = "TboApiError";
  }
}

export class TboPriceChangedError extends Error {
  constructor(public readonly updatedFare: number) {
    super("Fare has changed since last quote. Please confirm the updated price.");
    this.name = "TboPriceChangedError";
  }
}

export class TboTimeChangedError extends Error {
  constructor() {
    super("Flight schedule has changed. Please review and re-confirm.");
    this.name = "TboTimeChangedError";
  }
}

// ─── Internal types ──────────────────────────────────────────────────────────

type PaxTypeKey = "ADT" | "CHD" | "INF";

export interface BookingPassenger {
  type: PaxTypeKey;
  title: string;
  firstName: string;
  lastName: string;
  gender: "M" | "F";
  dob: string;            // "YYYY-MM-DD"
  addressLine1: string;
  city: string;
  countryCode?: string;   // default "IN"
  countryName?: string;   // default "India"
  nationality?: string;   // default "IN"
  passport?: string;
  passportExpiry?: string;
  /** Pre-formed SSR objects from /ssr endpoint; leave undefined for empty arrays */
  meal?: Record<string, unknown>;
  baggage?: Record<string, unknown>;
  seat?: Record<string, unknown>;
}

const PAX_TYPE: Record<PaxTypeKey, 1 | 2 | 3> = { ADT: 1, CHD: 2, INF: 3 };
const GENDER: Record<"M" | "F", 1 | 2> = { M: 1, F: 2 };

/** TBO convention: male infants use "Mstr" not "Mr" */
function resolveTitle(p: BookingPassenger): string {
  if (p.type === "INF" && p.gender === "M") return "Mstr";
  return p.title;
}

/** TBO date format: /Date(epochMs)/ */
function toTboDate(dateStr: string): string {
  return `/Date(${new Date(dateStr).getTime()})/`;
}

/** Sentinel value TBO expects when no passport expiry is applicable */
const TBO_NULL_DATE = "/Date(-62135596800000)/";

function mapPassenger(
  p: BookingPassenger,
  sequenceNumber: number,
  isLead: boolean,
  fareBreakdown: TboFareBreakdown[],
  contactEmail: string,
  contactPhone: string,
) {
  const paxType = PAX_TYPE[p.type];
  return {
    Title: resolveTitle(p),
    FirstName: p.firstName,
    LastName: p.lastName,
    PaxType: paxType,
    DateOfBirth: toTboDate(p.dob),
    Gender: GENDER[p.gender],
    PassportNo: p.passport ?? "",
    PassportExpiry: p.passportExpiry ? toTboDate(p.passportExpiry) : TBO_NULL_DATE,
    AddressLine1: p.addressLine1,
    AddressLine2: "",
    City: p.city,
    CountryCode: p.countryCode ?? "IN",
    CountryName: p.countryName ?? "India",
    Nationality: p.nationality ?? "IN",
    ContactNo: isLead ? contactPhone : "",
    Email: isLead ? contactEmail : "",
    IsLeadPax: isLead,
    SequenceNumber: String(sequenceNumber),
    Fare: buildPassengerFare(fareBreakdown, paxType),
    // SSR: infants cannot have baggage or seat; only meal is allowed
    Baggage: p.type !== "INF" && p.baggage ? [p.baggage] : [],
    MealDynamic: p.meal ? [p.meal] : [],
    SeatDynamic: p.type !== "INF" && p.seat ? [p.seat] : [],
    Ticket: null,
  };
}

// ─── HTTP helpers ────────────────────────────────────────────────────────────

const AIR_PATH = "/BookingEngineService_Air/AirService.svc/rest";

async function airPost(endpoint: string, payload: Record<string, unknown>) {
  const tokenId = await getToken();
  const { data } = await axios.post(
    `${env.tboApiUrl}${AIR_PATH}/${endpoint}`,
    { ...payload, TokenId: tokenId, EndUserIp: env.tboEndUserIp },
  );
  return data;
}

function assertOk(
  response: Record<string, unknown>,
  context: string,
): void {
  const err = response?.Error as { ErrorCode: number; ErrorMessage: string } | undefined;
  if (err && err.ErrorCode !== 0) {
    throw new TboApiError(err.ErrorMessage || context, err.ErrorCode);
  }
  if ("Status" in response && (response.Status as number) !== 1) {
    throw new TboApiError(`${context}: status=${response.Status}`);
  }
}

// ─── Public service functions ────────────────────────────────────────────────

export interface SearchParams {
  adultCount: number;
  childCount?: number;
  infantCount?: number;
  journeyType: 1 | 2 | 3; // 1=OneWay, 2=RoundTrip, 3=MultiCity
  segments: Array<{
    origin: string;
    destination: string;
    departureDate: string; // "YYYY-MM-DD"
    cabinClass?: number;   // 2=Economy(default), 3=PremiumEconomy, 4=Business, 6=First
  }>;
  directFlight?: boolean;
  oneStopFlight?: boolean;
  preferredAirlines?: string[];
}

export interface SearchResult {
  traceId: string;
  sessionId: string;
  obResults: unknown[];
  ibResults: unknown[];
}

export async function searchFlights(params: SearchParams): Promise<SearchResult> {
  const traceId = randomUUID();
  const tokenId = await getToken();

  const tboSegments = params.segments.map((s) => ({
    Origin: s.origin.toUpperCase(),
    Destination: s.destination.toUpperCase(),
    FlightCabinClass: s.cabinClass ?? 2,
    PreferredDepartureTime: `${s.departureDate}T00:00:00`,
    PreferredArrivalTime: `${s.departureDate}T00:00:00`,
  }));

  const { data } = await axios.post(
    `${env.tboApiUrl}${AIR_PATH}/Search`,
    {
      TokenId: tokenId,
      ClientId: env.tboClientId,
      EndUserIp: env.tboEndUserIp,
      TraceId: traceId,
      AdultCount: params.adultCount,
      ChildCount: params.childCount ?? 0,
      InfantCount: params.infantCount ?? 0,
      JourneyType: params.journeyType,
      DirectFlight: params.directFlight ?? false,
      OneStopFlight: params.oneStopFlight ?? false,
      PreferredAirlines: params.preferredAirlines ?? null,
      Segments: tboSegments,
      Sources: null,
    },
  );

  const resp = data?.Response as Record<string, unknown>;
  assertOk(resp, "Search");

  const results = (resp.Results as unknown[][]) ?? [];
  const obResults: unknown[] = results[0] ?? [];
  const ibResults: unknown[] = results[1] ?? [];

  const TRACE_TTL_MS = 15 * 60 * 1000;
  const session = await FlightSearchSession.create({
    traceId,
    tokenId,
    searchPayload: params,
    obResults,
    ibResults,
    expiresAt: new Date(Date.now() + TRACE_TTL_MS),
  });

  return { traceId, sessionId: String(session._id), obResults, ibResults };
}

// ────────────────────────────────────────────────────────────────────────────

export interface FareRuleResult {
  fareRules: unknown[];
}

export async function fareRule(resultIndex: string, traceId: string): Promise<FareRuleResult> {
  const data = await airPost("FareRule", { ResultIndex: resultIndex, TraceId: traceId });
  const resp = data?.Response as Record<string, unknown>;
  assertOk(resp, "FareRule");
  const rules = (resp?.Results as Record<string, unknown>)?.FareRules;
  return { fareRules: Array.isArray(rules) ? rules : [] };
}

// ────────────────────────────────────────────────────────────────────────────

export interface FareQuoteResult {
  traceId: string;
  resultIndex: string;
  isLCC: boolean;
  isPriceChanged: boolean;
  isTimeChanged: boolean;
  publishedFare: number;
  fareBreakdown: TboFareBreakdown[];
  quoteId: string;
}

export async function fareQuote(resultIndex: string, traceId: string): Promise<FareQuoteResult> {
  const data = await airPost("FareQuote", { ResultIndex: resultIndex, TraceId: traceId });
  const resp = data?.Response as Record<string, unknown>;
  assertOk(resp, "FareQuote");

  const results = resp?.Results as Record<string, unknown>;
  if (!results) throw new TboApiError("FareQuote returned empty results");

  const isPriceChanged = Boolean(results.IsPriceChanged);
  const isTimeChanged = Boolean(results.IsTimeChanged);
  const publishedFare = Number((results.Fare as Record<string, unknown>)?.PublishedFare ?? 0);
  const fareBreakdown = (results.FareBreakdown as TboFareBreakdown[]) ?? [];

  const TRACE_TTL_MS = 15 * 60 * 1000;
  const doc = await FareQuoteSession.create({
    traceId: (resp.TraceId as string) ?? traceId,
    resultIndex: (results.ResultIndex as string) ?? resultIndex,
    isLCC: Boolean(results.IsLCC),
    isPriceChanged,
    isTimeChanged,
    publishedFare,
    fareBreakdown,
    rawResult: results,
    expiresAt: new Date(Date.now() + TRACE_TTL_MS),
  });

  return {
    traceId: (resp.TraceId as string) ?? traceId,
    resultIndex: (results.ResultIndex as string) ?? resultIndex,
    isLCC: Boolean(results.IsLCC),
    isPriceChanged,
    isTimeChanged,
    publishedFare,
    fareBreakdown,
    quoteId: String(doc._id),
  };
}

// ────────────────────────────────────────────────────────────────────────────

export interface SsrResult {
  mealOptions: unknown[];
  seatOptions: unknown[];
  baggageOptions: unknown[];
}

export async function getSSR(resultIndex: string, traceId: string): Promise<SsrResult> {
  const data = await airPost("SSR", { ResultIndex: resultIndex, TraceId: traceId });
  const resp = data?.Response as Record<string, unknown>;
  assertOk(resp, "SSR");
  const results = resp?.Results as Record<string, unknown> | undefined;
  return {
    mealOptions: (results?.Meal as unknown[]) ?? [],
    seatOptions: (results?.SeatDynamic as unknown[]) ?? [],
    baggageOptions: (results?.Baggage as unknown[]) ?? [],
  };
}

// ────────────────────────────────────────────────────────────────────────────

export interface BookParams {
  resultIndex: string;
  traceId: string;
  fareBreakdown: TboFareBreakdown[];
  passengers: BookingPassenger[];
  contactEmail: string;
  contactPhone: string;
  gstDetails?: {
    stateName?: string;
    tin?: string;
    companyName?: string;
    companyAddress?: string;
  };
  legType?: LegType;
  correlationId?: string;
  publishedFare: number;
}

export interface BookResult {
  bookingId: number;
  bookingDocId: string;
}

export async function bookFlight(params: BookParams): Promise<BookResult> {
  const tboPassengers = params.passengers.map((p, i) =>
    mapPassenger(p, i + 1, i === 0, params.fareBreakdown, params.contactEmail, params.contactPhone),
  );

  const data = await airPost("Book", {
    ResultIndex: params.resultIndex,
    TraceId: params.traceId,
    Passengers: tboPassengers,
    GSTDetails: {
      StateName: params.gstDetails?.stateName ?? "",
      TIN: params.gstDetails?.tin ?? "",
      CompanyName: params.gstDetails?.companyName ?? "",
      CompanyAddress: params.gstDetails?.companyAddress ?? "",
    },
  });

  // TBO Book response has a double-nested Response.Response
  const outer = data?.Response as Record<string, unknown>;
  assertOk(outer, "Book");
  const inner = outer?.Response as Record<string, unknown>;
  if (!inner) throw new TboApiError("Book: missing inner response");
  assertOk(inner, "Book inner");

  const bookingId = Number(inner.BookingId);
  if (!bookingId) throw new TboApiError("Book: no BookingId returned");

  const doc = await Booking.create({
    correlationId: params.correlationId,
    legType: params.legType ?? "OW",
    bookingId,
    resultIndex: params.resultIndex,
    traceId: params.traceId,
    isLCC: false,
    bookingStatus: "Booked",
    contactEmail: params.contactEmail,
    contactPhone: params.contactPhone,
    publishedFare: params.publishedFare,
    passengers: params.passengers.map((p) => ({
      paxType: p.type,
      title: resolveTitle(p),
      firstName: p.firstName,
      lastName: p.lastName,
      gender: p.gender,
      dob: p.dob,
      passport: p.passport,
      nationality: p.nationality,
    })),
  });

  return { bookingId, bookingDocId: String(doc._id) };
}

// ────────────────────────────────────────────────────────────────────────────

export interface LccTicketParams {
  isLCC: true;
  resultIndex: string;
  traceId: string;
  fareBreakdown: TboFareBreakdown[];
  passengers: BookingPassenger[];
  contactEmail: string;
  contactPhone: string;
  preferredCurrency?: string;
  legType?: LegType;
  correlationId?: string;
  publishedFare: number;
}

export interface NonLccTicketParams {
  isLCC: false;
  bookingId: number;
}

export type TicketParams = LccTicketParams | NonLccTicketParams;

export interface TicketResult {
  bookingId: number;
  pnr: string;
  ticketNumbers: string[];
  bookingDocId?: string;
}

export async function issueTicket(params: TicketParams): Promise<TicketResult> {
  if (!params.isLCC) {
    return issueNonLccTicket(params.bookingId);
  }
  return issueLccTicket(params);
}

async function issueLccTicket(params: LccTicketParams): Promise<TicketResult> {
  const tboPassengers = params.passengers.map((p, i) =>
    mapPassenger(p, i + 1, i === 0, params.fareBreakdown, params.contactEmail, params.contactPhone),
  );

  const data = await airPost("Ticket", {
    ResultIndex: params.resultIndex,
    TraceId: params.traceId,
    PreferredCurrency: params.preferredCurrency ?? "INR",
    IsBaseCurrencyRequired: false,
    Passengers: tboPassengers,
  });

  const outer = data?.Response as Record<string, unknown>;
  assertOk(outer, "Ticket(LCC)");
  const inner = outer?.Response as Record<string, unknown>;
  if (!inner) throw new TboApiError("Ticket(LCC): missing inner response");
  assertOk(inner, "Ticket(LCC) inner");

  const bookingId = Number(inner.BookingId);
  const pnr = (inner.PNR as string) ?? "";
  const ticketNumbers = extractTicketNumbers(inner);

  const doc = await Booking.create({
    correlationId: params.correlationId,
    legType: params.legType ?? "OW",
    bookingId,
    pnr,
    ticketNumbers,
    resultIndex: params.resultIndex,
    traceId: params.traceId,
    isLCC: true,
    bookingStatus: "Ticketed",
    contactEmail: params.contactEmail,
    contactPhone: params.contactPhone,
    publishedFare: params.publishedFare,
    passengers: params.passengers.map((p) => ({
      paxType: p.type,
      title: resolveTitle(p),
      firstName: p.firstName,
      lastName: p.lastName,
      gender: p.gender,
      dob: p.dob,
      passport: p.passport,
      nationality: p.nationality,
    })),
  });

  return { bookingId, pnr, ticketNumbers, bookingDocId: String(doc._id) };
}

async function issueNonLccTicket(bookingId: number): Promise<TicketResult> {
  const data = await airPost("Ticket", { BookingId: bookingId });

  const outer = data?.Response as Record<string, unknown>;
  assertOk(outer, "Ticket(NonLCC)");
  const inner = outer?.Response as Record<string, unknown>;
  if (!inner) throw new TboApiError("Ticket(NonLCC): missing inner response");
  assertOk(inner, "Ticket(NonLCC) inner");

  const pnr = (inner.PNR as string) ?? "";
  const ticketNumbers = extractTicketNumbers(inner);

  await Booking.findOneAndUpdate(
    { bookingId },
    { $set: { pnr, ticketNumbers, bookingStatus: "Ticketed" } },
  );

  return { bookingId, pnr, ticketNumbers };
}

function extractTicketNumbers(inner: Record<string, unknown>): string[] {
  const passengers = (inner.Passengers as Array<Record<string, unknown>>) ?? [];
  return passengers.flatMap((pax) => {
    const tickets = (pax.Ticket as Array<Record<string, unknown>>) ?? [];
    return tickets.map((t) => (t.TicketNumber as string) ?? "").filter(Boolean);
  });
}

// ────────────────────────────────────────────────────────────────────────────

export interface BookingDetailResult {
  bookingId: number;
  pnr: string;
  bookingStatus: string;
  passengers: unknown[];
  flightItinerary: unknown;
}

export async function getBookingDetail(bookingId: number): Promise<BookingDetailResult> {
  const data = await airPost("GetBookingDetail", { BookingId: bookingId });

  // GetBookingDetail uses a different wrapper: GetBookingDetailResult
  const result = data?.GetBookingDetailResult as Record<string, unknown>;
  if (!result) throw new TboApiError("GetBookingDetail: empty response");
  assertOk(result, "GetBookingDetail");

  return {
    bookingId: Number(result.BookingId),
    pnr: (result.PNR as string) ?? "",
    bookingStatus: (result.BookingStatus as string) ?? "Unknown",
    passengers: (result.Passengers as unknown[]) ?? [],
    flightItinerary: result.FlightItinerary ?? null,
  };
}
