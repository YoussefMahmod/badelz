"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  RectangleHorizontal,
  CalendarDays,
  Wallet,
  Clock,
  User,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTranslation, useLocale } from "@/i18n";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { formatPrice, formatTime, formatDateShort } from "@/lib/format";
import { LoadingSpinner } from "@/components/loading-spinner";

interface RecentBooking {
  id: string;
  playerName: string;
  playerPhone: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  venue: { name: string; nameAr: string | null };
  court: { name: string; nameAr: string | null };
}

interface AdminDashboardData {
  totalVenues: number;
  totalCourts: number;
  totalBookings: number;
  totalRevenue: number;
  todayBookings: number;
  weekBookings: number;
  monthBookings: number;
  recentBookings: RecentBooking[];
}

const STATUS_STYLES: Record<string, string> = {
  CONFIRMED: "bg-emerald-500/15 text-emerald-400",
  PENDING: "bg-amber-500/15 text-amber-400",
  CANCELLED: "bg-red-500/15 text-red-400",
  COMPLETED: "bg-blue-500/15 text-blue-400",
};

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const { locale } = useLocale();
  const { user } = useAuth();
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/admin/stats");
        const json = await res.json();
        if (res.ok && json.data) {
          setData({
            totalVenues: json.data.totalVenues ?? 0,
            totalCourts: json.data.totalCourts ?? 0,
            totalBookings: json.data.totalBookings ?? 0,
            totalRevenue: json.data.totalRevenue ?? 0,
            todayBookings: json.data.todayBookings ?? 0,
            weekBookings: json.data.weekBookings ?? 0,
            monthBookings: json.data.monthBookings ?? 0,
            recentBookings: json.data.recentBookings ?? [],
          });
        } else {
          setData({
            totalVenues: 0,
            totalCourts: 0,
            totalBookings: 0,
            totalRevenue: 0,
            todayBookings: 0,
            weekBookings: 0,
            monthBookings: 0,
            recentBookings: [],
          });
        }
      } catch {
        setData({
          totalVenues: 0,
          totalCourts: 0,
          totalBookings: 0,
          totalRevenue: 0,
          todayBookings: 0,
          weekBookings: 0,
          monthBookings: 0,
          recentBookings: [],
        });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <LoadingSpinner />;

  const mainStats = [
    {
      icon: Building2,
      label: t("admin.totalVenues"),
      value: data?.totalVenues ?? 0,
      color: "text-indigo-400",
      bg: "bg-indigo-500/15",
    },
    {
      icon: RectangleHorizontal,
      label: t("admin.totalCourts"),
      value: data?.totalCourts ?? 0,
      color: "text-blue-400",
      bg: "bg-blue-500/15",
    },
    {
      icon: CalendarDays,
      label: t("admin.totalBookings"),
      value: data?.totalBookings ?? 0,
      color: "text-cyan-400",
      bg: "bg-cyan-500/15",
    },
    {
      icon: Wallet,
      label: t("admin.totalRevenue"),
      value: formatPrice(data?.totalRevenue ?? 0),
      color: "text-amber-400",
      bg: "bg-amber-500/15",
    },
  ];

  const periodStats = [
    {
      icon: Clock,
      label: t("admin.todayBookings"),
      value: data?.todayBookings ?? 0,
    },
    {
      icon: Calendar,
      label: t("admin.weekBookings"),
      value: data?.weekBookings ?? 0,
    },
    {
      icon: TrendingUp,
      label: t("admin.monthBookings"),
      value: data?.monthBookings ?? 0,
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      {/* Welcome header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-xl font-bold text-white/90">
          {t("admin.platformStats")}
        </h1>
        <p className="text-sm text-white/40">
          {user?.name || t("admin.dashboard")}
        </p>
      </motion.div>

      {/* Main stat cards — 2x2 grid */}
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 gap-3 mb-4"
      >
        {mainStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              variants={staggerItem}
              className="bg-white/5 border border-white/10 rounded-2xl p-4"
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.bg} mb-3`}
              >
                <Icon size={18} className={stat.color} />
              </div>
              <p className="text-2xl font-bold text-white/90">{stat.value}</p>
              <p className="text-xs text-white/40 mt-0.5">{stat.label}</p>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Period cards — 3 columns */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="grid grid-cols-3 gap-3 mb-8"
      >
        {periodStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-500/15 mx-auto mb-2">
                <Icon size={15} className="text-indigo-400" />
              </div>
              <p className="text-xl font-bold text-white/90">{stat.value}</p>
              <p className="text-[11px] text-white/40 mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </motion.div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <h2 className="text-base font-bold text-white/70 mb-3">
          {t("admin.recentActivity")}
        </h2>

        {!data?.recentBookings?.length ? (
          <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/40">
              <CalendarDays size={24} />
            </div>
            <p className="text-sm text-white/50">{t("admin.noActivity")}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.recentBookings.slice(0, 10).map((booking, idx) => {
              const venueName =
                locale === "ar" && booking.venue.nameAr
                  ? booking.venue.nameAr
                  : booking.venue.name;
              const courtName =
                locale === "ar" && booking.court.nameAr
                  ? booking.court.nameAr
                  : booking.court.name;
              const statusStyle =
                STATUS_STYLES[booking.status] ?? "bg-white/10 text-white/50";

              return (
                <motion.div
                  key={booking.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + idx * 0.04 }}
                  className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-3"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/15">
                    <User size={18} className="text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white/90 truncate">
                      {booking.playerName}
                    </p>
                    <p className="text-xs text-white/40 truncate">
                      {venueName} &middot; {courtName}
                    </p>
                  </div>
                  <div className="text-end shrink-0 flex flex-col items-end gap-1">
                    <span
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusStyle}`}
                    >
                      {booking.status}
                    </span>
                    <p className="text-[11px] text-white/50">
                      {formatDateShort(booking.date)}
                    </p>
                    <p className="text-[11px] text-white/90 font-medium flex items-center gap-1">
                      <Clock size={10} />
                      {formatTime(booking.startTime)}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
