import { Request, Response, NextFunction } from "express";
import { randomUUID } from "crypto";
import { HttpError } from "../middleware/error";
import {
  searchFlights,
  fareRule,
  fareQuote,
  getSSR,
  bookFlight,
  issueTicket,
  getBookingDetail,
  TboApiError,
  TboPriceChangedError,
  TboTimeChangedError,
  BookingPassenger,
  BookParams,
  LccTicketParams,
} from "../services/tboFlightService";
import { TboFareBreakdown } from "../services/fareCalculatorService";
import { Booking } from "../models/Booking";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function wrapTboError(e: unknown): never {
  if (e instanceof TboPriceChangedError) {
    throw new HttpError(409, e.message);
  }
  if (e instanceof TboTimeChangedError) {
    throw new HttpError(409, e.message);
  }
  if (e instanceof TboApiError) {
    throw new HttpError(502, `TBO API error: ${e.message}`);
  }
  throw e;
}

// ─── POST /api/flights/search ────────────────────────────────────────────────

export async function search(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { adultCount, childCount, infantCount, journeyType, segments, directFlight, oneStopFlight, preferredAirlines } = req.body;

    if (!adultCount || adultCount < 1) throw new HttpError(400, "adultCount is required and must be >= 1");
    if (!Array.isArray(segments) || segments.length === 0) throw new HttpError(400, "segments array is required");
    if (![1, 2, 3].includes(journeyType)) throw new HttpError(400, "journeyType must be 1 (OneWay), 2 (RoundTrip), or 3 (MultiCity)");

    for (const seg of segments) {
      if (!seg.origin || !seg.destination || !seg.departureDate) {
        throw new HttpError(400, "Each segment requires origin, destination, departureDate");
      }
    }

    const result = await searchFlights({
      adultCount: Number(adultCount),
      childCount: Number(childCount ?? 0),
      infantCount: Number(infantCount ?? 0),
      journeyType,
      segments,
      directFlight,
      oneStopFlight,
      preferredAirlines,
    });

    res.json({ success: true, data: result });
  } catch (e) {
    wrapTboError(e);
    next(e);
  }
}

// ─── POST /api/flights/fare-rule ─────────────────────────────────────────────

export async function getFareRule(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { resultIndex, traceId } = req.body;
    if (!resultIndex) throw new HttpError(400, "resultIndex is required");
    if (!traceId) throw new HttpError(400, "traceId is required");

    const result = await fareRule(resultIndex, traceId);
    res.json({ success: true, data: result });
  } catch (e) {
    wrapTboError(e);
    next(e);
  }
}

// ─── POST /api/flights/fare-quote ────────────────────────────────────────────

export async function getFareQuote(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { resultIndex, traceId } = req.body;
    if (!resultIndex) throw new HttpError(400, "resultIndex is required");
    if (!traceId) throw new HttpError(400, "traceId is required");

    const result = await fareQuote(resultIndex, traceId);

    if (result.isPriceChanged || result.isTimeChanged) {
      res.status(409).json({
        success: false,
        isPriceChanged: result.isPriceChanged,
        isTimeChanged: result.isTimeChanged,
        updatedFare: result.publishedFare,
        fareBreakdown: result.fareBreakdown,
        message: result.isPriceChanged
          ? "Fare has changed. Please confirm the updated price before booking."
          : "Flight schedule has changed. Please review the updated timings.",
      });
      return;
    }

    res.json({ success: true, data: result });
  } catch (e) {
    wrapTboError(e);
    next(e);
  }
}

// ─── POST /api/flights/ssr ───────────────────────────────────────────────────

export async function getSsr(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { resultIndex, traceId } = req.body;
    if (!resultIndex) throw new HttpError(400, "resultIndex is required");
    if (!traceId) throw new HttpError(400, "traceId is required");

    const result = await getSSR(resultIndex, traceId);
    res.json({ success: true, data: result });
  } catch (e) {
    wrapTboError(e);
    next(e);
  }
}

// ─── POST /api/flights/book ──────────────────────────────────────────────────
// Non-LCC only. LCC skips Book and goes straight to Ticket.

export async function book(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const {
      resultIndex, traceId, passengers, fareBreakdown,
      contactEmail, contactPhone, gstDetails,
      // round-trip: optional second leg
      returnResultIndex, returnTraceId, returnFareBreakdown,
      publishedFare, returnPublishedFare,
    } = req.body;

    if (!resultIndex) throw new HttpError(400, "resultIndex is required");
    if (!traceId) throw new HttpError(400, "traceId is required");
    if (!Array.isArray(passengers) || passengers.length === 0) throw new HttpError(400, "passengers array is required");
    if (!Array.isArray(fareBreakdown) || fareBreakdown.length === 0) throw new HttpError(400, "fareBreakdown is required (from FareQuote response)");
    if (!contactEmail) throw new HttpError(400, "contactEmail is required");
    if (!contactPhone) throw new HttpError(400, "contactPhone is required");
    if (typeof publishedFare !== "number") throw new HttpError(400, "publishedFare is required");

    const isRoundTrip = Boolean(returnResultIndex);
    const correlationId = isRoundTrip ? randomUUID() : undefined;

    const obParams: BookParams = {
      resultIndex,
      traceId,
      fareBreakdown: fareBreakdown as TboFareBreakdown[],
      passengers: passengers as BookingPassenger[],
      contactEmail,
      contactPhone,
      gstDetails,
      legType: isRoundTrip ? "OB" : "OW",
      correlationId,
      publishedFare: Number(publishedFare),
    };

    const obResult = await bookFlight(obParams);

    // Second leg for domestic round-trip
    if (isRoundTrip) {
      if (!returnTraceId) throw new HttpError(400, "returnTraceId is required for round-trip booking");
      if (!Array.isArray(returnFareBreakdown)) throw new HttpError(400, "returnFareBreakdown is required for round-trip booking");

      const ibParams: BookParams = {
        resultIndex: returnResultIndex,
        traceId: returnTraceId,
        fareBreakdown: returnFareBreakdown as TboFareBreakdown[],
        passengers: passengers as BookingPassenger[],
        contactEmail,
        contactPhone,
        gstDetails,
        legType: "IB",
        correlationId,
        publishedFare: Number(returnPublishedFare ?? 0),
      };

      const ibResult = await bookFlight(ibParams);

      res.json({
        success: true,
        data: {
          correlationId,
          outbound: { bookingId: obResult.bookingId, bookingDocId: obResult.bookingDocId },
          inbound: { bookingId: ibResult.bookingId, bookingDocId: ibResult.bookingDocId },
        },
      });
      return;
    }

    res.json({ success: true, data: { bookingId: obResult.bookingId, bookingDocId: obResult.bookingDocId } });
  } catch (e) {
    wrapTboError(e);
    next(e);
  }
}

// ─── POST /api/flights/ticket ────────────────────────────────────────────────
// LCC: body.isLCC=true  → resultIndex + traceId + passengers + fareBreakdown required
// Non-LCC: body.isLCC=false → bookingId required (Book was called first)
// Round-trip: provide returnResultIndex / returnBookingId for IB leg

export async function ticket(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body;
    const isLCC = Boolean(body?.isLCC);

    if (isLCC) {
      // ── LCC path ──────────────────────────────────────────────────────────
      const { resultIndex, traceId, passengers, fareBreakdown, contactEmail, contactPhone, preferredCurrency } = body;

      if (!resultIndex) throw new HttpError(400, "resultIndex is required for LCC ticket");
      if (!traceId) throw new HttpError(400, "traceId is required");
      if (!Array.isArray(passengers) || passengers.length === 0) throw new HttpError(400, "passengers array is required");
      if (!Array.isArray(fareBreakdown) || fareBreakdown.length === 0) throw new HttpError(400, "fareBreakdown is required");
      if (!contactEmail) throw new HttpError(400, "contactEmail is required");
      if (!contactPhone) throw new HttpError(400, "contactPhone is required");
      if (typeof body.publishedFare !== "number") throw new HttpError(400, "publishedFare is required");

      const isRoundTrip = Boolean(body.returnResultIndex);
      const correlationId = isRoundTrip ? randomUUID() : undefined;

      const obParams: LccTicketParams = {
        isLCC: true,
        resultIndex,
        traceId,
        fareBreakdown: fareBreakdown as TboFareBreakdown[],
        passengers: passengers as BookingPassenger[],
        contactEmail,
        contactPhone,
        preferredCurrency: preferredCurrency ?? "INR",
        legType: isRoundTrip ? "OB" : "OW",
        correlationId,
        publishedFare: Number(body.publishedFare),
      };

      const obTicket = await issueTicket(obParams);

      if (isRoundTrip) {
        const { returnResultIndex, returnTraceId, returnFareBreakdown, returnPublishedFare } = body;
        if (!returnTraceId) throw new HttpError(400, "returnTraceId is required for round-trip LCC ticket");
        if (!Array.isArray(returnFareBreakdown)) throw new HttpError(400, "returnFareBreakdown is required for round-trip");

        const ibParams: LccTicketParams = {
          isLCC: true,
          resultIndex: returnResultIndex,
          traceId: returnTraceId,
          fareBreakdown: returnFareBreakdown as TboFareBreakdown[],
          passengers: passengers as BookingPassenger[],
          contactEmail,
          contactPhone,
          preferredCurrency: preferredCurrency ?? "INR",
          legType: "IB",
          correlationId,
          publishedFare: Number(returnPublishedFare ?? 0),
        };

        const ibTicket = await issueTicket(ibParams);

        res.json({
          success: true,
          data: {
            correlationId,
            outbound: { pnr: obTicket.pnr, bookingId: obTicket.bookingId, ticketNumbers: obTicket.ticketNumbers },
            inbound: { pnr: ibTicket.pnr, bookingId: ibTicket.bookingId, ticketNumbers: ibTicket.ticketNumbers },
          },
        });
        return;
      }

      res.json({
        success: true,
        data: { pnr: obTicket.pnr, bookingId: obTicket.bookingId, ticketNumbers: obTicket.ticketNumbers },
      });
      return;
    }

    // ── Non-LCC path ─────────────────────────────────────────────────────────
    const bookingId = Number(body?.bookingId);
    if (!bookingId || isNaN(bookingId)) throw new HttpError(400, "bookingId is required for non-LCC ticket");

    const obTicket = await issueTicket({ isLCC: false, bookingId });

    // Optional second leg for round-trip non-LCC
    if (body.returnBookingId) {
      const returnBookingId = Number(body.returnBookingId);
      const ibTicket = await issueTicket({ isLCC: false, bookingId: returnBookingId });

      res.json({
        success: true,
        data: {
          outbound: { pnr: obTicket.pnr, bookingId: obTicket.bookingId, ticketNumbers: obTicket.ticketNumbers },
          inbound: { pnr: ibTicket.pnr, bookingId: ibTicket.bookingId, ticketNumbers: ibTicket.ticketNumbers },
        },
      });
      return;
    }

    res.json({
      success: true,
      data: { pnr: obTicket.pnr, bookingId: obTicket.bookingId, ticketNumbers: obTicket.ticketNumbers },
    });
  } catch (e) {
    wrapTboError(e);
    next(e);
  }
}

// ─── GET /api/flights/booking/:id ────────────────────────────────────────────

export async function getBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const bookingId = Number(req.params.id);
    if (!bookingId || isNaN(bookingId)) throw new HttpError(400, "bookingId must be a number");

    const detail = await getBookingDetail(bookingId);
    const localDoc = await Booking.findOne({ bookingId }).lean();

    res.json({ success: true, data: { ...detail, localDoc: localDoc ?? undefined } });
  } catch (e) {
    wrapTboError(e);
    next(e);
  }
}

// ─── GET /api/flights/booking/correlation/:id ────────────────────────────────
// Fetch both OB and IB bookings for a round-trip by correlationId

export async function getBookingsByCorrelation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { id } = req.params;
    if (!id) throw new HttpError(400, "correlationId is required");

    const legs = await Booking.find({ correlationId: id }).lean();
    if (legs.length === 0) throw new HttpError(404, "No bookings found for this correlationId");

    res.json({ success: true, data: legs });
  } catch (e) {
    next(e);
  }
}
