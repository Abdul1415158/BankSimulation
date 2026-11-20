/**
 * BANKVERSE Economic Environment & Competitor Engine
 *
 * Simulates macro cycles, central bank monetary policy adjustments,
 * and competitor bank strategy and pricing shifts.
 */

import { clamp } from "./financial-calculator";
import { Mulberry32 } from "./prng";

export interface EconomicState {
  quarter: number;
  year: number;
  gdp_growth_rate: number; // e.g. 0.024 (2.4%)
  inflation_rate: number; // e.g. 0.031 (3.1%)
  benchmark_interest_rate: number; // Central bank policy rate (e.g. 0.045)
  unemployment_rate: number; // e.g. 0.048 (4.8%)
  market_sentiment: "bullish" | "stable" | "cautious" | "bearish" | "crisis";
}

export interface CompetitorBank {
  id: string;
  name: string;
  bank_type: string;
  market_share: number; // e.g. 0.22 (22%)
  deposit_rate: number;
  lending_rate: number;
  total_assets: number;
  reputation: number;
}

/**
 * Advance macroeconomic cycle by one quarter
 */
export function advanceMacroEconomy(
  current: EconomicState,
  prng: Mulberry32
): EconomicState {
  // Mean-reversion to baseline economy + random walk
  const gdpDrift = (0.025 - current.gdp_growth_rate) * 0.15 + prng.range(-0.008, 0.008);
  const nextGdp = clamp(current.gdp_growth_rate + gdpDrift, -0.06, 0.07);

  const inflationDrift = (0.025 - current.inflation_rate) * 0.10 + prng.range(-0.005, 0.006);
  const nextInflation = clamp(current.inflation_rate + inflationDrift, -0.01, 0.12);

  // Taylor Rule proxy for central bank rate
  const targetRate = 0.02 + nextInflation + 0.5 * (nextInflation - 0.02) + 0.5 * (nextGdp - 0.025);
  const rateAdjustment = clamp((targetRate - current.benchmark_interest_rate) * 0.25, -0.005, 0.005);
  const nextBenchmarkRate = clamp(current.benchmark_interest_rate + rateAdjustment, 0.0025, 0.12);

  // Okun's law proxy for unemployment
  const unemploymentDelta = -0.4 * (nextGdp - 0.025) + prng.range(-0.002, 0.002);
  const nextUnemployment = clamp(current.unemployment_rate + unemploymentDelta, 0.03, 0.14);

  // Market sentiment derivation
  let sentiment: EconomicState["market_sentiment"] = "stable";
  if (nextGdp < -0.01 || nextUnemployment > 0.09) {
    sentiment = "crisis";
  } else if (nextGdp < 0.01) {
    sentiment = "bearish";
  } else if (nextGdp > 0.035 && nextInflation < 0.04) {
    sentiment = "bullish";
  } else if (nextInflation > 0.06) {
    sentiment = "cautious";
  }

  const nextQuarter = (current.quarter % 4) + 1;
  const nextYear = current.quarter === 4 ? current.year + 1 : current.year;

  return {
    quarter: nextQuarter,
    year: nextYear,
    gdp_growth_rate: nextGdp,
    inflation_rate: nextInflation,
    benchmark_interest_rate: nextBenchmarkRate,
    unemployment_rate: nextUnemployment,
    market_sentiment: sentiment,
  };
}

/**
 * Update competitor banks' deposit & lending rates to match market movements
 */
export function updateCompetitorBanks(
  competitors: CompetitorBank[],
  macro: EconomicState,
  playerLendingRate: number,
  playerDepositRate: number,
  prng: Mulberry32
): CompetitorBank[] {
  return competitors.map((comp) => {
    // Competitors react to benchmark rate changes and player aggressive pricing
    const rateDrift = prng.range(-0.0025, 0.0025);
    
    // Deposit rate tracking benchmark
    const targetDepRate = macro.benchmark_interest_rate - 0.010 + rateDrift;
    const nextDepRate = clamp(targetDepRate, 0.005, 0.08);

    // Lending rate tracking benchmark + credit margin
    const targetLendRate = macro.benchmark_interest_rate + 0.035 + rateDrift;
    const nextLendRate = clamp(targetLendRate, 0.03, 0.15);

    // Market share adjustment based on competitive pricing
    let shareDelta = 0;
    if (playerDepositRate > nextDepRate + 0.005) {
      shareDelta -= 0.005; // Player takes deposit share
    } else if (playerDepositRate < nextDepRate - 0.005) {
      shareDelta += 0.005;
    }

    return {
      ...comp,
      deposit_rate: nextDepRate,
      lending_rate: nextLendRate,
      market_share: clamp(comp.market_share + shareDelta, 0.05, 0.60),
    };
  });
}
