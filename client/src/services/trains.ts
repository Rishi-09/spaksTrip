import { generateTrains, getTrainById, searchStations } from "@/lib/mock/trains";
import type { Train, TrainSearchInput, Station } from "@/lib/mock/trains";
import { sleep, jitter } from "./delay";

export async function searchTrains(input: TrainSearchInput): Promise<Train[]> {
  await sleep(jitter(750));
  return generateTrains(input);
}

export async function getTrain(id: string): Promise<Train | null> {
  await sleep(jitter(350));
  return getTrainById(id);
}

export function searchStationOptions(q: string): Station[] {
  return searchStations(q);
}
