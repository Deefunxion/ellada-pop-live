// ============================================================================
// Greece Population Data
// ----------------------------------------------------------------------------
// PLACEHOLDER — TO BE REPLACED WITH OFFICIAL ELSTAT DATA
// All numbers below are indicative placeholders based on public sources.
// Update `LIVE_CONFIG` and the data arrays with the latest ELSTAT figures.
// ============================================================================

export type PopulationPoint = {
  year: number;
  population?: number;
  births?: number;
  deaths?: number;
  netMigration?: number;
  source?: string;
};

// ---------------------------------------------------------------------------
// LIVE SIMULATION CONFIG
// PLACEHOLDER — TO BE REPLACED WITH OFFICIAL ELSTAT DATA
// ---------------------------------------------------------------------------
export const LIVE_CONFIG = {
  // Reference date & population anchor (Europe/Athens).
  referenceDateISO: "2025-01-01T00:00:00+02:00",
  referencePopulation: 10_400_000,

  // Latest annual vital rates.
  birthsPerYear: 71_500,
  deathsPerYear: 128_000,
  netMigrationPerYear: 20_000,
} as const;

export const SECONDS_PER_YEAR = 365 * 24 * 60 * 60; // 31,536,000

// ---------------------------------------------------------------------------
// HISTORICAL POPULATION (census + estimates)
// PLACEHOLDER — TO BE REPLACED WITH OFFICIAL ELSTAT DATA
// ---------------------------------------------------------------------------
export const POPULATION_HISTORY: PopulationPoint[] = [
  { year: 1821, population: 938_000, source: "Εκτίμηση" },
  { year: 1861, population: 1_096_810, source: "Απογραφή 1861" },
  { year: 1879, population: 1_679_470, source: "Απογραφή 1879" },
  { year: 1889, population: 2_187_208, source: "Απογραφή 1889" },
  { year: 1896, population: 2_433_806, source: "Απογραφή 1896" },
  { year: 1907, population: 2_631_952, source: "Απογραφή 1907" },
  { year: 1920, population: 5_016_889, source: "Απογραφή 1920" },
  { year: 1928, population: 6_204_684, source: "Απογραφή 1928" },
  { year: 1940, population: 7_344_860, source: "Απογραφή 1940" },
  { year: 1951, population: 7_632_801, source: "Απογραφή 1951" },
  { year: 1961, population: 8_388_553, source: "Απογραφή 1961" },
  { year: 1971, population: 8_768_641, source: "Απογραφή 1971" },
  { year: 1981, population: 9_739_589, source: "Απογραφή 1981" },
  { year: 1991, population: 10_259_900, source: "Απογραφή 1991" },
  { year: 2001, population: 10_964_020, source: "Απογραφή 2001" },
  { year: 2011, population: 10_816_286, source: "Απογραφή 2011" },
  { year: 2021, population: 10_432_481, source: "Απογραφή 2021" },
  { year: 2025, population: LIVE_CONFIG.referencePopulation, source: "Εκτίμηση" },
];

// ---------------------------------------------------------------------------
// ANNUAL BIRTHS / DEATHS (systematic vital statistics from 1932)
// PLACEHOLDER — TO BE REPLACED WITH OFFICIAL ELSTAT DATA
// ---------------------------------------------------------------------------
export const VITAL_STATS: PopulationPoint[] = [
  { year: 1932, births: 191_000, deaths: 121_000 },
  { year: 1940, births: 189_000, deaths: 108_000 },
  { year: 1950, births: 151_000, deaths: 58_000 },
  { year: 1960, births: 157_000, deaths: 63_000 },
  { year: 1970, births: 145_000, deaths: 74_000 },
  { year: 1980, births: 148_000, deaths: 87_000 },
  { year: 1990, births: 102_000, deaths: 94_000 },
  { year: 2000, births: 103_000, deaths: 105_000 },
  { year: 2005, births: 107_500, deaths: 105_100 },
  { year: 2010, births: 114_766, deaths: 109_084 },
  { year: 2011, births: 106_428, deaths: 111_099 }, // crossover
  { year: 2013, births: 94_134, deaths: 111_794 },
  { year: 2015, births: 91_847, deaths: 121_212 },
  { year: 2017, births: 88_553, deaths: 124_105 },
  { year: 2019, births: 83_756, deaths: 124_986 },
  { year: 2020, births: 84_764, deaths: 131_084 },
  { year: 2021, births: 85_346, deaths: 143_923 },
  { year: 2022, births: 76_364, deaths: 141_032 },
  { year: 2023, births: 71_455, deaths: 128_355 },
  { year: 2024, births: 71_500, deaths: 128_000 },
];

export const CROSSOVER_YEAR = 2011;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Linear interpolation of population for any year within the history range. */
export function interpolatePopulation(year: number): number {
  const pts = POPULATION_HISTORY.filter((p) => p.population != null);
  if (year <= pts[0].year) return pts[0].population!;
  if (year >= pts[pts.length - 1].year) return pts[pts.length - 1].population!;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i];
    const b = pts[i + 1];
    if (year >= a.year && year <= b.year) {
      const t = (year - a.year) / (b.year - a.year);
      return a.population! + t * (b.population! - a.population!);
    }
  }
  return pts[pts.length - 1].population!;
}

/** Population at any instant (ms epoch) using continuous rate accumulation. */
export function livePopulationAt(nowMs: number): number {
  const refMs = new Date(LIVE_CONFIG.referenceDateISO).getTime();
  const deltaSec = (nowMs - refMs) / 1000;
  const perSec =
    (LIVE_CONFIG.birthsPerYear -
      LIVE_CONFIG.deathsPerYear +
      LIVE_CONFIG.netMigrationPerYear) /
    SECONDS_PER_YEAR;
  return LIVE_CONFIG.referencePopulation + deltaSec * perSec;
}

/** Start-of-day timestamp in Europe/Athens for the given instant. */
export function startOfAthensDay(nowMs: number): number {
  // Athens = UTC+2 (winter) / UTC+3 (summer). We approximate using the
  // browser's local offset if the user is in Athens; otherwise fall back
  // to a fixed +02:00 offset. Good enough for a "today so far" counter.
  const d = new Date(nowMs);
  const athensStr = d.toLocaleString("en-US", { timeZone: "Europe/Athens" });
  const athensDate = new Date(athensStr);
  athensDate.setHours(0, 0, 0, 0);
  const diff = d.getTime() - new Date(athensStr).getTime();
  return athensDate.getTime() + diff;
}
