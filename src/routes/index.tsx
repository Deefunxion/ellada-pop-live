import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";
import {
  LIVE_CONFIG,
  POPULATION_HISTORY,
  VITAL_STATS,
  CROSSOVER_YEAR,
  SECONDS_PER_YEAR,
  interpolatePopulation,
  livePopulationAt,
} from "@/data/population";

export const Route = createFileRoute("/")({
  component: Index,
  head: () => ({
    meta: [
      { title: "Πληθυσμός της Ελλάδας — Live" },
      {
        name: "description",
        content:
          "Ζωντανός μετρητής του πληθυσμού της Ελλάδας με ιστορικά στοιχεία και δημογραφικούς δείκτες.",
      },
    ],
  }),
});

// ---------------------------------------------------------------------------
// Formatting helpers
// ---------------------------------------------------------------------------
const nfInt = new Intl.NumberFormat("el-GR", { maximumFractionDigits: 0 });
const nfSigned = new Intl.NumberFormat("el-GR", {
  maximumFractionDigits: 0,
  signDisplay: "always",
});
function fmt(n: number) {
  return nfInt.format(Math.round(n));
}
function fmtSigned(n: number) {
  return nfSigned.format(Math.round(n));
}

// ---------------------------------------------------------------------------
// Big animated counter digit block
// ---------------------------------------------------------------------------
function BigNumber({ value, flash }: { value: number; flash: "up" | "down" | null }) {
  const cls =
    flash === "down" ? "flash-down" : flash === "up" ? "flash-up" : "";
  return (
    <div
      className={`tabular font-serif font-semibold leading-none text-[clamp(3.2rem,12vw,9rem)] tracking-tight ${cls}`}
    >
      {fmt(value)}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Live Counter (main hero) + Today sub-counters
// ---------------------------------------------------------------------------
function LiveSection({
  simulatedYear,
  onBackToToday,
}: {
  simulatedYear: number | null;
  onBackToToday: () => void;
}) {
  const [value, setValue] = useState(() =>
    simulatedYear != null
      ? interpolatePopulation(simulatedYear)
      : livePopulationAt(Date.now()),
  );
  const [flash, setFlash] = useState<"up" | "down" | null>(null);
  const prevRef = useRef<number>(value);

  useEffect(() => {
    if (simulatedYear != null) {
      // Animate towards interpolated year
      const target = interpolatePopulation(simulatedYear);
      const start = prevRef.current;
      const t0 = performance.now();
      const dur = 350;
      let raf = 0;
      const tick = (t: number) => {
        const k = Math.min(1, (t - t0) / dur);
        const v = start + (target - start) * k;
        setValue(v);
        prevRef.current = v;
        if (k < 1) raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(raf);
    }
    // Live mode: recompute from timestamp difference each tick
    const id = setInterval(() => {
      const next = livePopulationAt(Date.now());
      const prevInt = Math.round(prevRef.current);
      const nextInt = Math.round(next);
      if (nextInt !== prevInt) {
        setFlash(nextInt < prevInt ? "down" : "up");
        setTimeout(() => setFlash(null), 480);
      }
      prevRef.current = next;
      setValue(next);
    }, 1000);
    return () => clearInterval(id);
  }, [simulatedYear]);

  const perSec =
    (LIVE_CONFIG.birthsPerYear -
      LIVE_CONFIG.deathsPerYear +
      LIVE_CONFIG.netMigrationPerYear) /
    SECONDS_PER_YEAR;

  return (
    <section className="relative">
      <div className="mb-3 flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
        <span
          className={`inline-block h-1.5 w-1.5 rounded-full ${
            simulatedYear == null ? "bg-[color:var(--greek-blue)] animate-pulse" : "bg-muted-foreground"
          }`}
        />
        {simulatedYear == null
          ? "Ζωντανή εκτίμηση · τώρα"
          : `Ιστορική εκτίμηση · ${simulatedYear}`}
      </div>

      <BigNumber value={value} flash={simulatedYear == null ? flash : null} />

      <p className="mt-4 max-w-2xl text-sm sm:text-base text-muted-foreground">
        Εκτιμώμενος πληθυσμός της Ελλάδας. Ο μετρητής μεταβάλλεται κατά περίπου{" "}
        <span className="tabular text-foreground">
          {perSec.toFixed(4)}
        </span>{" "}
        άτομα ανά δευτερόλεπτο — ή{" "}
        <span className="tabular text-foreground">
          {fmtSigned(perSec * SECONDS_PER_YEAR)}
        </span>{" "}
        άτομα ανά έτος, σύμφωνα με τα τελευταία διαθέσιμα δημογραφικά στοιχεία.
      </p>

      {simulatedYear != null && (
        <button
          onClick={onBackToToday}
          className="mt-6 rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          ← Επιστροφή στο σήμερα
        </button>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Today so far — three small counters
// ---------------------------------------------------------------------------
function TodayCounters() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // Start of "today" in Europe/Athens
  const startOfToday = useMemo(() => {
    const parts = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Athens",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(new Date(now));
    const get = (t: string) => parts.find((p) => p.type === t)!.value;
    // Reconstruct athens local midnight as UTC-equivalent using offset diff
    const athensNow = new Date(
      `${get("year")}-${get("month")}-${get("day")}T${get("hour")}:${get("minute")}:${get("second")}Z`,
    ).getTime();
    const offsetMs = athensNow - now;
    // Athens midnight = same day 00:00 in Athens
    const midAthens = new Date(
      `${get("year")}-${get("month")}-${get("day")}T00:00:00Z`,
    ).getTime();
    return midAthens - offsetMs;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Math.floor(now / 3_600_000)]);

  const elapsedSec = Math.max(0, (now - startOfToday) / 1000);
  const births = (LIVE_CONFIG.birthsPerYear / SECONDS_PER_YEAR) * elapsedSec;
  const deaths = (LIVE_CONFIG.deathsPerYear / SECONDS_PER_YEAR) * elapsedSec;
  const net =
    ((LIVE_CONFIG.birthsPerYear -
      LIVE_CONFIG.deathsPerYear +
      LIVE_CONFIG.netMigrationPerYear) /
      SECONDS_PER_YEAR) *
    elapsedSec;

  const items = [
    {
      label: "Γεννήσεις σήμερα",
      value: births,
      color: "text-[color:var(--births)]",
    },
    {
      label: "Θάνατοι σήμερα",
      value: deaths,
      color: "text-[color:var(--deaths)]",
    },
    {
      label: "Καθαρή μεταβολή σήμερα",
      value: net,
      color: net < 0 ? "text-[color:var(--deaths)]" : "text-[color:var(--births)]",
      signed: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((it) => (
        <div
          key={it.label}
          className="rounded-lg border border-border bg-card/50 p-4 backdrop-blur"
        >
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            {it.label}
          </div>
          <div
            className={`mt-2 tabular font-serif text-3xl sm:text-4xl font-semibold ${it.color}`}
          >
            {it.signed ? fmtSigned(it.value) : fmt(it.value)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Historical population chart
// ---------------------------------------------------------------------------
function PopulationChart() {
  const data = POPULATION_HISTORY.filter((p) => p.population != null).map((p) => ({
    year: p.year,
    population: p.population,
  }));
  return (
    <div className="rounded-lg border border-border bg-card/40 p-4 sm:p-6">
      <h3 className="font-serif text-xl sm:text-2xl">
        Πληθυσμός της Ελλάδας, 1821 – σήμερα
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Απογραφές και εκτιμήσεις πληθυσμού.
      </p>
      <div className="mt-4 h-[300px] sm:h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" />
            <XAxis
              dataKey="year"
              stroke="var(--muted-foreground)"
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke="var(--muted-foreground)"
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `${(v / 1_000_000).toFixed(1)}M`}
              width={50}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 13,
              }}
              labelStyle={{ color: "var(--muted-foreground)" }}
              formatter={(v: number) => [fmt(v), "Πληθυσμός"]}
              labelFormatter={(l) => `Έτος ${l}`}
            />
            <Line
              type="monotone"
              dataKey="population"
              stroke="var(--greek-blue)"
              strokeWidth={2.5}
              dot={{ r: 3, fill: "var(--greek-blue)" }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Births vs Deaths chart
// ---------------------------------------------------------------------------
function VitalChart() {
  const data = VITAL_STATS.map((v) => ({
    year: v.year,
    births: v.births,
    deaths: v.deaths,
  }));
  return (
    <div className="rounded-lg border border-border bg-card/40 p-4 sm:p-6">
      <h3 className="font-serif text-xl sm:text-2xl">
        Γεννήσεις και θάνατοι, 1932 – σήμερα
      </h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Το φυσικό ισοζύγιο έγινε αρνητικό γύρω στο 2011.
      </p>
      <div className="mt-4 h-[300px] sm:h-[380px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 8 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" />
            <XAxis dataKey="year" stroke="var(--muted-foreground)" tick={{ fontSize: 12 }} />
            <YAxis
              stroke="var(--muted-foreground)"
              tick={{ fontSize: 12 }}
              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
              width={45}
            />
            <Tooltip
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 13,
              }}
              labelFormatter={(l) => `Έτος ${l}`}
              formatter={(v: number, name) => [
                fmt(v),
                name === "births" ? "Γεννήσεις" : "Θάνατοι",
              ]}
            />
            <Legend
              formatter={(v) => (v === "births" ? "Γεννήσεις" : "Θάνατοι")}
              wrapperStyle={{ fontSize: 12 }}
            />
            <ReferenceLine
              x={CROSSOVER_YEAR}
              stroke="var(--muted-foreground)"
              strokeDasharray="4 4"
              label={{
                value: `${CROSSOVER_YEAR}: Οι θάνατοι ξεπερνούν τις γεννήσεις`,
                position: "insideTopRight",
                fill: "var(--foreground)",
                fontSize: 11,
              }}
            />
            <Line
              type="monotone"
              dataKey="births"
              stroke="var(--births)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="deaths"
              stroke="var(--deaths)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat cards
// ---------------------------------------------------------------------------
function StatCards() {
  const stats = useMemo(() => {
    const pts = POPULATION_HISTORY.filter((p) => p.population != null);
    const peak = pts.reduce((a, b) => (b.population! > a.population! ? b : a));
    const latest = pts[pts.length - 1];
    const nowPop = livePopulationAt(Date.now());
    const changeAbs = nowPop - peak.population!;
    const changePct = (changeAbs / peak.population!) * 100;

    const latestVital = VITAL_STATS[VITAL_STATS.length - 1];
    const natural = (latestVital.births ?? 0) - (latestVital.deaths ?? 0);

    // avg annual change over last decade of population points
    const tenYearsAgo = latest.year - 10;
    const past = pts.reduce((closest, p) =>
      Math.abs(p.year - tenYearsAgo) < Math.abs(closest.year - tenYearsAgo)
        ? p
        : closest,
    );
    const yearsSpan = latest.year - past.year || 1;
    const avgAnnual = (latest.population! - past.population!) / yearsSpan;

    return {
      peak,
      changeAbs,
      changePct,
      natural,
      latestVitalYear: latestVital.year,
      avgAnnual,
      past,
    };
  }, []);

  const cards = [
    {
      label: "Μέγιστος πληθυσμός",
      value: fmt(stats.peak.population!),
      sub: `Έτος ${stats.peak.year}`,
    },
    {
      label: "Μεταβολή από την κορύφωση",
      value: fmtSigned(stats.changeAbs),
      sub: `${stats.changePct.toFixed(2)}%`,
      tone: stats.changeAbs < 0 ? "neg" : "pos",
    },
    {
      label: "Φυσικό ισοζύγιο τελευταίου έτους",
      value: fmtSigned(stats.natural),
      sub: `Έτος ${stats.latestVitalYear}`,
      tone: stats.natural < 0 ? "neg" : "pos",
    },
    {
      label: "Μέση ετήσια μεταβολή τελευταίας δεκαετίας",
      value: fmtSigned(stats.avgAnnual),
      sub: `${stats.past.year} → ${POPULATION_HISTORY[POPULATION_HISTORY.length - 1].year}`,
      tone: stats.avgAnnual < 0 ? "neg" : "pos",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-lg border border-border bg-card/40 p-5"
        >
          <div className="text-xs uppercase tracking-widest text-muted-foreground">
            {c.label}
          </div>
          <div
            className={`mt-3 tabular font-serif text-2xl sm:text-3xl font-semibold ${
              c.tone === "neg"
                ? "text-[color:var(--deaths)]"
                : c.tone === "pos"
                  ? "text-[color:var(--births)]"
                  : "text-foreground"
            }`}
          >
            {c.value}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">{c.sub}</div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Time-travel slider
// ---------------------------------------------------------------------------
function TimeSlider({
  year,
  onChange,
}: {
  year: number;
  onChange: (y: number | null) => void;
}) {
  const MIN = 1821;
  const MAX = 2026;
  return (
    <div className="rounded-lg border border-border bg-card/40 p-5 sm:p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="font-serif text-xl sm:text-2xl">Ταξίδι στον χρόνο</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Σύρετε για να δείτε τον εκτιμώμενο πληθυσμό ανά έτος.
          </p>
        </div>
        <div className="tabular font-serif text-3xl sm:text-4xl">{year}</div>
      </div>
      <input
        type="range"
        min={MIN}
        max={MAX}
        value={year}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-5 w-full accent-[color:var(--greek-blue)]"
      />
      <div className="mt-2 flex justify-between text-xs text-muted-foreground tabular">
        <span>{MIN}</span>
        <span>{MAX}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
function Index() {
  const [simYear, setSimYear] = useState<number | null>(null);
  const currentYear = new Date().getFullYear();

  return (
    <main className="editorial-bg min-h-screen">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-16">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-primary/15 text-primary font-serif text-lg font-bold">
              Ε
            </div>
            <div>
              <div className="font-serif text-lg leading-none">
                Πληθυσμός της Ελλάδας
              </div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground">
                Ζωντανή προσομοίωση
              </div>
            </div>
          </div>
          <div className="text-xs text-muted-foreground tabular">
            Δεδομένα αναφοράς · {new Date(LIVE_CONFIG.referenceDateISO).getFullYear()}
          </div>
        </header>

        {/* Hero */}
        <section className="pt-12 sm:pt-16">
          <h1 className="max-w-3xl font-serif text-3xl sm:text-5xl leading-[1.05]">
            Κάθε δευτερόλεπτο,
            <br className="hidden sm:block" /> ένα κομμάτι της Ελλάδας
            <br className="hidden sm:block" /> αλλάζει.
          </h1>
          <div className="mt-10">
            <LiveSection
              simulatedYear={simYear}
              onBackToToday={() => setSimYear(null)}
            />
          </div>
        </section>

        {/* Today */}
        <section className="mt-14 sm:mt-20">
          <div className="mb-4 flex items-baseline justify-between">
            <h2 className="font-serif text-xl sm:text-2xl">Σήμερα, μέχρι στιγμής</h2>
            <div className="text-xs uppercase tracking-widest text-muted-foreground">
              Ώρα Ελλάδας
            </div>
          </div>
          <TodayCounters />
        </section>

        {/* Time slider */}
        <section className="mt-14 sm:mt-20">
          <TimeSlider
            year={simYear ?? currentYear}
            onChange={(y) => setSimYear(y === currentYear ? null : y)}
          />
        </section>

        {/* Stat cards */}
        <section className="mt-14 sm:mt-20">
          <h2 className="mb-4 font-serif text-xl sm:text-2xl">
            Δημογραφικά στιγμιότυπα
          </h2>
          <StatCards />
        </section>

        {/* History */}
        <section className="mt-14 sm:mt-20 space-y-8">
          <h2 className="font-serif text-2xl sm:text-3xl">Δύο αιώνες πληθυσμού</h2>
          <PopulationChart />
          <VitalChart />
        </section>

        {/* Footer */}
        <footer className="mt-20 border-t border-border pt-8 text-sm text-muted-foreground">
          <p className="max-w-2xl">
            Προσομοίωση βασισμένη σε επίσημα στοιχεία ΕΛΣΤΑΤ. Ο μετρητής είναι
            εκτίμηση, όχι πραγματική καταμέτρηση.
          </p>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <div className="text-xs uppercase tracking-widest text-foreground/80">
                Πηγές
              </div>
              <ul className="mt-2 space-y-1">
                <li>
                  Ελληνική Στατιστική Αρχή (ΕΛΣΤΑΤ) — Απογραφές πληθυσμού
                  1861–2021
                </li>
                <li>ΕΛΣΤΑΤ — Φυσική κίνηση πληθυσμού</li>
                <li>ΕΛΣΤΑΤ — Εκτιμήσεις μεσοετήσιου πληθυσμού</li>
              </ul>
            </div>
            <div className="sm:text-right">
              <div className="text-xs uppercase tracking-widest text-foreground/80">
                Σημείωση
              </div>
              <p className="mt-2">
                Τα δεδομένα για την περίοδο πριν από την ίδρυση του Ελληνικού
                Κράτους και ορισμένες ενδιάμεσες τιμές αποτελούν εκτιμήσεις.
              </p>
            </div>
          </div>
          <div className="mt-8 text-xs text-muted-foreground/70">
            © {new Date().getFullYear()} · Δεδομένα τελευταίας ενημέρωσης:{" "}
            {new Date(LIVE_CONFIG.referenceDateISO).toLocaleDateString("el-GR")}
          </div>
        </footer>
      </div>
    </main>
  );
}
