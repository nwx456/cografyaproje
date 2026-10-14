export type AnimalId = "geyik" | "tavsan" | "cakal" | "tilki" | "domuz";

export type AnimalSpec = {
  id: AnimalId;
  name: string;
  scareMinHz: number;
  scareMaxHz: number;
  scareLabel: string;
};

export const ANIMALS: AnimalSpec[] = [
  {
    id: "geyik",
    name: "Geyik",
    scareMinHz: 50,
    scareMaxHz: 200,
    scareLabel: "50–200 Hz ağaç devrilme sesi",
  },
  {
    id: "cakal",
    name: "Çakal",
    scareMinHz: 200,
    scareMaxHz: 800,
    scareLabel: "200–800 Hz yangın uğultusu",
  },
  {
    id: "tilki",
    name: "Tilki",
    scareMinHz: 300,
    scareMaxHz: 1200,
    scareLabel: "300 Hz–1,2 kHz ağaç çatırdaması",
  },
  {
    id: "domuz",
    name: "Yaban domuzu",
    scareMinHz: 1000,
    scareMaxHz: 4000,
    scareLabel: "1–4 kHz dal kırılması ve çatırtı",
  },
  {
    id: "tavsan",
    name: "Tavşan",
    scareMinHz: 3000,
    scareMaxHz: 8000,
    scareLabel: "3–8 kHz kısa alarm çağrısı",
  },
];

export type RoundSpec = {
  frequencyHz: number;
  fleeingIds: AnimalId[];
};

/** Karışık sıra: 120, 500, 900, 2k, 3.5k, 5k */
export const ROUNDS: RoundSpec[] = [
  { frequencyHz: 120, fleeingIds: ["geyik"] },
  { frequencyHz: 500, fleeingIds: ["cakal", "tilki"] },
  { frequencyHz: 900, fleeingIds: ["tilki"] },
  { frequencyHz: 2000, fleeingIds: ["domuz"] },
  { frequencyHz: 3500, fleeingIds: ["domuz", "tavsan"] },
  { frequencyHz: 5000, fleeingIds: ["tavsan"] },
];

export function formatFrequency(hz: number): string {
  if (hz >= 1000) {
    const k = hz / 1000;
    return k % 1 === 0 ? `${k} kHz` : `${k.toFixed(1).replace(".", ",")} kHz`;
  }
  return `${hz} Hz`;
}

export function animalFleesAtFrequency(animal: AnimalSpec, hz: number): boolean {
  return hz >= animal.scareMinHz && hz <= animal.scareMaxHz;
}

export function fleeingAnimalsAtHz(hz: number): AnimalSpec[] {
  return ANIMALS.filter((a) => animalFleesAtFrequency(a, hz));
}
