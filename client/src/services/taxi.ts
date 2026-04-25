import {
  generateAirportTransfers,
  getAirportTransferById,
  generateOutstationOffers,
  getOutstationOfferById,
  generateSightseeingPackages,
  getSightseeingPackageById,
  searchAirports,
  searchCities,
  searchSightseeingCities,
} from "@/lib/mock/taxi";
import type {
  AirportTransferSearch,
  AirportTransferOffer,
  AirportCode,
  OutstationSearch,
  OutstationOffer,
  CityOption,
  SightseeingSearch,
  SightseeingPackage,
  SightseeingCity,
} from "@/lib/mock/taxi";
import { sleep, jitter } from "./delay";

export async function searchAirportTransfers(s: AirportTransferSearch): Promise<AirportTransferOffer[]> {
  await sleep(jitter(700));
  return generateAirportTransfers(s);
}

export async function getAirportTransfer(id: string): Promise<AirportTransferOffer | null> {
  await sleep(jitter(300));
  return getAirportTransferById(id);
}

export function searchAirportOptions(q: string): AirportCode[] {
  return searchAirports(q);
}

export async function searchOutstationOffers(s: OutstationSearch): Promise<OutstationOffer[]> {
  await sleep(jitter(700));
  return generateOutstationOffers(s);
}

export async function getOutstationOffer(id: string): Promise<OutstationOffer | null> {
  await sleep(jitter(300));
  return getOutstationOfferById(id);
}

export function searchCityOptions(q: string): CityOption[] {
  return searchCities(q);
}

export async function searchSightseeingPackages(s: SightseeingSearch): Promise<SightseeingPackage[]> {
  await sleep(jitter(700));
  return generateSightseeingPackages(s);
}

export async function getSightseeingPackage(id: string): Promise<SightseeingPackage | null> {
  await sleep(jitter(300));
  return getSightseeingPackageById(id);
}

export function searchSightseeingCityOptions(q: string): SightseeingCity[] {
  return searchSightseeingCities(q);
}
