/**
 * Mulberry32 — a fast, deterministic, seedable PRNG.
 *
 * Given the same seed, it will always produce the same sequence of numbers.
 * This is critical for simulation reproducibility: recording the seed per quarter
 * allows replaying any quarter's outcome identically.
 */
export function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return function () {
    let t = (s += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Derives a unique seed for a specific quarter from the master seed.
 * Ensures different quarters produce different random sequences.
 */
export function deriveQuarterSeed(
  masterSeed: number,
  year: number,
  quarter: number
): number {
  return (masterSeed ^ ((year * 4 + quarter) * 2654435761)) >>> 0;
}

/**
 * Utility: pick a random element from an array.
 */
export function pickRandom<T>(rng: () => number, arr: readonly T[]): T {
  return arr[Math.floor(rng() * arr.length)];
}

/**
 * Utility: generate a random number in a range [min, max].
 */
export function randomInRange(
  rng: () => number,
  min: number,
  max: number
): number {
  return min + rng() * (max - min);
}

/**
 * Utility: returns true with the given probability.
 */
export function chance(rng: () => number, probability: number): boolean {
  return rng() < probability;
}

/**
 * Utility: Gaussian-ish random using Box-Muller (approximate).
 * Returns a value centered on `mean` with standard deviation `std`.
 */
export function gaussianRandom(
  rng: () => number,
  mean: number,
  std: number
): number {
  const u1 = rng();
  const u2 = rng();
  const z = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2);
  return mean + z * std;
}

export class Mulberry32 {
  private rng: () => number;
  constructor(seed: number) {
    this.rng = mulberry32(seed);
  }
  next(): number {
    return this.rng();
  }
  range(min: number, max: number): number {
    return randomInRange(this.rng, min, max);
  }
  pick<T>(arr: readonly T[]): T {
    return pickRandom(this.rng, arr);
  }
  chance(probability: number): boolean {
    return chance(this.rng, probability);
  }
}
