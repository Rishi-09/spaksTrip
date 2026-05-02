import { searchStations } from "@/lib/mock/trains";
import type { Train, TrainSearchInput, Station } from "@/lib/mock/trains";

export async function searchTrains(input: TrainSearchInput): Promise<Train[]> {
  void input;
  return [];
}

export async function getTrain(id: string): Promise<Train | null> {
  void id;
  return null;
}

export function searchStationOptions(q: string): Station[] {
  return searchStations(q);
}
