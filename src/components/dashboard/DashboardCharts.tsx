"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { motion } from "framer-motion";
import { formatCurrency } from "@/lib/utils";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// ─── Types ───────────────────────────────────────────────────────────────────

type CAPoint = { date: string; label: string; montant: number };
type DVFPoint = { mois: string; devis: number; factures: number };
type StatutPoint = { statut: string; count: number };
type ConvPoint = { date: string; label: string; taux: number };

type StatsData = {
  caEvolution: CAPoint[];
  devisVsFactures: DVFPoint[];
  repartitionStatuts: StatutPoint[];
  tauxConversion: ConvPoint[];
};

const PERIOD_KEYS = [
  "dashboard.period.7d",
  "dashboard.period.30d",
  "dashboard.period.3m",
  "dashboard.period.6m",
  "dashboard.period.1y",
] as const;
const PERIOD_DAYS = [7, 30, 90, 180, 365] as const;

const STATUT_KEYS: Record<string, string> = {
  PROSPECT: "clients.statusProspect",
  CONTACTE: "clients.statusContacte",
  DEVIS_ENVOYE: "clients.statusDevisEnvoye",
  NEGOCIATION: "clients.statusNegociation",
  SIGNE: "clients.statusSigne",
  EN_COURS: "clients.statusEnCours",
  TERMINE: "clients.statusTermine",
  PERDU: "clients.statusPerdu",
};

const PIE_COLORS = [
  "#3b82f6", // blue
  "#06b6d4", // cyan
  "#f59e0b", // amber
  "#f97316", // orange
  "#22c55e", // green
  "#6366f1", // indigo
  "#a855f7", // purple
  "#ef4444", // red
];

// ─── Theme-aware palette ─────────────────────────────────────────────────────

type Palette = { primary: string; secondary: string; tertiary: string; accent: string };

const PALETTES: Record<string, Palette> = {
  supernova: { primary: "#c84bff", secondary: "#ff2d8f", tertiary: "#ff6b35", accent: "#00d4ff" },
  noir:      { primary: "#FFD54F", secondary: "#FFC107", tertiary: "#FFB300", accent: "#FFE082" },
  blanc:     { primary: "#FFD54F", secondary: "#FFC107", tertiary: "#FFB300", accent: "#FFE082" },
};

function useThemePalette(): Palette {
  const [palette, setPalette] = useState<Palette>(PALETTES.supernova);

  useEffect(() => {
    const detect = () => {
      const theme = document.documentElement.getAttribute("data-theme") || "supernova";
      setPalette(PALETTES[theme] || PALETTES.supernova);
    };
    detect();
    const obs = new MutationObserver(detect);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  return palette;
}

// ─── Shared tooltip style ────────────────────────────────────────────────────

const tooltipStyle = {
  contentStyle: {
    background: "rgba(15, 15, 20, 0.95)",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 12,
    color: "#fff",
    fontSize: 13,
  },
  itemStyle: { color: "#fff" },
  labelStyle: { color: "rgba(255,255,255,0.6)" },
};

const gridStroke = "rgba(255,255,255,0.05)";
const axisTickStyle = { fill: "rgba(255,255,255,0.45)", fontSize: 12 };

// ─── Skeleton ────────────────────────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <div className="glass-card p-6 animate-pulse">
      <div className="h-5 w-40 rounded bg-white/10 mb-2" />
      <div className="h-3 w-56 rounded bg-white/5 mb-6" />
      <div className="h-64 rounded-lg bg-white/5" />
    </div>
  );
}

// ─── Custom Pie Label ────────────────────────────────────────────────────────

function renderCenterLabel(data: StatutPoint[]) {
  const total = data.reduce((s, d) => s + d.count, 0);
  return (
    <text
      x="50%"
      y="50%"
      textAnchor="middle"
      dominantBaseline="central"
      className="fill-[var(--text-white)]"
      style={{ fontSize: 22, fontWeight: 700 }}
    >
      {total}
    </text>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

export function DashboardCharts() {
  const { t } = useLanguage();
  const [data, setData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activePeriod, setActivePeriod] = useState(180);
  const palette = useThemePalette();

  const PERIODS = PERIOD_KEYS.map((key, i) => ({ label: t(key as import("@/lib/i18n").TranslationKey), days: PERIOD_DAYS[i] }));

  const fetchStats = useCallback(async (days: number) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dashboard/stats?period=${days}`);
      if (res.ok) setData(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats(activePeriod);
  }, [activePeriod, fetchStats]);

  const handlePeriod = (days: number) => setActivePeriod(days);

  const pieData = useMemo(
    () => (data?.repartitionStatuts ?? []).map((d) => ({ ...d, name: t((STATUT_KEYS[d.statut] ?? "clients.prospect") as import("@/lib/i18n").TranslationKey) })),
    [data?.repartitionStatuts, t]
  );

  const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } };

  if (loading && !data) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          {PERIODS.map((p) => (
            <div key={p.days} className="h-8 w-20 rounded-lg bg-white/5 animate-pulse" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <div className="flex flex-wrap gap-2">
        {PERIODS.map((p) => (
          <button
            key={p.days}
            onClick={() => handlePeriod(p.days)}
            className={`rounded-lg px-4 py-1.5 text-sm font-medium transition-all ${
              activePeriod === p.days
                ? "bg-nova-mid text-white shadow-[0_0_16px_var(--ring)]"
                : "bg-[var(--bg-card)] text-[var(--text-muted)] border border-[var(--border)] hover:border-[var(--ring)]"
            }`}
          >
            {p.label}
          </button>
        ))}
        {loading && (
          <span className="ml-2 self-center text-xs text-[var(--text-muted)] animate-pulse">
            {t("common.loading")}
          </span>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* 1. CA Évolution – Line Chart */}
        <motion.div variants={item} initial="hidden" animate="show" className="glass-card p-6">
          <h3 className="text-base font-bold gradient-text">{t("dashboard.charts.caEvolution")}</h3>
          <p className="mb-4 text-xs text-[var(--text-muted)]">{t("dashboard.caCollected")}</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.caEvolution}>
                <defs>
                  <linearGradient id="caFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={palette.primary} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={palette.primary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={axisTickStyle} />
                <YAxis tickFormatter={(v) => `${(v / 1000).toFixed(0)}k€`} tick={axisTickStyle} />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(v) => [formatCurrency(Number(v ?? 0)), "CA"]}
                />
                <Line
                  type="monotone"
                  dataKey="montant"
                  stroke={palette.primary}
                  strokeWidth={2.5}
                  dot={{ fill: palette.primary, r: 4 }}
                  activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 2. Devis vs Factures – Bar Chart */}
        <motion.div variants={item} initial="hidden" animate="show" className="glass-card p-6">
          <h3 className="text-base font-bold gradient-text">{t("dashboard.charts.quotesVsInvoices")}</h3>
          <p className="mb-4 text-xs text-[var(--text-muted)]">{t("dashboard.createdPerMonth")}</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.devisVsFactures}>
                <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" />
                <XAxis dataKey="mois" tick={axisTickStyle} />
                <YAxis tick={axisTickStyle} allowDecimals={false} />
                <Tooltip {...tooltipStyle} />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}
                />
                <Bar dataKey="devis" name={t("dashboard.devis")} fill={palette.accent} radius={[4, 4, 0, 0]} />
                <Bar dataKey="factures" name={t("dashboard.factures")} fill={palette.secondary} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 3. Répartition des statuts – Donut Chart */}
        <motion.div variants={item} initial="hidden" animate="show" className="glass-card p-6">
          <h3 className="text-base font-bold gradient-text">{t("dashboard.charts.statusBreakdown")}</h3>
          <p className="mb-4 text-xs text-[var(--text-muted)]">{t("dashboard.pipelineByStatus")}</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="count"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="55%"
                  outerRadius="80%"
                  paddingAngle={3}
                  strokeWidth={0}
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip {...tooltipStyle} />
                <Legend
                  wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}
                  formatter={(val) => <span className="text-[var(--text-muted)]">{val}</span>}
                />
                {renderCenterLabel(pieData)}
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* 4. Taux de conversion – Area Chart */}
        <motion.div variants={item} initial="hidden" animate="show" className="glass-card p-6">
          <h3 className="text-base font-bold gradient-text">{t("dashboard.charts.conversionRate")}</h3>
          <p className="mb-4 text-xs text-[var(--text-muted)]">{t("dashboard.acceptedVsSent")}</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.tauxConversion}>
                <defs>
                  <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={palette.tertiary} stopOpacity={0.4} />
                    <stop offset="100%" stopColor={palette.tertiary} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={gridStroke} strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={axisTickStyle} />
                <YAxis
                  tick={axisTickStyle}
                  domain={[0, 100]}
                  tickFormatter={(v) => `${v}%`}
                />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(v) => [`${Number(v ?? 0)}%`, "Conversion"]}
                />
                <Area
                  type="monotone"
                  dataKey="taux"
                  stroke={palette.tertiary}
                  strokeWidth={2.5}
                  fill="url(#convGrad)"
                  dot={{ fill: palette.tertiary, r: 3 }}
                  activeDot={{ r: 6, stroke: "#fff", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
