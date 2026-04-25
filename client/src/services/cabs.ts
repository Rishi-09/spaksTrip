import { generateCabs, getCabById, type CabOffer, type CabType } from "@/lib/mock/cabs";
import { jitter, sleep } from "./delay";

export type { CabOffer, CabType };

export type CabSearchInput = {
  from: string;
  to: string;
  date: string;
};

export async function searchCabs(input: CabSearchInput): Promise<CabOffer[]> {
  await sleep(jitter(600));
  return generateCabs(input.from, input.to, input.date);
}

export async function getCab(id: string): Promise<CabOffer | null> {
  await sleep(jitter(250));
  return getCabById(id);
}
