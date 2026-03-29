"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  CalendarDays,
  Calendar,
  BarChart3,
  Wallet,
  Clock,
  User,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useTranslation } from "@/i18n";
import { formatPrice, formatTime, formatDateShort } from "@/lib/format";
import { LoadingSpinner } from "@/components/loading-spinner";
import { EmptyState } from "@/components/empty-state";
import { OnboardingBanner } from "@/components/onboarding-banner";

interface DashboardData {
  todayBookings: number;
  weekBookings: number;
  totalBookings: number;
  revenue: number;
  upcomingBookings: {
    id: string;
    playerName: string;
    playerPhone: string;
    date: string;
    startTime: string;
    endTime: string;
    status: string;
    court: { name: string; nameAr: string | null };
  }[];
}

export default function DashboardPage() {
  const { t } = useTranslation();
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
          });
        } else {
          setData({
            todayBookings: 0,
            weekBookings: 0,
            totalBookings: 0,
            revenue: 0,
            upcomingBookings: [],
          });
        }
      } catch {
        setData({
          todayBookings: 0,
          weekBookings: 0,
          totalBookings: 0,
          revenue: 0,
          upcomingBookings: [],
        });
      } finally {
        setLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  if (loading) return <LoadingSpinner />;

  const stats = [
    {
      icon: CalendarDays,
      label: t("owner.todayBookings"),
      value: data?.todayBookings ?? 0,
      color: "text-blue-400",
      bg: "bg-[#d4ff00]",
    },
    {
      icon: Calendar,
      label: t("owner.weekBookings"),
      value: data?.weekBookings ?? 0,
      color: "text-cyan-400",
      bg: "bg-cyan-500/15",
    },
    {
      icon: BarChart3,
      label: t("owner.totalBookings"),
      value: data?.totalBookings ?? 0,
      color: "text-indigo-400",
      bg: "bg-indigo-500/15",
    },
    {
      icon: Wallet,
      label: t("owner.revenue"),
      value: formatPrice(data?.revenue ?? 0),
      color: "text-amber-400",
      bg: "bg-amber-500/15",
    },
  ];

  return (
    <div className="mx-auto max-w-3xl px-4 py-5">
      <OnboardingBanner />

      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-xl font-bold text-white">
          {t("owner.welcome", { name: user?.name || "" })}
        </h1>
        <p className="text-sm text-[#666]">{t("owner.dashboard")}</p>
      </motion.div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-[#1a1a1a] border border-[#333] rounded-sm p-4"
            >
              <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${stat.bg} mb-3`}>
                <Icon size={18} className={idx === 0 ? "text-[#d4ff00]" : stat.color} />
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-[#666] mt-0.5">{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Upcoming bookings */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
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
            {data.upcomingBookings.slice(0, 5).map((booking, idx) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + idx * 0.05 }}
                className="bg-[#1a1a1a] border border-[#333] rounded-xl p-3 flex items-center gap-3"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#d4ff00]/20">
                  <User size={18} className="text-[#d4ff00]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {booking.playerName}
                  </p>
                  <p className="text-xs text-[#666]">
                    {booking.court.name}
                  </p>
                </div>
                <div className="text-end shrink-0">
                  <p className="text-xs text-[#999]">
                    {formatDateShort(booking.date)}
                  </p>
                  <p className="text-xs text-white font-medium flex items-center gap-1">
                    <Clock size={10} />
                    {formatTime(booking.startTime)}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
