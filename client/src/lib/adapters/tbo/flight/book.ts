import "server-only";
import { withRetry, tboBase, tboApiUrl } from "../auth";
import { assertTboSuccess, TboFareExpiredError, TboBookingFailedError } from "../errors";
import { getTrace } from "../traceCache";
import { logRequest, logResponse, logError } from "../log";
import type { TboFlightBookResponse, TboPassengerRequest, TboFare } from "../types";

// ─── Input types ──────────────────────────────────────────────────────────────

export interface BookingPassenger {
  type: "ADT" | "CHD" | "INF";
  title: string;
  firstName: string;
  lastName: string;
  gender: "M" | "F";
  dob: string;           // YYYY-MM-DD
  passport?: string;
  passportExpiry?: string;
  nationality?: string;
  meal?: string;
  seat?: string;
}

export interface TboBookFlightInput {
  resultIndex: string;
  passengers: BookingPassenger[];
  contactEmail: string;
  contactPhone: string;
  contactCountryCode: string;
  mealCodes?: string[];
  seatCodes?: string[];
}

export interface TboBookFlightOutput {
  bookingId: number;
  pnr: string;
  isPriceChanged: boolean;
}

// ─── Passenger type mapping ───────────────────────────────────────────────────

const PAX_TYPE: Record<"ADT" | "CHD" | "INF", number> = { ADT: 1, CHD: 2, INF: 3 };
const GENDER: Record<"M" | "F", number> = { M: 1, F: 2 };

function dobToTbo(dob: string): string {
  // Input: "YYYY-MM-DD" → Output: "YYYY-MM-DDT00:00:00"
  return dob.includes("T") ? dob : `${dob}T00:00:00`;
}

function buildEmptyFare(): TboFare {
  return {
    Currency: "INR",
    BaseFare: 0,
    Tax: 0,
    TaxBreakup: [],
    YQTax: 0,
    AdditionalTxnFeeOfrd: 0,
    AdditionalTxnFeePub: 0,
    PGCharge: 0,
    OtherCharges: 0,
    ChargeBU: [],
    Discount: 0,
    PublishedFare: 0,
    CommissionEarned: 0,
    PLBEarned: 0,
    IncentiveEarned: 0,
    OfferedFare: 0,
    TdsOnCommission: 0,
    TdsOnPLB: 0,
    TdsOnIncentive: 0,
    ServiceFee: 0,
  };
}

function mapPassenger(p: BookingPassenger, isLead: boolean): TboPassengerRequest {
  return {
    Title: p.title,
    FirstName: p.firstName,
    LastName: p.lastName,
    PaxType: PAX_TYPE[p.type],
    DateOfBirth: dobToTbo(p.dob),
    Gender: GENDER[p.gender],
    PassportNo: p.passport ?? "",
    PassportExpiry: p.passportExpiry ? dobToTbo(p.passportExpiry) : "2030-01-01T00:00:00",
    AddressLine1: "",
    City: "",
    CountryCode: p.nationality ?? "IN",
    NationalityCode: p.nationality ?? "IN",
    ContactNo: "",
    Email: "",
    IsLeadPax: isLead,
    GSTCompanyAddress: "",
    GSTCompanyContactNumber: "",
    GSTCompanyName: "",
    GSTNumber: "",
    GSTCompanyEmail: "",
    Fare: buildEmptyFare(),
    Baggage: [],
    MealDynamic: [],
    SeatDynamic: [],
  };
}

// ─── Public ───────────────────────────────────────────────────────────────────

export async function tboBookFlight(input: TboBookFlightInput): Promise<TboBookFlightOutput> {
  const traceId = getTrace(input.resultIndex);
  if (!traceId) throw new TboFareExpiredError();

  const doBook = async (token: string): Promise<TboBookFlightOutput> => {
    const passengers: TboPassengerRequest[] = input.passengers.map((p, i) => {
      const mapped = mapPassenger(p, i === 0);
      if (i === 0) {
        // Lead pax carries contact details
        mapped.Email = input.contactEmail;
        mapped.ContactNo = input.contactPhone;
      }
      return mapped;
    });

    const url = tboApiUrl("BookingEngineService_Air/AirService.svc/rest/Book");
    const reqBody = {
      ...tboBase(token),
      ResultIndex: input.resultIndex,
      TraceId: traceId,
      Passengers: passengers,
    };
    logRequest("Flight Book", url, { ...reqBody, TokenId: "***" });

    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
    } catch (err) {
      logError("Flight Book", err);
      throw err;
    }

    const text = await res.text();
    let data: TboFlightBookResponse;
    try { data = JSON.parse(text); }
    catch { throw new Error(`TBO Book non-JSON (HTTP ${res.status}): ${text.slice(0, 200)}`); }

    logResponse("Flight Book", res.status, data);
    if (!res.ok) throw new Error(`TBO Book HTTP ${res.status}`);
    assertTboSuccess(data.Response?.Error);

    const itinerary = data.Response?.FlightItinerary;
    if (!itinerary?.BookingId) throw new TboBookingFailedError("No BookingId returned");

    return {
      bookingId: itinerary.BookingId,
      pnr: itinerary.PNR ?? "",
      isPriceChanged: itinerary.IsPriceChanged ?? false,
    };
  };

  // Retry once on booking failure (TBO recommendation)
  try {
    return await withRetry(doBook);
  } catch (err) {
    if (err instanceof TboBookingFailedError) {
      return withRetry(doBook);
    }
    throw err;
  }
}
