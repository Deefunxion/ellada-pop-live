// =====================================================================
// GREECE POPULATION DATA — CONSOLIDATED DATASET
// =====================================================================
// Compiled 2026-07-08 from three research reports (Gemini / GPT /
// Perplexity), cross-checked and de-conflicted.
// v2 (same day): integrated the full official ELSTAT vital statistics
// timeseries 1932-2024 (births & deaths XLSX, publication SPO03/2024),
// parsed programmatically and validated against 7 anchor values (all
// matched). See VITAL_SERIES below. Every entry carries:
//
//   verification: "verified"   -> confirmed against an official ELSTAT
//                                 or Eurostat document with a direct URL
//   verification: "unverified" -> reported by a single research agent
//                                 without a directly checkable URL.
//                                 Treat as provisional.
//
// KEY METHODOLOGICAL RULES (do not violate in the app):
// 1. CENSUS figures and 1-JANUARY ESTIMATES are different measurements.
//    Never plot them as one continuous line. Use `populationType`.
// 2. ELSTAT revised its 2011-2024 estimates/migration series in Dec 2025.
//    Entries marked revision:"original" come from pre-revision bulletins
//    and are kept only until the full revised series is extracted.
//    Expect a visible discontinuity between 2020 (original) and
//    2021+ (revised). The app should show a footnote for this.
// 3. The LIVE COUNTER must use ONLY the LIVE_COUNTER_CONFIG block below
//    (resident-based figures, consistent with the population estimate).
// =====================================================================

export type PopulationType = "census" | "estimate";
export type Verification = "verified" | "unverified";
export type Revision = "original" | "revised" | "n/a";

export interface DemographicEntry {
  year: number;
  /** Population stock. For "census": census result. For "estimate": population on 1 January. */
  population: number | null;
  populationType: PopulationType;
  /** Live births during the calendar year (stillbirths excluded). */
  births: number | null;
  /** Deaths during the calendar year. */
  deaths: number | null;
  /** Net migration (immigrants - emigrants) during the calendar year. Estimate. */
  netMigration: number | null;
  verification: Verification;
  revision: Revision;
  source: string;
  notes?: string;
}

// =====================================================================
// LIVE COUNTER CONFIGURATION  (single source of truth for the ticker)
// =====================================================================
// Latest fully consolidated official figures: ELSTAT announcement of
// 18.12.2025 — "Estimated Population (1.1.2025), Migration Flows (2024),
// and Revised Data 2011-2024".
// These are RESIDENT-BASED births/deaths (consistent with the resident
// population estimate), NOT the registry-event figures.
// Source PDF: https://www.statistics.gr/documents/20181/d8439ad7-d043-2235-f4b4-8466c3c9cd56
// Cross-check: Eurostat demo_pjan (Greece, 1.1.2025 = 10,372,335),
// https://ec.europa.eu/eurostat/databrowser/view/demo_pjan/default/table
export const LIVE_COUNTER_CONFIG = {
  referenceDate: "2025-01-01T00:00:00+02:00", // Europe/Athens
  referencePopulation: 10_372_335, // VERIFIED — ELSTAT estimate 1.1.2025
  annualBirths: 68_309, // VERIFIED — resident-based, year 2024
  annualDeaths: 125_873, // VERIFIED — resident-based, year 2024
  annualNetMigration: 54_135, // VERIFIED — 132,149 in / 78,014 out, year 2024
  // Derived: annual net change = 68,309 - 125,873 + 54,135 = -3,429 persons/year
  // ≈ -9.39 persons/day ≈ -0.0001087 persons/second
  source:
    "ΕΛΣΤΑΤ, Ανακοίνωση 18.12.2025: Εκτιμώμενος Πληθυσμός 1.1.2025 & Μεταναστευτικές Ροές 2024",
  sourceUrl:
    "https://www.statistics.gr/documents/20181/d8439ad7-d043-2235-f4b4-8466c3c9cd56",
} as const;

// Alternative 2024 vital statistics (registry events occurred in Greece).
// DO NOT use for the live counter — kept for the "births vs deaths" chart
// and for transparency about the two official measurement bases.
export const VITAL_EVENTS_2024 = {
  year: 2024,
  births: 68_467, // VERIFIED — ELSTAT "Data on Vital Statistics: 2024"
  deaths: 126_916, // VERIFIED
  sourceUrl:
    "https://www.statistics.gr/documents/20181/713b284f-08b2-0b46-c26c-16f6425392b6",
} as const;

// =====================================================================
// DEMOGRAPHIC MILESTONE
// =====================================================================
export const NATURAL_DECREASE_MILESTONE = {
  // First year of the CURRENT uninterrupted period of natural decrease
  // (deaths > births every year since). VERIFIED against the full
  // 1932-2024 series: isolated negative years occurred in 1996 and
  // 1998-2003, then the balance returned positive 2004-2010
  // (+5,682 in 2010: 114,766 births vs 109,084 deaths).
  firstYear: 2011,
  lastPositiveYear: 2010,
  isolatedEarlierNegativeYears: [1996, 1998, 1999, 2000, 2001, 2002, 2003],
  verification: "verified" as Verification,
  sourceUrl:
    "https://www.statistics.gr/en/statistics/-/publication/SPO03/2024",
} as const;

// =====================================================================
// VITAL STATISTICS SERIES 1932-2024  (canonical births-vs-deaths data)
// =====================================================================
// Source: official ELSTAT timeseries XLSX files, publication SPO03/2024
// ("Births - Absolute numbers and rates 1932-2024" and "Θάνατοι -
// Απόλυτοι αριθμοί και ποσοστά 1932-2024"), parsed programmatically on
// 2026-07-08 and validated against 7 independently documented anchor
// values (2010, 2011, 2015, 2024) — all matched. VERIFIED.
//
// Basis: EVENT-BASED registry statistics (births/deaths that occurred
// in Greece per civil registry acts). This is the series to use for the
// births-vs-deaths chart. It differs slightly from the RESIDENT-BASED
// flows used in population accounting (e.g. 2024: 68,467 vs 68,309
// births) — see LIVE_COUNTER_CONFIG and ANNUAL_ESTIMATES notes.
//
// GAP 1941-1954: no published series (WWII occupation and civil war).
// The chart must show this as a real gap, not interpolate across it.
// Deaths 2023 (128,097) carries ELSTAT's own footnote "Αναθεωρημένα
// στοιχεία" (revised data).
// In 2019 the limit of viability of newborns changed from 25 to 22
// gestational weeks (ELSTAT footnote) — minor series break for births.
export const VITAL_SERIES: { year: number; births: number; deaths: number }[] = [
  { year: 1932, births: 185_523, deaths: 117_593 },
  { year: 1933, births: 189_583, deaths: 111_447 },
  { year: 1934, births: 208_929, deaths: 100_651 },
  { year: 1935, births: 192_511, deaths: 101_416 },
  { year: 1936, births: 193_343, deaths: 105_005 },
  { year: 1937, births: 183_878, deaths: 105_674 },
  { year: 1938, births: 184_509, deaths: 93_766 },
  { year: 1939, births: 178_852, deaths: 100_459 },
  { year: 1940, births: 179_500, deaths: 93_830 },
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

// =====================================================================
// CENSUSES 1821-2021
// =====================================================================
// Population values 1828-2001 originate from the Gemini research report
// citing the ELSTAT album "Απογραφές Πληθυσμού 1821-2021"
// (https://www.statistics.gr/census_priv_results_1821-2021, ISBN
// 978-960-89785-4-6) but were NOT individually verified against the
// album PDF -> marked "unverified" pending extraction from the primary
// document. 2011 and 2021 are verified (multiple official sources).
// Border-change notes explain the jumps in the series.
export const CENSUSES: DemographicEntry[] = [
  {
    year: 1821,
    population: 938_765,
    populationType: "estimate",
    births: null, deaths: null, netMigration: null,
    verification: "unverified",
    revision: "n/a",
    source: "Ιστορική/αναδρομική εκτίμηση (λεύκωμα ΕΛΣΤΑΤ 1821-2021)",
    notes: "Δεν είναι απογραφή — αναδρομική εκτίμηση για τα εδάφη του αρχικού κράτους.",
  },
  {
    year: 1828,
    population: 753_400,
    populationType: "census",
    births: null, deaths: null, netMigration: null,
    verification: "unverified",
    revision: "n/a",
    source: "Απογραφή Ι. Καποδίστρια (λεύκωμα ΕΛΣΤΑΤ)",
    notes: "Πρώτη επίσημη καταγραφή μετά την Επανάσταση. De facto πληθυσμός.",
  },
  {
    year: 1834,
    population: 693_592,
    populationType: "census",
    births: null, deaths: null, netMigration: null,
    verification: "unverified",
    revision: "n/a",
    source: "Γραμματεία επί των Εσωτερικών (λεύκωμα ΕΛΣΤΑΤ)",
    notes: "Πρώτη απογραφή επί Όθωνος. De facto.",
  },
  {
    year: 1838,
    population: 752_077,
    populationType: "census",
    births: null, deaths: null, netMigration: null,
    verification: "unverified",
    revision: "n/a",
    source: "Υπουργείο Εσωτερικών (λεύκωμα ΕΛΣΤΑΤ)",
    notes: "De facto.",
  },
  {
    year: 1840,
    population: 850_246,
    populationType: "census",
    births: null, deaths: null, netMigration: null,
    verification: "unverified",
    revision: "n/a",
    source: "Υπουργείο Εσωτερικών (λεύκωμα ΕΛΣΤΑΤ)",
    notes: "De facto.",
  },
  {
    year: 1848,
    population: 986_731,
    populationType: "census",
    births: null, deaths: null, netMigration: null,
    verification: "unverified",
    revision: "n/a",
    source: "Υπουργείο Εσωτερικών (λεύκωμα ΕΛΣΤΑΤ)",
    notes: "De facto.",
  },
  {
    year: 1856,
    population: 1_062_527,
    populationType: "census",
    births: null, deaths: null, netMigration: null,
    verification: "unverified",
    revision: "n/a",
    source: "Υπουργείο Εσωτερικών (λεύκωμα ΕΛΣΤΑΤ)",
    notes: "De facto.",
  },
  {
    year: 1861,
    population: 1_096_810,
    populationType: "census",
    births: null, deaths: null, netMigration: null,
    verification: "unverified",
    revision: "n/a",
    source: "Στατιστικό Γραφείο (λεύκωμα ΕΛΣΤΑΤ)",
    notes: "Τελευταία απογραφή πριν την πρώτη επέκταση συνόρων.",
  },
  {
    year: 1870,
    population: 1_457_894,
    populationType: "census",
    births: null, deaths: null, netMigration: null,
    verification: "unverified",
    revision: "n/a",
    source: "Στατιστικό Γραφείο (λεύκωμα ΕΛΣΤΑΤ)",
    notes: "ΑΛΜΑ: περιλαμβάνει την προσάρτηση των Επτανήσων (1864).",
  },
  {
    year: 1879,
    population: 1_679_470,
    populationType: "census",
    births: null, deaths: null, netMigration: null,
    verification: "unverified",
    revision: "n/a",
    source: "Στατιστική Υπηρεσία (λεύκωμα ΕΛΣΤΑΤ)",
    notes: "De facto.",
  },
  {
    year: 1889,
    population: 2_187_208,
    populationType: "census",
    births: null, deaths: null, netMigration: null,
    verification: "unverified",
    revision: "n/a",
    source: "Στατιστικό Τμήμα (λεύκωμα ΕΛΣΤΑΤ)",
    notes: "ΑΛΜΑ: περιλαμβάνει την ενσωμάτωση Θεσσαλίας & Άρτας (1881).",
  },
  {
    year: 1896,
    population: 2_433_806,
    populationType: "census",
    births: null, deaths: null, netMigration: null,
    verification: "unverified",
    revision: "n/a",
    source: "Στατιστική Διεύθυνση (λεύκωμα ΕΛΣΤΑΤ)",
    notes: "De facto.",
  },
  {
    year: 1907,
    population: 2_631_952,
    populationType: "census",
    births: null, deaths: null, netMigration: null,
    verification: "unverified",
    revision: "n/a",
    source: "Στατιστική Υπηρεσία (λεύκωμα ΕΛΣΤΑΤ)",
    notes: "De facto. Τελευταία απογραφή στα «παλαιά» σύνορα.",
  },
  {
    year: 1920,
    population: 5_016_889,
    populationType: "census",
    births: null, deaths: null, netMigration: null,
    verification: "unverified",
    revision: "n/a",
    source: "Υπ. Εθνικής Οικονομίας / ΔΣΕ (λεύκωμα ΕΛΣΤΑΤ)",
    notes: "ΑΛΜΑ: Νέες Χώρες — Μακεδονία, Ήπειρος, Κρήτη, νησιά Αν. Αιγαίου (1913).",
  },
  {
    year: 1928,
    population: 6_204_684,
    populationType: "census",
    births: null, deaths: null, netMigration: null,
    verification: "unverified",
    revision: "n/a",
    source: "Γενική Στατιστική Υπηρεσία (λεύκωμα ΕΛΣΤΑΤ)",
    notes: "ΑΛΜΑ: Μικρασιατική Καταστροφή & Ανταλλαγή Πληθυσμών (1922-1923).",
  },
  {
    year: 1940,
    population: 7_344_860,
    populationType: "census",
    births: null, deaths: null, netMigration: null,
    verification: "unverified",
    revision: "n/a",
    source: "Γενική Στατιστική Υπηρεσία (λεύκωμα ΕΛΣΤΑΤ)",
    notes: "Τελευταία απογραφή προ Β' Παγκοσμίου Πολέμου.",
  },
  {
    year: 1951,
    population: 7_632_801,
    populationType: "census",
    births: null, deaths: null, netMigration: null,
    verification: "unverified",
    revision: "n/a",
    source: "ΕΣΥΕ (λεύκωμα ΕΛΣΤΑΤ)",
    notes: "Περιλαμβάνει την ενσωμάτωση των Δωδεκανήσων (1947).",
  },
  {
    year: 1961,
    population: 8_388_553,
    populationType: "census",
    births: null, deaths: null, netMigration: null,
    verification: "unverified",
    revision: "n/a",
    source: "ΕΣΥΕ, Απογραφή 1961",
    notes: "De facto (πραγματικός πληθυσμός).",
  },
  {
    year: 1971,
    population: 8_768_641,
    populationType: "census",
    births: null, deaths: null, netMigration: null,
    verification: "unverified",
    revision: "n/a",
    source: "ΕΣΥΕ, Απογραφή 1971",
    notes: "De facto.",
  },
  {
    year: 1981,
    population: 9_740_417,
    populationType: "census",
    births: null, deaths: null, netMigration: null,
    verification: "unverified",
    revision: "n/a",
    source: "ΕΣΥΕ, Απογραφή 1981",
    notes: "De facto.",
  },
  {
    year: 1991,
    population: 10_259_900,
    populationType: "census",
    births: null, deaths: null, netMigration: null,
    verification: "unverified",
    revision: "n/a",
    source: "ΕΣΥΕ, Απογραφή 1991",
    notes: "De facto.",
  },
  {
    year: 2001,
    population: 10_964_020,
    populationType: "census",
    births: null, deaths: null, netMigration: null,
    verification: "unverified",
    revision: "n/a",
    source: "ΕΣΥΕ, Απογραφή 2001",
    notes: "De facto (ο μόνιμος πληθυσμός ήταν 10.934.097). Τελευταία de facto απογραφή.",
  },
  {
    year: 2011,
    population: 10_816_286,
    populationType: "census",
    births: null, deaths: null, netMigration: null,
    verification: "verified",
    revision: "n/a",
    source: "ΕΛΣΤΑΤ, Απογραφή 2011",
    notes:
      "ΜΟΝΙΜΟΣ πληθυσμός — πλήρης αλλαγή μεθοδολογίας (usual residence, βάση Eurostat). ΜΗ συγκρίσιμο ευθέως με τις de facto απογραφές έως 2001.",
  },
  {
    year: 2021,
    population: 10_482_487,
    populationType: "census",
    births: null, deaths: null, netMigration: null,
    verification: "verified",
    revision: "n/a",
    source:
      "ΕΛΣΤΑΤ, Απογραφή Πληθυσμού-Κατοικιών 2021 (https://www.statistics.gr/2021-census-res-pop-results)",
    notes:
      "Μόνιμος πληθυσμός, οριστικά αποτελέσματα. Ημερομηνία αναφοράς 22.10.2021. Υβριδική μέθοδος (ηλεκτρονική αυτοαπογραφή + συνεντεύξεις) λόγω Covid-19.",
  },
];

// =====================================================================
// ANNUAL ESTIMATES & VITAL STATISTICS (1 January population + flows)
// =====================================================================
// WARNING — TWO SERIES COEXIST HERE:
//   revision:"original" -> pre-Dec-2025 ELSTAT bulletins (2010-2020 rows,
//     and netMigration 2014-2022). After the 2021 census, ELSTAT revised
//     the whole 2011-2024 series downward; the original values are kept
//     until the revised series is extracted from the 18.12.2025 PDF.
//   revision:"revised"  -> post-revision values (2021-2025 populations,
//     2023 netMigration, 2024 flows), consistent with Eurostat demo_pjan
//     (last update 03.07.2026, DOI 10.2908/demo_pjan).
// The visible drop between 2020 (10,718,565 original) and 2021
// (10,555,344 revised) is a REVISION ARTIFACT, not a real one-year loss.
// The app must annotate this.
// NOTE: for the births-vs-deaths CHART use VITAL_SERIES (above), which
// is complete and verified 1932-2024. The births/deaths kept here serve
// population accounting (P[t+1] = P[t] + B - D + M) and, for 2023-2024,
// are RESIDENT-BASED — hence small differences from VITAL_SERIES.
export const ANNUAL_ESTIMATES: DemographicEntry[] = [
  {
    year: 1960,
    population: 8_300_438,
    populationType: "estimate",
    births: 157_239,
    deaths: 60_563,
    netMigration: null,
    verification: "unverified",
    revision: "n/a",
    source: "Eurostat demo_gind / ΕΛΣΤΑΤ (μέσω Gemini report)",
    notes: "Ισχυρά θετικό φυσικό ισοζύγιο (+96.676).",
  },
  {
    year: 1970,
    population: 8_792_874,
    populationType: "estimate",
    births: 144_928,
    deaths: 74_009,
    netMigration: null,
    verification: "unverified",
    revision: "n/a",
    source: "Eurostat demo_gind / ΕΛΣΤΑΤ (μέσω Gemini report)",
  },
  {
    year: 1980,
    population: 9_584_244,
    populationType: "estimate",
    births: 148_134,
    deaths: 87_282,
    netMigration: null,
    verification: "unverified",
    revision: "n/a",
    source: "Eurostat demo_gind / ΕΛΣΤΑΤ (μέσω Gemini report)",
  },
  {
    year: 1990,
    population: 10_121_605,
    populationType: "estimate",
    births: 102_229,
    deaths: 94_077,
    netMigration: null,
    verification: "unverified",
    revision: "n/a",
    source: "Eurostat demo_gind / ΕΛΣΤΑΤ (μέσω Gemini report)",
  },
  {
    year: 2000,
    population: 10_808_000,
    populationType: "estimate",
    births: 103_274,
    deaths: 105_170,
    netMigration: null,
    verification: "unverified",
    revision: "n/a",
    source: "Eurostat / ΕΛΣΤΑΤ (μέσω Gemini report)",
    notes: "Μεμονωμένο αρνητικό φυσικό ισοζύγιο, καλυπτόμενο από μεταναστευτικές εισροές.",
  },
  {
    year: 2010,
    population: 11_119_289,
    populationType: "estimate",
    births: 114_766,
    deaths: 109_084,
    netMigration: null,
    verification: "verified", // births/deaths: ELSTAT Vital Statistics 2024, Table 1
    revision: "original",
    source:
      "Πληθυσμός: Eurostat demo_pjan (προ αναθεώρησης). Γεννήσεις/θάνατοι: ΕΛΣΤΑΤ Δελτίο Φυσικής Κίνησης 2024, Πίν. 1",
    notes: "ΤΕΛΕΥΤΑΙΟ έτος με θετικό φυσικό ισοζύγιο (+5.682).",
  },
  {
    year: 2011,
    population: null, // Gemini's 10,816,286 was the CENSUS figure, not the 1-Jan estimate — removed as a category error.
    populationType: "estimate",
    births: 106_428,
    deaths: 111_099,
    netMigration: null,
    verification: "unverified",
    revision: "original",
    source: "ΕΛΣΤΑΤ φυσική κίνηση (μέσω Gemini report)",
    notes:
      "ΣΗΜΕΙΟ ΚΑΜΠΗΣ: πρώτο έτος της τρέχουσας συνεχούς φυσικής μείωσης (-4.671). Η εκτίμηση πληθυσμού 1.1.2011 εκκρεμεί από την αναθεωρημένη σειρά.",
  },
  {
    year: 2012,
    population: 11_086_417,
    populationType: "estimate",
    births: 100_371,
    deaths: 116_668,
    netMigration: null,
    verification: "unverified",
    revision: "original",
    source: "Eurostat / ΕΛΣΤΑΤ (μέσω Gemini report)",
  },
  {
    year: 2013,
    population: 11_003_615,
    populationType: "estimate",
    births: 94_134,
    deaths: 111_794,
    netMigration: null,
    verification: "unverified",
    revision: "original",
    source: "Eurostat / ΕΛΣΤΑΤ (μέσω Gemini report)",
    notes: "Οι γεννήσεις πέφτουν κάτω από τις 100.000.",
  },
  {
    year: 2014,
    population: 10_926_807,
    populationType: "estimate",
    births: 92_148,
    deaths: 113_740,
    netMigration: -47_791,
    verification: "unverified",
    revision: "original",
    source: "ΕΛΣΤΑΤ Δελτίο Πληθυσμού (μέσω Gemini report)",
    notes: "Έναρξη επίσημης ετήσιας εκτίμησης net migration.",
  },
  {
    year: 2015,
    population: 10_858_018,
    populationType: "estimate",
    births: 91_847,
    deaths: 121_183, // VERIFIED per ELSTAT Vital Statistics 2024 Table 1. (Gemini reported 121,212 — superseded.)
    netMigration: -44_905,
    verification: "verified",
    revision: "original",
    source: "ΕΛΣΤΑΤ Δελτίο Φυσικής Κίνησης 2024, Πίν. 1 (γεννήσεις/θάνατοι)",
    notes: "Κορύφωση μεταναστευτικής εκροής Ελλήνων λόγω κρίσης.",
  },
  {
    year: 2016,
    population: 10_783_748,
    populationType: "estimate",
    births: 92_898,
    deaths: 118_785,
    netMigration: 10_332,
    verification: "unverified",
    revision: "original",
    source: "ΕΛΣΤΑΤ Δελτίο Πληθυσμού (μέσω Gemini report)",
    notes: "Το ισοζύγιο μετανάστευσης γυρίζει θετικό (προσφυγικές ροές).",
  },
  {
    year: 2017,
    population: 10_768_193,
    populationType: "estimate",
    births: 88_553,
    deaths: 124_501,
    netMigration: 8_920,
    verification: "unverified",
    revision: "original",
    source: "ΕΛΣΤΑΤ Δελτίο Πληθυσμού (μέσω Gemini report)",
  },
  {
    year: 2018,
    population: 10_741_165,
    populationType: "estimate",
    births: 86_440,
    deaths: 119_446,
    netMigration: 16_440,
    verification: "unverified",
    revision: "original",
    source: "ΕΛΣΤΑΤ Δελτίο Πληθυσμού (μέσω Gemini report)",
  },
  {
    year: 2019,
    population: 10_724_599,
    populationType: "estimate",
    births: 83_763,
    deaths: 124_965,
    netMigration: 34_439,
    verification: "unverified",
    revision: "original",
    source: "ΕΛΣΤΑΤ Δελτίο Πληθυσμού (μέσω Gemini report)",
  },
  {
    year: 2020,
    population: 10_718_565,
    populationType: "estimate",
    births: 84_767,
    deaths: 131_084,
    netMigration: 6_384,
    verification: "unverified",
    revision: "original",
    source: "ΕΛΣΤΑΤ Δελτίο Πληθυσμού (μέσω Gemini report)",
    notes: "Έτος Covid-19: αύξηση θανάτων, καθίζηση μεταναστευτικών ροών.",
  },
  {
    year: 2021,
    population: 10_555_344, // REVISED (Eurostat demo_pjan). Original pre-revision ELSTAT estimate: 10,678,632.
    populationType: "estimate",
    births: 85_346,
    deaths: 143_904,
    netMigration: -22_476,
    verification: "verified", // population verified via Eurostat; flows from original bulletin
    revision: "revised",
    source:
      "Πληθυσμός: Eurostat demo_pjan (ενημ. 03.07.2026). Ροές: ΕΛΣΤΑΤ αρχικό δελτίο",
    notes:
      "Κορύφωση θνησιμότητας πανδημίας. Η αρχική εκτίμηση 1.1.2021 ήταν 10.678.632 — η διαφορά είναι αναδρομική διόρθωση μετά την απογραφή 2021.",
  },
  {
    year: 2022,
    population: 10_461_627,
    populationType: "estimate",
    births: 75_921,
    deaths: 139_921,
    netMigration: 16_355,
    verification: "verified", // population: identical in both ELSTAT and Eurostat series
    revision: "revised",
    source: "Eurostat demo_pjan + ΕΛΣΤΑΤ (ταυτίζονται)",
    notes: "Οι γεννήσεις πέφτουν κάτω από τις 80.000.",
  },
  {
    year: 2023,
    population: 10_401_868, // REVISED (Eurostat demo_pjan). Original ELSTAT bulletin figures: 10,413,982 / 10,413,798.
    populationType: "estimate",
    births: 71_249,
    deaths: 127_169,
    netMigration: 29_816, // REVISED (18.12.2025 announcement). Original bulletin: +42,658.
    verification: "verified",
    revision: "revised",
    source:
      "ΕΛΣΤΑΤ Ανακοίνωση 18.12.2025 (αναθεωρημένη σειρά) + Eurostat demo_pjan",
    notes:
      "Η καθαρή μετανάστευση 2023 αναθεωρήθηκε από +42.658 σε +29.816 — χρησιμοποιείται η αναθεωρημένη τιμή.",
  },
  {
    year: 2024,
    population: 10_375_764, // REVISED 1.1.2024. Original ELSTAT bulletin: 10,400,720.
    populationType: "estimate",
    births: 68_309, // resident-based (registry-event figure: 68,467 — see VITAL_EVENTS_2024)
    deaths: 125_873, // resident-based (registry-event figure: 126,916)
    netMigration: 54_135,
    verification: "verified",
    revision: "revised",
    source:
      "ΕΛΣΤΑΤ Ανακοίνωση 18.12.2025 (https://www.statistics.gr/documents/20181/d8439ad7-d043-2235-f4b4-8466c3c9cd56) + Eurostat demo_pjan",
  },
  {
    year: 2025,
    population: 10_372_335,
    populationType: "estimate",
    births: null,
    deaths: null,
    netMigration: null,
    verification: "verified",
    revision: "revised",
    source:
      "ΕΛΣΤΑΤ Εκτιμώμενος Πληθυσμός 1.1.2025 + Eurostat demo_pjan (ταυτίζονται)",
    notes: "Οι ροές πλήρους έτους 2025 δεν έχουν ακόμη δημοσιευθεί.",
  },
];

// =====================================================================
// DERIVED CONSTANTS FOR THE UI
// =====================================================================
export const PEAK_POPULATION = {
  value: 11_119_289,
  year: 2010,
  basis: "Εκτίμηση 1ης Ιανουαρίου, προ-αναθεώρησης σειρά",
  verification: "unverified" as Verification,
  note: "Κατά την αναθεωρημένη σειρά η κορύφωση ενδέχεται να διαφέρει ελαφρώς — προς επιβεβαίωση με την πλήρη αναθεωρημένη σειρά 2011-2024.",
} as const;

// =====================================================================
// PENDING DATA (known gaps — sources identified, extraction pending)
// =====================================================================
// 1. [RESOLVED 2026-07-08] Full annual births/deaths series 1932-2024:
//    integrated as VITAL_SERIES from the official ELSTAT XLSX files
//    (https://www.statistics.gr/en/statistics/-/publication/SPO03/2024)
// 2. Full REVISED 1-Jan population & migration series 2011-2024:
//    ELSTAT announcement 18.12.2025 (PDF):
//    https://www.statistics.gr/documents/20181/d8439ad7-d043-2235-f4b4-8466c3c9cd56
// 3. Census values 1828-2001 verification against the ELSTAT album:
//    https://www.statistics.gr/census_priv_results_1821-2021
// 4. Pre-2014 annual net migration: does not exist as an official annual
//    figure (was computed residually per decade) — will remain null.
