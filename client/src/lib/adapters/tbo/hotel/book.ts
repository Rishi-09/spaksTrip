import "server-only";
import { withRetry, tboBase, tboApiUrl } from "../auth";
import { assertTboSuccess, TboBookingFailedError } from "../errors";
import { getTrace } from "../traceCache";
import { logRequest, logResponse, logError } from "../log";
import type { TboHotelBookResponse } from "../types";

// ─── Input / Output ───────────────────────────────────────────────────────────

export interface HotelBookGuest {
  firstName: string;
  lastName: string;
}

export interface TboHotelBookInput {
  hotelCode: string;
  roomTypeCode: string;
  ratePlanCode: string;
  checkIn: string;     // YYYY-MM-DD
  checkOut: string;    // YYYY-MM-DD
  rooms: number;
  adults: number;
  children: number;
  guests: HotelBookGuest[];
  contactEmail: string;
  contactPhone: string;
}

export interface TboHotelBookOutput {
  bookingId: string;
  confirmationNumber: string;
  bookingStatus: string;
}

// ─── Date helper ─────────────────────────────────────────────────────────────

function toTboDate(yyyymmdd: string): string {
  const [y, m, d] = yyyymmdd.split("-");
  return `${d}/${m}/${y}`;
}

// ─── Public ───────────────────────────────────────────────────────────────────

export async function tboBookHotel(input: TboHotelBookInput): Promise<TboHotelBookOutput> {
  const traceId = getTrace(input.hotelCode) ?? "";

  const doBook = async (token: string): Promise<TboHotelBookOutput> => {
    const guestDetails = input.guests.map((g, i) => ({
      Title: "Mr",
      FirstName: g.firstName,
      LastName: g.lastName,
      Email: i === 0 ? input.contactEmail : "",
      PhoneNo: i === 0 ? input.contactPhone : "",
    }));

    const url = tboApiUrl("HotelAPI/Hotel/Book");
    const reqBody = {
      ...tboBase(token),
      ...(traceId ? { TraceId: traceId } : {}),
      ResultToken: input.hotelCode,
      HotelCode: input.hotelCode,
      CheckInDate: toTboDate(input.checkIn),
      CheckOutDate: toTboDate(input.checkOut),
      NoOfRooms: input.rooms,
      GuestNationality: "IN",
      RoomDetails: [
        {
          RoomTypeCode: input.roomTypeCode,
          RatePlanCode: input.ratePlanCode,
          BedTypeCode: null,
          SmokingPreference: 0,
          Adults: Math.ceil(input.adults / input.rooms),
          Children: Math.ceil(input.children / input.rooms),
          ChildrenAges: [],
          Supplements: [],
        },
      ],
      GuestDetails: guestDetails,
      AddressLine1: "",
      AddressLine2: "",
      Email: input.contactEmail,
      PhoneNo: input.contactPhone,
    };
    logRequest("Hotel Book", url, { ...reqBody, TokenId: "***" });

    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reqBody),
      });
    } catch (err) {
      logError("Hotel Book", err);
      throw err;
    }

    const text = await res.text();
    let data: TboHotelBookResponse;
    try { data = JSON.parse(text); }
    catch { throw new Error(`TBO HotelBook non-JSON (HTTP ${res.status}): ${text.slice(0, 200)}`); }

    logResponse("Hotel Book", res.status, data);
    if (!res.ok) throw new Error(`TBO Hotel/Book HTTP ${res.status}`);
    assertTboSuccess(data.BookResult?.Error);

    const detail = data.BookResult?.HotelBookingDetail;
    if (!detail?.BookingId) throw new TboBookingFailedError("No hotel BookingId returned");

    return {
      bookingId: detail.BookingId,
      confirmationNumber: detail.ConfirmationNumber ?? "",
      bookingStatus: detail.BookingStatus ?? "PENDING",
    };
  };

  try {
    return await withRetry(doBook);
  } catch (err) {
    if (err instanceof TboBookingFailedError) {
      return withRetry(doBook);
    }
    throw err;
  }
}
