"use client";

import { useState, useEffect } from "react";
import {
  CalendarDays,
  Calendar,
  BarChart3,
  Wallet,
  Clock,
  User,
  Timer,
  ArrowUpRight,
  ArrowDownRight,
  Hourglass,
  Sparkles,
  TrendingUp,
  ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";
import { useTranslation, useLocale } from "@/i18n";
import { formatPrice, formatTime, formatDateShort } from "@/lib/format";
import { LoadingSpinner } from "@/components/loading-spinner";
import { EmptyState } from "@/components/empty-state";
import { OnboardingBanner } from "@/components/onboarding-banner";
import { buildOwnerToPlayerLink } from "@/lib/whatsapp";

// ── Types ────────────────────────────────────────────────

interface UpcomingBooking {
  id: string;
  playerName: string;
  playerPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  court: { name: string; nameAr: string | null };
}

interface TodaySchedule {
  courts: Array<{
    courtId: string;
    courtName: string;
    bookings: Array<{ startTime: string; endTime: string; status: string; playerName: string }>;
  }>;
  nextBooking: {
    playerName: string;
    courtName: string;
    startTime: string;
    endTime: string;
    minutesUntil: number;
  } | null;
  remainingSlots: number;
}

interface Insights {
  weekRevenue: number;
  lastWeekRevenue: number;
  revenueChangePercent: number;
  utilizationPercent: number;
  busiestDay: string;
  busiestDayCount: number;
  peakHour: number;
  dailyRevenue: Array<{ day: string; revenue: number }>;
}

interface Actions {
  pendingCount: number;
  newTodayCount: number;
}

interface Players {
  repeatCount: number;
  newCount: number;
  topPlayers: Array<{ name: string; phone: string; bookingCount: number; lastVisit: string }>;
}

interface Occupancy {
  heatmap: number[][];
}

interface DashboardData {
  todayBookings: number;
  weekBookings: number;
  totalBookings: number;
  revenue: number;
  upcomingBookings: UpcomingBooking[];
  todaySchedule: TodaySchedule | null;
  insights: Insights | null;
  actions: Actions | null;
  players: Players | null;
  occupancy: Occupancy | null;
}

// Day name translations
const DAY_NAMES_AR: Record<string, string> = {
  Saturday: "السبت",
  Sunday: "الأحد",
  Monday: "الإثنين",
  Tuesday: "الثلاثاء",
  Wednesday: "الأربعاء",
  Thursday: "الخميس",
  Friday: "الجمعة",
};

const DAY_ABBR_AR: Record<string, string> = {
  Sat: "سبت",
  Sun: "أحد",
  Mon: "إثن",
  Tue: "ثلا",
  Wed: "أربع",
  Thu: "خمي",
  Fri: "جمعة",
};

// ── Component ────────────────────────────────────────────

export default function DashboardPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const res = await fetch("/api/owner/dashboard");
        const json = await res.json();
        if (res.ok && json.data) {
          setData({
            todayBookings: json.data.stats?.todayBookings ?? 0,
            weekBookings: json.data.stats?.weekBookings ?? 0,
            totalBookings: json.data.stats?.totalBookings ?? 0,
            revenue: json.data.stats?.totalRevenue ?? 0,
            upcomingBookings: json.data.upcomingBookings ?? [],
            todaySchedule: json.data.todaySchedule ?? null,
            insights: json.data.insights ?? null,
            actions: json.data.actions ?? null,
            players: json.data.players ?? null,
            occupancy: json.data.occupancy ?? null,
          });
        } else {
          setData({
            todayBookings: 0, weekBookings: 0, totalBookings: 0, revenue: 0,
            upcomingBookings: [], todaySchedule: null, insights: null,
            actions: null, players: null, occupancy: null,
          });
        }
      } catch {
        setData({
          todayBookings: 0, weekBookings: 0, totalBookings: 0, revenue: 0,
          upcomingBookings: [], todaySchedule: null, insights: null,
          actions: null, players: null, occupancy: null,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner />;

  const stats = [
    { icon: CalendarDays, label: t("owner.todayBookings"), value: data?.todayBookings ?? 0, bg: "bg-[#d4ff00]", iconColor: "text-[#d4ff00]" },
    { icon: Calendar, label: t("owner.weekBookings"), value: data?.weekBookings ?? 0, bg: "bg-cyan-500/15", iconColor: "text-cyan-400" },
    { icon: BarChart3, label: t("owner.totalBookings"), value: data?.totalBookings ?? 0, bg: "bg-indigo-500/15", iconColor: "text-indigo-400" },
    { icon: Wallet, label: t("owner.revenue"), value: formatPrice(data?.revenue ?? 0), bg: "bg-amber-500/15", iconColor: "text-amber-400" },
  ];

  const schedule = data?.todaySchedule;
  const insights = data?.insights;
  const actions = data?.actions;
  const players = data?.players;
  const occupancy = data?.occupancy;

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <OnboardingBanner />

      {/* Welcome */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-white">
          {t("owner.welcome", { name: user?.name || "" })}
        </h1>
        <p className="text-sm text-[#666]">{t("owner.dashboard")}</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="bg-[#1a1a1a] border border-[#333] rounded-sm p-4">
              <div className={`flex h-9 w-9 items-center justify-center rounded-sm ${idx === 0 ? "bg-[#d4ff00]/15" : stat.bg} mb-3`}>
                <Icon size={18} className={stat.iconColor} />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-[#666] mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* ═══ FEATURE 1: Today's Schedule Overview ═══ */}
      {schedule && (
        <div className="mb-6">
          {/* Next Booking Card */}
          {schedule.nextBooking ? (
            <div className="bg-[#1a1a1a] border-s-[3px] border-s-[#d4ff00] rounded-sm p-4 mb-3 flex items-center gap-3">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-sm bg-[#d4ff00]/15">
                <Timer size={20} className="text-[#d4ff00]" />
                <div className="absolute -inset-1 rounded-sm border-2 border-[#d4ff00]/30 animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-sm font-bold text-white truncate">{schedule.nextBooking.playerName}</span>
                  <span className="shrink-0 text-[11px] font-bold text-[#d4ff00] bg-[#d4ff00]/10 border border-[#d4ff00]/20 px-2 py-0.5 rounded-sm">
                    {t("owner.inMinutes", { count: schedule.nextBooking.minutesUntil })}
                  </span>
                </div>
                <p className="text-xs text-[#666]">
                  {schedule.nextBooking.courtName} · {formatTime(schedule.nextBooking.startTime)} - {formatTime(schedule.nextBooking.endTime)}
                </p>
              </div>
            </div>
          ) : (
            <div className="bg-[#1a1a1a] border border-[#333] rounded-sm p-4 mb-3 text-center">
              <p className="text-sm text-[#666]">{t("owner.noMoreBookings")}</p>
            </div>
          )}

          {/* Today's Timeline */}
          {schedule.courts.length > 0 && (
            <div className="bg-[#1a1a1a] border border-[#333] rounded-sm p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white">{t("owner.todaySchedule")}</h3>
              </div>

              {schedule.courts.map((court) => (
                <div key={court.courtId} className="mb-3 last:mb-0">
                  <p className="text-[11px] font-semibold text-[#999] mb-1">{court.courtName}</p>
                  <div className="h-7 bg-white/[0.03] rounded-sm relative overflow-hidden border border-white/[0.05]">
                    {court.bookings.map((b, i) => {
                      const startH = parseInt(b.startTime.split(":")[0]);
                      const endH = parseInt(b.endTime.split(":")[0]);
                      // Position: 6AM=0%, 2AM(next day)=100% → 20 hour range
                      const leftPct = ((startH - 6) / 20) * 100;
                      const widthPct = ((endH - startH) / 20) * 100;
                      const color = b.status === "PENDING"
                        ? "bg-amber-500/40 border-e-2 border-e-amber-500"
                        : "bg-emerald-500/40 border-e-2 border-e-emerald-500";
                      return (
                        <div
                          key={i}
                          className={`absolute top-[3px] bottom-[3px] rounded-sm ${color}`}
                          style={{ left: `${Math.max(0, leftPct)}%`, width: `${Math.max(2, widthPct)}%` }}
                        />
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Time labels */}
              <div className="flex justify-between mt-1.5 text-[9px] text-[#666]" dir="ltr">
                <span>6AM</span><span>10</span><span>2PM</span><span>6</span><span>10</span><span>2AM</span>
              </div>

              {/* Empty slots + link */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/[0.05]">
                <div>
                  <span className="text-xl font-bold text-[#00c2ff]">{schedule.remainingSlots}</span>
                  <span className="text-xs text-[#666] ms-2">{t("owner.remainingSlots")}</span>
                </div>
                <Link
                  href="/bookings"
                  className="text-xs font-semibold text-[#d4ff00] flex items-center gap-1 active:scale-[0.97] transition-transform duration-75"
                >
                  {t("owner.viewFullSchedule")}
                  <ChevronLeft size={14} className="rtl:rotate-0 ltr:rotate-180" />
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ FEATURE 3: Quick Actions ═══ */}
      {actions && (
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Pending */}
            <Link
              href="/bookings?status=PENDING"
              className="relative bg-[#1a1a1a] border border-[#333] rounded-sm p-4 active:scale-[0.97] transition-transform duration-75"
            >
              {actions.pendingCount > 0 && (
                <div className="absolute top-2.5 start-2.5 min-w-[20px] h-5 rounded-sm flex items-center justify-center px-1.5 text-[11px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  {actions.pendingCount}
                </div>
              )}
              <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-amber-500/12 mb-2.5">
                <Hourglass size={16} className="text-amber-400" />
              </div>
              <p className="text-[13px] font-bold text-white">{t("owner.pendingActions")}</p>
              <p className="text-[11px] text-[#666] mt-0.5">
                {actions.pendingCount > 0
                  ? t("owner.needsConfirmation", { count: actions.pendingCount })
                  : t("owner.noPending")}
              </p>
            </Link>

            {/* New Today */}
            <Link
              href="/bookings"
              className="relative bg-[#1a1a1a] border border-[#333] rounded-sm p-4 active:scale-[0.97] transition-transform duration-75"
            >
              {actions.newTodayCount > 0 && (
                <div className="absolute top-2.5 start-2.5 min-w-[20px] h-5 rounded-sm flex items-center justify-center px-1.5 text-[11px] font-bold bg-[#00c2ff]/15 text-[#00c2ff] border border-[#00c2ff]/25">
                  {actions.newTodayCount}
                </div>
              )}
              <div className="flex h-9 w-9 items-center justify-center rounded-sm bg-[#00c2ff]/12 mb-2.5">
                <Sparkles size={16} className="text-[#00c2ff]" />
              </div>
              <p className="text-[13px] font-bold text-white">{t("owner.newToday")}</p>
              <p className="text-[11px] text-[#666] mt-0.5">
                {t("owner.newBookings", { count: actions.newTodayCount })}
              </p>
            </Link>
          </div>

          {/* Quick Contact */}
          {data?.upcomingBookings && data.upcomingBookings.length > 0 && (
            <div className="bg-[#1a1a1a] border border-[#333] rounded-sm p-4">
              <h3 className="text-sm font-bold text-white mb-1">{t("owner.quickContact")}</h3>
              {data.upcomingBookings.slice(0, 4).map((booking) => (
                <div key={booking.id} className="flex items-center gap-3 py-3 border-b border-white/[0.05] last:border-b-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-sm bg-[#d4ff00]/12 text-sm font-bold text-[#d4ff00]">
                    {booking.playerName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-white truncate">{booking.playerName}</p>
                    <p className="text-[11px] text-[#666]">{formatTime(booking.startTime)} — {booking.court.name}</p>
                  </div>
                  {booking.playerPhone && (
                    <a
                      href={buildOwnerToPlayerLink({
                        playerName: booking.playerName,
                        playerPhone: booking.playerPhone,
                        date: formatDateShort(booking.date),
                        startTime: formatTime(booking.startTime),
                      })}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#25D366]/15 text-[#25D366] active:scale-[0.97] transition-transform duration-75"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                      </svg>
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ FEATURE 2: Revenue & Performance Insights ═══ */}
      {insights && (
        <div className="mb-6">
          <div className="grid grid-cols-2 gap-3 mb-3">
            {/* Week Revenue */}
            <div className="bg-[#1a1a1a] border border-[#333] rounded-sm p-4">
              <p className="text-[11px] text-[#666] mb-1.5">{t("owner.weekRevenue")}</p>
              <p className="text-xl font-bold text-white">{formatPrice(insights.weekRevenue)}</p>
              {insights.revenueChangePercent !== 0 && (
                <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold mt-1 px-1.5 py-0.5 rounded-sm ${
                  insights.revenueChangePercent > 0
                    ? "text-emerald-400 bg-emerald-500/10"
                    : "text-[#ff4d4d] bg-[#ff4d4d]/10"
                }`}>
                  {insights.revenueChangePercent > 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(insights.revenueChangePercent)}%
                </span>
              )}
            </div>

            {/* Utilization Ring */}
            <div className="bg-[#1a1a1a] border border-[#333] rounded-sm p-4">
              <p className="text-[11px] text-[#666] mb-1.5">{t("owner.utilization")}</p>
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: `conic-gradient(#d4ff00 0deg, #d4ff00 ${insights.utilizationPercent * 3.6}deg, rgba(255,255,255,0.08) ${insights.utilizationPercent * 3.6}deg)`,
                  }}
                >
                  <div className="w-9 h-9 rounded-full bg-[#1a1a1a] flex items-center justify-center text-xs font-bold text-[#d4ff00]">
                    {insights.utilizationPercent}%
                  </div>
                </div>
              </div>
            </div>

            {/* Busiest Day */}
            <div className="bg-[#1a1a1a] border border-[#333] rounded-sm p-4">
              <p className="text-[11px] text-[#666] mb-1.5">{t("owner.busiestDay")}</p>
              <p className="text-base font-bold text-white">
                {locale === "ar" ? (DAY_NAMES_AR[insights.busiestDay] ?? insights.busiestDay) : insights.busiestDay}
              </p>
              <p className="text-[11px] text-[#666] mt-0.5">
                {insights.busiestDayCount} {t("owner.bookings")}
              </p>
            </div>

            {/* Peak Hour */}
            <div className="bg-[#1a1a1a] border border-[#333] rounded-sm p-4">
              <p className="text-[11px] text-[#666] mb-1.5">{t("owner.peakHour")}</p>
              <p className="text-base font-bold text-white">
                {formatTime(`${insights.peakHour}:00`)}
              </p>
            </div>
          </div>

          {/* Weekly Revenue Bar Chart */}
          {insights.dailyRevenue.length > 0 && (
            <div className="bg-[#1a1a1a] border border-[#333] rounded-sm p-4">
              <h3 className="text-sm font-bold text-white mb-3">{t("owner.weeklyChart")}</h3>
              <div className="flex items-end gap-1.5 h-[100px]">
                {(() => {
                  const maxRev = Math.max(...insights.dailyRevenue.map((d) => d.revenue), 1);
                  return insights.dailyRevenue.map((d) => {
                    const heightPct = (d.revenue / maxRev) * 100;
                    const opacity = 0.3 + (heightPct / 100) * 0.7;
                    return (
                      <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                        {d.revenue > 0 && (
                          <span className="text-[9px] font-semibold text-[#999]">
                            {d.revenue >= 1000 ? `${(d.revenue / 1000).toFixed(1)}k` : d.revenue}
                          </span>
                        )}
                        <div
                          className="w-full rounded-sm"
                          style={{
                            height: `${Math.max(4, heightPct)}%`,
                            backgroundColor: `rgba(212, 255, 0, ${opacity})`,
                          }}
                        />
                        <span className="text-[9px] text-[#666] font-medium">
                          {locale === "ar" ? (DAY_ABBR_AR[d.day] ?? d.day) : d.day}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ FEATURE 4: Player & Occupancy Analytics ═══ */}
      {players && (
        <div className="mb-6">
          {/* Repeat vs New Split */}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="bg-[#1a1a1a] border border-[#333] rounded-sm p-4 text-center">
              <p className="text-2xl font-bold text-[#d4ff00]">{players.repeatCount}</p>
              {(players.repeatCount + players.newCount) > 0 && (
                <p className="text-[11px] font-semibold text-[#d4ff00] mt-0.5">
                  {Math.round((players.repeatCount / (players.repeatCount + players.newCount)) * 100)}%
                </p>
              )}
              <p className="text-[11px] text-[#666] mt-1">{t("owner.repeatPlayers")}</p>
            </div>
            <div className="bg-[#1a1a1a] border border-[#333] rounded-sm p-4 text-center">
              <p className="text-2xl font-bold text-[#00c2ff]">{players.newCount}</p>
              {(players.repeatCount + players.newCount) > 0 && (
                <p className="text-[11px] font-semibold text-[#00c2ff] mt-0.5">
                  {Math.round((players.newCount / (players.repeatCount + players.newCount)) * 100)}%
                </p>
              )}
              <p className="text-[11px] text-[#666] mt-1">{t("owner.newPlayers")}</p>
            </div>
          </div>

          {/* Ratio bar */}
          {(players.repeatCount + players.newCount) > 0 && (
            <div className="bg-[#1a1a1a] border border-[#333] rounded-sm px-4 py-3 mb-3">
              <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${(players.repeatCount / (players.repeatCount + players.newCount)) * 100}%`,
                    background: "linear-gradient(90deg, #d4ff00, #00c2ff)",
                  }}
                />
              </div>
            </div>
          )}

          {/* Top 5 Players */}
          {players.topPlayers.length > 0 && (
            <div className="bg-[#1a1a1a] border border-[#333] rounded-sm p-4 mb-3">
              <h3 className="text-sm font-bold text-white mb-1">{t("owner.topPlayers")}</h3>
              {players.topPlayers.map((p, idx) => {
                const rankColors = ["bg-amber-500/15 text-amber-400", "bg-[#c0c0c0]/12 text-[#c0c0c0]", "bg-[#cd7f32]/12 text-[#cd7f32]"];
                const rankCls = idx < 3 ? rankColors[idx] : "bg-white/[0.06] text-[#999]";
                return (
                  <div key={p.phone} className="flex items-center gap-3 py-2.5 border-b border-white/[0.05] last:border-b-0">
                    <div className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-sm text-[11px] font-bold ${rankCls}`}>
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-white truncate">{p.name}</p>
                      <p className="text-[11px] text-[#666]">
                        {t("owner.lastVisit", { date: formatDateShort(p.lastVisit) })}
                      </p>
                    </div>
                    <span className="text-sm font-bold text-[#d4ff00]">{p.bookingCount}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Occupancy Heatmap */}
          {occupancy && occupancy.heatmap.length > 0 && (
            <div className="bg-[#1a1a1a] border border-[#333] rounded-sm p-4">
              <h3 className="text-sm font-bold text-white mb-3">{t("owner.occupancyMap")}</h3>
              <div className="grid gap-[3px]" style={{ gridTemplateColumns: "40px repeat(7, 1fr)" }}>
                {/* Day headers */}
                <div />
                {["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"].map((d) => (
                  <div key={d} className="text-[9px] text-[#666] text-center font-semibold pb-1">
                    {locale === "ar" ? (DAY_ABBR_AR[d] ?? d) : d}
                  </div>
                ))}

                {/* Rows: time blocks */}
                {["10 AM", "12 PM", "2 PM", "4 PM", "6 PM", "8 PM", "10 PM"].map((label, rowIdx) => (
                  <>
                    <div key={`label-${rowIdx}`} className="text-[9px] text-[#666] flex items-center justify-center font-medium">
                      {locale === "ar" ? label.replace("AM", "ص").replace("PM", "م") : label}
                    </div>
                    {occupancy.heatmap[rowIdx]?.map((intensity, colIdx) => {
                      const opacities = [0.04, 0.12, 0.25, 0.45, 0.7];
                      return (
                        <div
                          key={`${rowIdx}-${colIdx}`}
                          className="aspect-square rounded-sm min-h-[16px]"
                          style={{ backgroundColor: `rgba(212, 255, 0, ${opacities[intensity] ?? 0.04})` }}
                        />
                      );
                    })}
                  </>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-1 mt-2 justify-end">
                <span className="text-[9px] text-[#666]">{t("owner.less")}</span>
                {[0.04, 0.12, 0.25, 0.45, 0.7].map((op, i) => (
                  <div
                    key={i}
                    className="w-3 h-3 rounded-sm"
                    style={{ backgroundColor: `rgba(212, 255, 0, ${op})` }}
                  />
                ))}
                <span className="text-[9px] text-[#666]">{t("owner.more")}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Upcoming bookings */}
      <div>
        <h2 className="text-base font-bold text-[#999] mb-3">
          {t("owner.upcomingBookings")}
        </h2>

        {!data?.upcomingBookings?.length ? (
          <EmptyState
            icon={<CalendarDays size={24} />}
            title={t("owner.noBookings")}
          />
        ) : (
          <div className="space-y-2">
            {data.upcomingBookings.slice(0, 5).map((booking) => (
              <div
                key={booking.id}
                className="bg-[#1a1a1a] border border-[#333] rounded-sm p-3 flex items-center gap-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-[#d4ff00]/20">
                  <User size={18} className="text-[#d4ff00]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">{booking.playerName}</p>
                  <p className="text-xs text-[#666]">{booking.court.name}</p>
                </div>
                <div className="text-end shrink-0">
                  <p className="text-xs text-[#999]">{formatDateShort(booking.date)}</p>
                  <p className="text-xs text-white font-medium flex items-center gap-1">
                    <Clock size={10} />
                    {formatTime(booking.startTime)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
