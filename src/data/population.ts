// ============================================================================
// Greece Population Data — OFFICIAL ELSTAT / EUROSTAT DATASET (v2)
// ----------------------------------------------------------------------------
// Replaces the Lovable placeholders. Compiled 2026-07-08 from:
//  - ELSTAT vital statistics timeseries XLSX 1932-2024 (SPO03/2024),
//    parsed programmatically, validated against 7 documented anchors.
//  - ELSTAT announcement 18.12.2025: Estimated Population 1.1.2025,
//    Migration Flows 2024, revised series 2011-2024.
//    https://www.statistics.gr/documents/20181/d8439ad7-d043-2235-f4b4-8466c3c9cd56
//  - ELSTAT census album 1821-2021 (individual old-census values pending
//    verification against the primary PDF — see notes).
//  - Eurostat demo_pjan (updated 03.07.2026) for cross-checking.
// Full provenance, verification flags and methodology: see
// docs/population-canonical.ts in this repo.
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
// LIVE SIMULATION CONFIG — OFFICIAL FIGURES
// ELSTAT 18.12.2025: resident-based flows for 2024, population 1.1.2025.
// Net change: 68,309 - 125,873 + 54,135 = -3,429 persons/year (~ -9.39/day).
// ---------------------------------------------------------------------------
export const LIVE_CONFIG = {
  referenceDateISO: "2025-01-01T00:00:00+02:00",
  referencePopulation: 10_372_335,

  birthsPerYear: 68_309, // resident-based, year 2024
  deathsPerYear: 125_873, // resident-based, year 2024
  netMigrationPerYear: 54_135, // 132,149 in - 78,014 out, year 2024
} as const;

export const SECONDS_PER_YEAR = 365 * 24 * 60 * 60; // 31,536,000

// ---------------------------------------------------------------------------
// HISTORICAL POPULATION — official censuses 1828-2021 + estimate 1.1.2025.
// De facto basis through 2001; PERMANENT (usual-resident) basis from 2011 —
// the 2001->2011 dip is partly a methodology change, not only real decline.
// Border-change jumps: 1870 (Ionian Is. 1864), 1889 (Thessaly 1881),
// 1920 (New Lands 1913), 1928 (Asia Minor exchange), 1951 (Dodecanese 1947).
// ---------------------------------------------------------------------------
export const POPULATION_HISTORY: PopulationPoint[] = [
  { year: 1821, population: 938_765, source: "Αναδρομική εκτίμηση" },
  { year: 1828, population: 753_400, source: "Απογραφή Καποδίστρια" },
  { year: 1834, population: 693_592, source: "Απογραφή 1834" },
  { year: 1838, population: 752_077, source: "Απογραφή 1838" },
  { year: 1840, population: 850_246, source: "Απογραφή 1840" },
  { year: 1848, population: 986_731, source: "Απογραφή 1848" },
  { year: 1856, population: 1_062_527, source: "Απογραφή 1856" },
  { year: 1861, population: 1_096_810, source: "Απογραφή 1861" },
  { year: 1870, population: 1_457_894, source: "Απογραφή 1870 · +Επτάνησα (1864)" },
  { year: 1879, population: 1_679_470, source: "Απογραφή 1879" },
  { year: 1889, population: 2_187_208, source: "Απογραφή 1889 · +Θεσσαλία/Άρτα (1881)" },
  { year: 1896, population: 2_433_806, source: "Απογραφή 1896" },
  { year: 1907, population: 2_631_952, source: "Απογραφή 1907" },
  { year: 1920, population: 5_016_889, source: "Απογραφή 1920 · +Νέες Χώρες (1913)" },
  { year: 1928, population: 6_204_684, source: "Απογραφή 1928 · Ανταλλαγή πληθυσμών" },
  { year: 1940, population: 7_344_860, source: "Απογραφή 1940" },
  { year: 1951, population: 7_632_801, source: "Απογραφή 1951 · +Δωδεκάνησα (1947)" },
  { year: 1961, population: 8_388_553, source: "Απογραφή 1961" },
  { year: 1971, population: 8_768_641, source: "Απογραφή 1971" },
  { year: 1981, population: 9_740_417, source: "Απογραφή 1981" },
  { year: 1991, population: 10_259_900, source: "Απογραφή 1991" },
  { year: 2001, population: 10_964_020, source: "Απογραφή 2001 (de facto)" },
  { year: 2011, population: 10_816_286, source: "Απογραφή 2011 (μόνιμος)" },
  { year: 2021, population: 10_482_487, source: "Απογραφή 2021 (μόνιμος)" },
  {
    year: 2025,
    population: LIVE_CONFIG.referencePopulation,
    source: "ΕΛΣΤΑΤ εκτίμηση 1.1.2025",
  },
];

// ---------------------------------------------------------------------------
// ANNUAL BIRTHS / DEATHS — complete official ELSTAT series 1932-2024.
// Event-based registry statistics (SPO03/2024 timeseries XLSX).
// 1941-1954: no published data (WWII occupation, civil war) — entries kept
// without values so the chart shows a real break, never an interpolation.
// Deaths 2023 carry ELSTAT's own footnote "Αναθεωρημένα στοιχεία".
// ---------------------------------------------------------------------------
export const VITAL_STATS: PopulationPoint[] = [
  { year: 1932, births: 185_523, deaths: 117_593 },
  { year: 1933, births: 189_583, deaths: 111_447 },
  { year: 1934, births: 208_929, deaths: 100_651 },
  { year: 1935, births: 192_511, deaths: 101_416 },
  { year: 1936, births: 193_343, deaths: 105_005 },
  { year: 1937, births: 183_878, deaths: 105_674 },
  { year: 1938, births: 184_509, deaths: 93_766 },
  { year: 1939, births: 178_852, deaths: 100_459 },
  { year: 1940, births: 179_500, deaths: 93_830 },
  { year: 1941 }, // κενό: Κατοχή/Εμφύλιος — καμία δημοσιευμένη τιμή
  { year: 1942 }, // κενό: Κατοχή/Εμφύλιος — καμία δημοσιευμένη τιμή
  { year: 1943 }, // κενό: Κατοχή/Εμφύλιος — καμία δημοσιευμένη τιμή
  { year: 1944 }, // κενό: Κατοχή/Εμφύλιος — καμία δημοσιευμένη τιμή
  { year: 1945 }, // κενό: Κατοχή/Εμφύλιος — καμία δημοσιευμένη τιμή
  { year: 1946 }, // κενό: Κατοχή/Εμφύλιος — καμία δημοσιευμένη τιμή
  { year: 1947 }, // κενό: Κατοχή/Εμφύλιος — καμία δημοσιευμένη τιμή
  { year: 1948 }, // κενό: Κατοχή/Εμφύλιος — καμία δημοσιευμένη τιμή
  { year: 1949 }, // κενό: Κατοχή/Εμφύλιος — καμία δημοσιευμένη τιμή
  { year: 1950 }, // κενό: Κατοχή/Εμφύλιος — καμία δημοσιευμένη τιμή
  { year: 1951 }, // κενό: Κατοχή/Εμφύλιος — καμία δημοσιευμένη τιμή
  { year: 1952 }, // κενό: Κατοχή/Εμφύλιος — καμία δημοσιευμένη τιμή
  { year: 1953 }, // κενό: Κατοχή/Εμφύλιος — καμία δημοσιευμένη τιμή
  { year: 1954 }, // κενό: Κατοχή/Εμφύλιος — καμία δημοσιευμένη τιμή
  { year: 1955, births: 154_263, deaths: 54_781 },
  { year: 1956, births: 158_203, deaths: 59_460 },
  { year: 1957, births: 155_940, deaths: 61_664 },
  { year: 1958, births: 155_359, deaths: 58_160 },
  { year: 1959, births: 160_199, deaths: 60_852 },
  { year: 1960, births: 157_239, deaths: 60_563 },
  { year: 1961, births: 150_716, deaths: 63_955 },
  { year: 1962, births: 152_158, deaths: 66_554 },
  { year: 1963, births: 148_249, deaths: 66_813 },
  { year: 1964, births: 153_109, deaths: 69_429 },
  { year: 1965, births: 151_448, deaths: 67_269 },
  { year: 1966, births: 154_613, deaths: 67_912 },
  { year: 1967, births: 162_839, deaths: 71_975 },
  { year: 1968, births: 160_338, deaths: 73_309 },
  { year: 1969, births: 154_077, deaths: 71_825 },
  { year: 1970, births: 144_928, deaths: 74_009 },
  { year: 1971, births: 141_126, deaths: 73_819 },
  { year: 1972, births: 140_891, deaths: 76_859 },
  { year: 1973, births: 137_526, deaths: 77_648 },
  { year: 1974, births: 144_069, deaths: 76_303 },
  { year: 1975, births: 142_273, deaths: 80_077 },
  { year: 1976, births: 146_566, deaths: 81_818 },
  { year: 1977, births: 143_739, deaths: 83_750 },
  { year: 1978, births: 146_588, deaths: 81_615 },
  { year: 1979, births: 147_965, deaths: 82_338 },
  { year: 1980, births: 148_134, deaths: 87_282 },
  { year: 1981, births: 140_953, deaths: 86_261 },
  { year: 1982, births: 137_275, deaths: 86_345 },
  { year: 1983, births: 132_608, deaths: 90_586 },
  { year: 1984, births: 125_724, deaths: 88_397 },
  { year: 1985, births: 116_481, deaths: 92_886 },
  { year: 1986, births: 112_810, deaths: 91_783 },
  { year: 1987, births: 106_392, deaths: 95_656 },
  { year: 1988, births: 107_505, deaths: 92_407 },
  { year: 1989, births: 101_657, deaths: 92_720 },
  { year: 1990, births: 102_229, deaths: 94_152 },
  { year: 1991, births: 102_620, deaths: 95_498 },
  { year: 1992, births: 104_081, deaths: 98_231 },
  { year: 1993, births: 101_799, deaths: 97_419 },
  { year: 1994, births: 103_763, deaths: 97_807 },
  { year: 1995, births: 101_495, deaths: 100_158 },
  { year: 1996, births: 100_718, deaths: 100_740 },
  { year: 1997, births: 102_038, deaths: 99_738 },
  { year: 1998, births: 100_894, deaths: 102_668 },
  { year: 1999, births: 100_643, deaths: 103_304 },
  { year: 2000, births: 103_274, deaths: 105_170 },
  { year: 2001, births: 102_282, deaths: 102_559 },
  { year: 2002, births: 103_569, deaths: 103_915 },
  { year: 2003, births: 104_420, deaths: 105_529 },
  { year: 2004, births: 105_655, deaths: 104_942 },
  { year: 2005, births: 107_545, deaths: 105_091 },
  { year: 2006, births: 112_042, deaths: 105_476 },
  { year: 2007, births: 111_926, deaths: 109_895 },
  { year: 2008, births: 118_302, deaths: 107_979 },
  { year: 2009, births: 117_933, deaths: 108_316 },
  { year: 2010, births: 114_766, deaths: 109_084 },
  { year: 2011, births: 106_428, deaths: 111_099 },
  { year: 2012, births: 100_371, deaths: 116_668 },
  { year: 2013, births: 94_134, deaths: 111_794 },
  { year: 2014, births: 92_149, deaths: 113_740 },
  { year: 2015, births: 91_847, deaths: 121_183 },
  { year: 2016, births: 92_898, deaths: 118_788 },
  { year: 2017, births: 88_553, deaths: 124_495 },
  { year: 2018, births: 86_440, deaths: 120_291 },
  { year: 2019, births: 83_756, deaths: 124_954 },
  { year: 2020, births: 84_764, deaths: 131_025 },
  { year: 2021, births: 85_346, deaths: 143_904 },
  { year: 2022, births: 76_095, deaths: 140_792 },
  { year: 2023, births: 71_455, deaths: 128_097 },
  { year: 2024, births: 68_467, deaths: 126_916 },
];

export const CROSSOVER_YEAR = 2011; // start of the current uninterrupted natural decrease
export const LAST_POSITIVE_YEAR = 2010; // +5,682 (114,766 births vs 109,084 deaths)
// Isolated earlier negative years (recovery followed through 2010):
export const EARLY_NEGATIVE_YEARS = [1996, 1998, 1999, 2000, 2001, 2002, 2003];
export const VITAL_GAP = { from: 1941, to: 1954 } as const;

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
