"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatCurrency, formatDate } from "@/lib/utils";
import {
  Euro,
  FileText,
  Receipt,
  TrendingUp,
  AlertTriangle,
  Send,
  Sun,
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  CloudFog,
  Loader2,
  Plus,
  FilePlus,
  UserPlus,
  CheckSquare,
  Clock,
  Trophy,
  Target,
  CalendarClock,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  CalendarSyncButtons,
  CalendarSyncDialog,
} from "@/components/dashboard/CalendarSync";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";

type Chantier = {
  id: string;
  nom: string;
  statut: string;
  dateDebut: string | null;
  dateFin: string | null;
  avancement: number;
};

type DevisRelance = {
  id: string;
  numero: string;
  client: string;
  dateValidite: string | null;
};

type FactureRetard = {
  id: string;
  numero: string;
  client: string;
  dateEcheance: string | null;
  retardJours: number;
};

type FactureEnvoyer = {
  id: string;
  numero: string;
  client: string;
};

type WeatherData = {
  temperature: number;
  description: string;
  ville: string;
};

type ActivityItem = {
  type: "client_created" | "devis_sent" | "facture_paid" | "devis_accepted" | "facture_sent";
  label: string;
  date: string;
  link: string;
};

type TopClient = {
  nom: string;
  montant: number;
  devisCount: number;
};

type UpcomingDeadline = {
  type: "devis" | "facture";
  numero: string;
  client: string;
  date: string;
  link: string;
};

const WEATHER_ICONS: Record<string, typeof Sun> = {
  "Dégagé": Sun,
  "Peu nuageux": Cloud,
  "Brouillard": CloudFog,
  "Bruine": CloudRain,
  "Pluie": CloudRain,
  "Neige": CloudSnow,
  "Averses": CloudRain,
  "Orage": CloudLightning,
};

type Props = {
  prenom: string;
  villeMeteo: string;
  caMois: number;
  evolutionCA: number;
  devisEnAttente: number;
  facturesImpayees: number;
  facturesRetard30: number;
  tauxConversion: number;
  chantiers: Chantier[];
  devisARelancer: DevisRelance[];
  facturesEnRetard: FactureRetard[];
  facturesAEnvoyer: FactureEnvoyer[];
  recentActivity: ActivityItem[];
  topClients: TopClient[];
  upcomingDeadlines: UpcomingDeadline[];
  objectifCA: number;
};

const SALUTATION_KEYS = [
  "dashboard.salutation1",
  "dashboard.salutation2",
  "dashboard.salutation3",
  "dashboard.salutation4",
] as const;

const ACTIVITY_CONFIG: Record<ActivityItem["type"], { color: string; dotColor: string }> = {
  client_created: { color: "text-blue-400", dotColor: "bg-blue-400" },
  devis_sent: { color: "text-nova-mid", dotColor: "bg-nova-mid" },
  devis_accepted: { color: "text-green-400", dotColor: "bg-green-400" },
  facture_sent: { color: "text-amber-400", dotColor: "bg-amber-400" },
  facture_paid: { color: "text-emerald-400", dotColor: "bg-emerald-400" },
};

const ACTIVITY_LABEL_KEYS: Record<ActivityItem["type"], string> = {
  client_created: "dashboard.clientCreated",
  devis_sent: "dashboard.devisSent",
  devis_accepted: "dashboard.devisAccepted",
  facture_sent: "dashboard.factureSent",
  facture_paid: "dashboard.facturePaid",
};

function useRelativeTime(t: (key: never, params?: Record<string, string | number>) => string) {
  return (dateStr: string) => {
    const now = Date.now();
    const date = new Date(dateStr).getTime();
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60_000);
    const diffHours = Math.floor(diffMs / 3_600_000);
    const diffDays = Math.floor(diffMs / 86_400_000);

    if (diffMin < 1) return t("dashboard.timeAgo.justNow" as never);
    if (diffMin < 60) return t("dashboard.timeAgo.minutesAgo" as never, { n: diffMin });
    if (diffHours < 24) return t("dashboard.timeAgo.hoursAgo" as never, { n: diffHours });
    if (diffDays === 1) return t("dashboard.timeAgo.yesterday" as never);
    return t("dashboard.timeAgo.daysAgo" as never, { n: diffDays });
  };
}

function getWeekDates(): { dayKey: string; date: number; month: number; fullDate: Date }[] {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(now);
  monday.setDate(now.getDate() + mondayOffset);
  monday.setHours(0, 0, 0, 0);

  const dayKeys = [
    "dashboard.weekDay.mon",
    "dashboard.weekDay.tue",
    "dashboard.weekDay.wed",
    "dashboard.weekDay.thu",
    "dashboard.weekDay.fri",
    "dashboard.weekDay.sat",
    "dashboard.weekDay.sun",
  ];

  return dayKeys.map((dayKey, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return { dayKey, date: d.getDate(), month: d.getMonth(), fullDate: d };
  });
}

function ProgressRing({ percentage, size = 120, strokeWidth = 10 }: { percentage: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.min(100, Math.max(0, percentage));
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--border)"
        strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="url(#progressGradient)"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        className="transition-all duration-1000 ease-out"
      />
      <defs>
        <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="var(--nova-core, #a855f7)" />
          <stop offset="100%" stopColor="var(--nova-outer, #3b82f6)" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function DashboardZypta({
  prenom,
  villeMeteo,
  caMois,
  evolutionCA,
  devisEnAttente,
  facturesImpayees,
  facturesRetard30,
  tauxConversion,
  chantiers,
  devisARelancer,
  facturesEnRetard,
  facturesAEnvoyer,
  recentActivity,
  topClients,
  upcomingDeadlines,
  objectifCA,
}: Props) {
  const { t } = useLanguage();
  const salutation = t(SALUTATION_KEYS[new Date().getHours() % SALUTATION_KEYS.length]);
  const [syncProvider, setSyncProvider] = useState<"google" | "ical" | null>(null);
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/weather?ville=${encodeURIComponent(villeMeteo)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => { if (data) setWeather(data); })
      .catch(() => {})
      .finally(() => setWeatherLoading(false));
  }, [villeMeteo]);

  const relativeTime = useRelativeTime(t as never);
  const weekDates = useMemo(() => getWeekDates(), []);
  const todayDate = new Date();
  const goalPercentage = objectifCA > 0 ? (caMois / objectifCA) * 100 : 0;

  const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
  const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } };

  const quickActions = [
    { href: "/devis/nouveau", icon: FilePlus, label: t("dashboard.newQuote") },
    { href: "/factures/nouvelle", icon: Plus, label: t("dashboard.newInvoice") },
    { href: "/clients?add=1", icon: UserPlus, label: t("dashboard.addClient") },
    { href: "/todos", icon: CheckSquare, label: t("dashboard.viewTasks") },
  ];

  return (
    <motion.div
      className="space-y-6"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {/* Header / Welcome */}
      <motion.div variants={item} className="glass-card relative overflow-hidden p-6">
        <div className="absolute right-0 top-0 h-32 w-32 -translate-y-8 translate-x-8 rounded-full bg-nova-mid/10" />
        <div className="absolute bottom-0 left-0 h-24 w-24 -translate-x-12 translate-y-12 rounded-full bg-nova-outer/10" />
        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text">
              {t("dashboard.welcome", { name: prenom, salutation })}
            </h1>
            <p className="mt-1 text-[var(--text-muted)]">
              {t("dashboard.overview")}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-[var(--bg-card)] px-4 py-2 shadow-sm border border-[var(--border)]">
            {weatherLoading ? (
              <>
                <Loader2 className="h-5 w-5 text-nova-core animate-spin" />
                <span className="text-sm font-medium text-[var(--text-muted)]">{t("common.loading")}</span>
              </>
            ) : weather ? (
              <>
                {(() => { const Icon = WEATHER_ICONS[weather.description] ?? Sun; return <Icon className="h-5 w-5 text-nova-core" />; })()}
                <span className="text-sm font-medium text-[var(--text-white)]">{weather.description}, {weather.temperature}°C</span>
                <span className="text-xs text-[var(--text-muted)]">{weather.ville}</span>
              </>
            ) : (
              <>
                <Sun className="h-5 w-5 text-nova-core" />
                <span className="text-sm font-medium text-[var(--text-muted)]">{t("dashboard.weatherUnavailable")}</span>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {quickActions.map((action) => (
          <Link
            key={action.href}
            href={action.href}
            className="glass-card group flex items-center gap-3 p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--ring)] hover:shadow-[0_0_20px_rgba(var(--ring-rgb),0.15)]"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-nova-core/20 to-nova-outer/20 transition-transform group-hover:scale-110">
              <action.icon className="h-5 w-5 text-nova-mid" />
            </div>
            <span className="text-sm font-semibold text-[var(--text-white)]">{action.label}</span>
          </Link>
        ))}
      </motion.div>

      {/* Stats Row */}
      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="glass-card group p-5 transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-muted)]">{t("dashboard.caMonth")}</span>
            <Euro className="h-5 w-5 text-nova-mid opacity-90" />
          </div>
          <p className="mt-2 text-2xl font-bold gradient-text">{formatCurrency(caMois)}</p>
          <p className={`mt-1 text-sm font-medium ${evolutionCA >= 0 ? "text-green-400" : "text-red-400"}`}>
            {evolutionCA >= 0 ? "+" : ""}{evolutionCA.toFixed(1)}% {t("dashboard.vsLastMonth")}
          </p>
        </div>

        <div className="glass-card group p-5 transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-muted)]">{t("dashboard.pendingQuotes")}</span>
            <FileText className="h-5 w-5 text-nova-mid opacity-90" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--text-white)]">{devisEnAttente}</p>
          <Link href="/devis" className="mt-1 text-sm font-medium text-nova-mid hover:underline">
            {t("dashboard.viewQuotes")} →
          </Link>
        </div>

        <div className="glass-card group p-5 transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-muted)]">{t("dashboard.unpaidInvoices")}</span>
            <Receipt className="h-5 w-5 text-nova-mid opacity-90" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--text-white)]">{facturesImpayees}</p>
          {facturesRetard30 > 0 && (
            <p className="mt-1 flex items-center gap-1 text-sm font-medium text-red-400 animate-pulse-soft">
              <AlertTriangle className="h-4 w-4" />
              {facturesRetard30} {t("dashboard.overdue30")}
            </p>
          )}
        </div>

        <div className="glass-card group p-5 transition-all duration-200 hover:-translate-y-0.5">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[var(--text-muted)]">{t("dashboard.conversionRate")}</span>
            <TrendingUp className="h-5 w-5 text-nova-mid opacity-90" />
          </div>
          <p className="mt-2 text-2xl font-bold text-[var(--text-white)]">{tauxConversion.toFixed(1)}%</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">{t("dashboard.quotesToProjet")}</p>
        </div>
      </motion.div>

      {/* Revenue Goal + Upcoming Deadlines row */}
      <motion.div variants={item} className="grid gap-6 md:grid-cols-3">
        {/* Revenue Goal Progress Ring */}
        <div className="glass-card flex flex-col items-center justify-center p-6">
          <h3 className="mb-4 flex items-center gap-2 self-start font-bold gradient-text">
            <Target className="h-5 w-5 text-nova-mid" />
            {t("dashboard.monthlyGoal")}
          </h3>
          <div className="relative">
            <ProgressRing percentage={goalPercentage} size={140} strokeWidth={12} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-[var(--text-white)]">
                {Math.min(100, Math.round(goalPercentage))}%
              </span>
              <span className="text-xs text-[var(--text-muted)]">{t("dashboard.goalReached")}</span>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-sm font-medium text-[var(--text-white)]">{formatCurrency(caMois)}</p>
            <p className="text-xs text-[var(--text-muted)]">
              {t("dashboard.goal")}: {formatCurrency(objectifCA)}
            </p>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="glass-card p-6 md:col-span-2">
          <h3 className="flex items-center gap-2 font-bold gradient-text">
            <CalendarClock className="h-5 w-5 text-nova-mid" />
            {t("dashboard.upcomingDeadlines")}
          </h3>
          <div className="mt-4 space-y-3">
            {upcomingDeadlines.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">{t("dashboard.noUpcomingDeadlines")}</p>
            ) : (
              upcomingDeadlines.map((d) => (
                <Link
                  key={`${d.type}-${d.numero}`}
                  href={d.link}
                  className="flex items-center justify-between rounded-xl border border-[var(--border)] p-3 transition-all hover:border-[var(--ring)] hover:shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${d.type === "devis" ? "bg-nova-mid/20" : "bg-amber-400/20"}`}>
                      {d.type === "devis" ? (
                        <FileText className="h-4 w-4 text-nova-mid" />
                      ) : (
                        <Receipt className="h-4 w-4 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-[var(--text-white)]">{d.numero}</p>
                      <p className="text-xs text-[var(--text-muted)]">{d.client}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-[var(--text-muted)]">
                      {d.type === "devis" ? t("dashboard.expiresOn") : t("dashboard.dueOn")}
                    </p>
                    <p className="text-sm font-medium text-amber-400">{formatDate(d.date)}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </motion.div>

      {/* Recent Activity + Top Clients */}
      <motion.div variants={item} className="grid gap-6 md:grid-cols-2">
        {/* Recent Activity */}
        <div className="glass-card p-6">
          <h3 className="flex items-center gap-2 font-bold gradient-text">
            <Clock className="h-5 w-5 text-nova-mid" />
            {t("dashboard.recentActivity")}
          </h3>
          <div className="mt-4">
            {recentActivity.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">{t("dashboard.noRecentActivity")}</p>
            ) : (
              <div className="relative space-y-0">
                <div className="absolute left-[11px] top-2 bottom-2 w-px bg-[var(--border)]" />
                {recentActivity.map((activity, index) => {
                  const config = ACTIVITY_CONFIG[activity.type];
                  const labelKey = ACTIVITY_LABEL_KEYS[activity.type];
                  return (
                    <Link
                      key={`${activity.type}-${activity.date}-${index}`}
                      href={activity.link}
                      className="group relative flex items-start gap-4 rounded-lg px-1 py-3 transition-colors hover:bg-[var(--bg-card)]"
                    >
                      <div className={`relative z-10 mt-0.5 h-[22px] w-[22px] shrink-0 rounded-full border-2 border-[var(--bg-card)] ${config.dotColor} flex items-center justify-center`}>
                        <div className="h-2 w-2 rounded-full bg-white/80" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold uppercase tracking-wide ${config.color}`}>
                          {t(labelKey as never)}
                        </p>
                        <p className="mt-0.5 truncate text-sm font-medium text-[var(--text-white)]">{activity.label}</p>
                      </div>
                      <span className="shrink-0 text-xs text-[var(--text-muted)]">{relativeTime(activity.date)}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Top Clients */}
        <div className="glass-card p-6">
          <h3 className="flex items-center gap-2 font-bold gradient-text">
            <Trophy className="h-5 w-5 text-nova-mid" />
            {t("dashboard.topClients")}
          </h3>
          <div className="mt-4">
            {topClients.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">{t("dashboard.noTopClients")}</p>
            ) : (
              <div className="space-y-3">
                {topClients.map((client, index) => {
                  const initials = client.nom
                    .split(" ")
                    .map((w) => w[0])
                    .join("")
                    .toUpperCase()
                    .slice(0, 2);
                  const rankColors = [
                    "from-amber-400 to-yellow-500",
                    "from-gray-300 to-gray-400",
                    "from-orange-400 to-amber-600",
                    "from-nova-core/60 to-nova-mid/60",
                    "from-nova-core/40 to-nova-mid/40",
                  ];
                  return (
                    <div
                      key={client.nom}
                      className="flex items-center gap-3 rounded-xl border border-[var(--border)] p-3 transition-all hover:border-[var(--ring)]"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white" style={{ opacity: 1 }}>
                        <div className={`flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br ${rankColors[index] || rankColors[4]}`}>
                          {initials}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-[var(--text-white)]">{client.nom}</p>
                        <p className="text-xs text-[var(--text-muted)]">
                          {client.devisCount} {t("dashboard.quotes")}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold gradient-text">{formatCurrency(client.montant)}</p>
                        <div className="flex items-center justify-end gap-1">
                          <span className="text-xs font-medium text-amber-400">#{index + 1}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Chantiers */}
      {chantiers.length > 0 && (
        <motion.div variants={item} className="glass-card p-6">
          <h2 className="text-lg font-bold gradient-text">{t("dashboard.chantiersEnCours")}</h2>
          <p className="text-sm text-[var(--text-muted)]">{t("dashboard.friseChantiers")}</p>
          <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
            {chantiers.map((c) => (
              <div
                key={c.id}
                className="min-w-[200px] flex-shrink-0 rounded-xl border border-[var(--border)] p-4 transition-all hover:border-[var(--ring)] hover:shadow-[0_0_20px_var(--ring)]"
              >
                <p className="font-medium text-[var(--text-white)]">{c.nom}</p>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                  <div
                    className={`h-full rounded-full ${
                      c.statut === "TERMINE"
                        ? "bg-green-500"
                        : c.statut === "EN_COURS"
                        ? "bg-nova-mid"
                        : "bg-nova-mid/50 animate-pulse-soft"
                    }`}
                    style={{ width: `${c.avancement || 50}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-[var(--text-muted)]">
                  {c.dateDebut ? formatDate(c.dateDebut) : t("dashboard.aPlanifier")}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Urgent actions: follow-up, send, overdue */}
      <motion.div variants={item} className="grid gap-6 md:grid-cols-3">
        <div className="glass-card p-6">
          <h3 className="flex items-center gap-2 font-bold text-nova-mid">
            <AlertTriangle className="h-5 w-5" />
            {t("dashboard.quotesToFollowUp")}
          </h3>
          <div className="mt-4 space-y-3">
            {devisARelancer.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">{t("dashboard.alerts.noQuotesToFollowUp")}</p>
            ) : (
              devisARelancer.map((d) => (
                <Link
                  key={d.id}
                  href={`/devis/${d.id}`}
                  className="block rounded-lg border border-[var(--border)] p-3 transition-all hover:border-nova-mid/30"
                >
                  <p className="font-medium text-[var(--text-white)]">{d.numero}</p>
                  <p className="text-sm text-[var(--text-muted)]">{d.client}</p>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="flex items-center gap-2 font-bold text-nova-mid">
            <Send className="h-5 w-5" />
            {t("dashboard.invoicesToSend")}
          </h3>
          <div className="mt-4 space-y-3">
            {facturesAEnvoyer.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">{t("dashboard.alerts.noInvoicesToSend")}</p>
            ) : (
              facturesAEnvoyer.map((f) => (
                <Link
                  key={f.id}
                  href={`/factures/${f.id}`}
                  className="block rounded-lg border border-[var(--border)] p-3 transition-all hover:border-nova-mid/30"
                >
                  <p className="font-medium text-[var(--text-white)]">{f.numero}</p>
                  <p className="text-sm text-[var(--text-muted)]">{f.client}</p>
                </Link>
              ))
            )}
          </div>
        </div>

        <div className="glass-card p-6 !border-red-500/20">
          <h3 className="flex items-center gap-2 font-bold text-red-400">
            <Receipt className="h-5 w-5" />
            {t("dashboard.overdueInvoices")}
          </h3>
          <div className="mt-4 space-y-3">
            {facturesEnRetard.length === 0 ? (
              <p className="text-sm text-[var(--text-muted)]">{t("dashboard.alerts.noOverdueInvoices")}</p>
            ) : (
              facturesEnRetard.map((f) => (
                <Link
                  key={f.id}
                  href={`/factures/${f.id}`}
                  className={`block rounded-lg border p-3 transition-all hover:border-red-400/40 ${
                    f.retardJours > 30 ? "border-red-500/50 animate-pulse-soft" : "border-orange-500/50"
                  }`}
                >
                  <p className="font-medium text-[var(--text-white)]">{f.numero}</p>
                  <p className="text-sm text-[var(--text-muted)]">{f.client}</p>
                  <p className="text-xs text-red-400">{t("factures.overdueDays", { n: f.retardJours })}</p>
                </Link>
              ))
            )}
          </div>
        </div>
      </motion.div>

      {/* Charts */}
      <motion.div variants={item}>
        <DashboardCharts />
      </motion.div>

      {/* This Week — Real calendar dates */}
      <motion.div variants={item} className="glass-card p-6">
        <div className="flex items-center justify-between">
          <h3 className="font-bold gradient-text">{t("dashboard.thisWeek")}</h3>
          <CalendarSyncButtons onSync={setSyncProvider} />
        </div>
        <div className="mt-4 flex gap-2">
          {weekDates.map((day) => {
            const isToday =
              day.fullDate.getDate() === todayDate.getDate() &&
              day.fullDate.getMonth() === todayDate.getMonth() &&
              day.fullDate.getFullYear() === todayDate.getFullYear();
            return (
              <div
                key={day.dayKey}
                className={`flex flex-1 flex-col items-center rounded-lg border p-2 transition-all ${
                  isToday
                    ? "border-nova-mid bg-nova-mid/10 shadow-[0_0_12px_rgba(var(--ring-rgb),0.2)]"
                    : "border-[var(--border)]"
                }`}
              >
                <span className={`text-xs ${isToday ? "font-bold text-nova-mid" : "text-[var(--text-muted)]"}`}>
                  {t(day.dayKey as never)}
                </span>
                <span className={`mt-1 text-lg font-bold ${isToday ? "text-nova-mid" : "text-[var(--text-white)]"}`}>
                  {day.date}
                </span>
                {isToday && (
                  <span className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-nova-mid">
                    {t("dashboard.today")}
                  </span>
                )}
              </div>
            );
          })}
        </div>
        <p className="mt-2 text-xs text-[var(--text-muted)]">
          🟣 {t("dashboard.thisWeekLegend")}
        </p>
      </motion.div>

      <CalendarSyncDialog
        provider={syncProvider}
        onClose={() => setSyncProvider(null)}
      />
    </motion.div>
  );
}
