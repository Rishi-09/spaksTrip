import {
  generateHotels,
  getHotelById,
  searchCities,
  type Amenity,
  type Hotel,
  type HotelSearchInput,
} from "@/lib/mock/hotels";
import { jitter, sleep } from "./delay";

export type { Amenity, Hotel, HotelSearchInput };
export type { Room, HotelReview, City, HotelSearchInput as HotelInput } from "@/lib/mock/hotels";

export type HotelSortBy = "price" | "rating" | "stars" | "popularity";

export type HotelFilters = {
  stars?: number[];
  maxPrice?: number;
  amenities?: Amenity[];
  propertyTypes?: string[];
  refundableOnly?: boolean;
};

export function applyHotelFilters(hotels: Hotel[], f: HotelFilters): Hotel[] {
  return hotels.filter((h) => {
    if (f.stars?.length && !f.stars.includes(h.starRating)) return false;
    if (f.maxPrice && h.lowestPrice > f.maxPrice) return false;
    if (f.amenities?.length && !f.amenities.every((a) => h.amenities.includes(a))) return false;
    if (f.propertyTypes?.length && !f.propertyTypes.includes(h.propertyType)) return false;
    if (f.refundableOnly && !h.rooms.some((r) => r.refundable)) return false;
    return true;
  });
}

export function sortHotels(hotels: Hotel[], by: HotelSortBy): Hotel[] {
  return [...hotels].sort((a, b) => {
    if (by === "price") return a.lowestPrice - b.lowestPrice;
    if (by === "rating") return b.reviewScore - a.reviewScore;
    if (by === "stars") return b.starRating - a.starRating;
    // popularity: sort by review count descending
    return b.reviewCount - a.reviewCount;
  });
}

export async function searchHotels(
  input: HotelSearchInput,
): Promise<{ hotels: Hotel[]; minPrice: number; maxPrice: number }> {
  await sleep(jitter(700));
  const hotels = generateHotels(input);
  const prices = hotels.map((h) => h.lowestPrice);
  return {
    hotels,
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices),
  };
}

export async function getHotel(id: string): Promise<Hotel | null> {
  await sleep(jitter(350));
  return getHotelById(id);
}

export async function searchCityOptions(q: string) {
  await sleep(100);
  return searchCities(q);
}
