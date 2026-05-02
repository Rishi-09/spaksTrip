import { Router } from "express";
import {
  search,
  getFareRule,
  getFareQuote,
  getSsr,
  book,
  ticket,
  getBooking,
  getBookingsByCorrelation,
} from "../controllers/flight.controller";

const router = Router();

router.post("/search", search);
router.post("/fare-rule", getFareRule);
router.post("/fare-quote", getFareQuote);
router.post("/ssr", getSsr);
router.post("/book", book);
router.post("/ticket", ticket);
router.get("/booking/correlation/:id", getBookingsByCorrelation);
router.get("/booking/:id", getBooking);

export default router;
