"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Sparkles,
  Search,
  Users,
  ShoppingBag,
  LayoutDashboard,
  RectangleHorizontal,
  CalendarDays,
  Settings,
  User,
  Gamepad2,
  GraduationCap,
} from "lucide-react";
import { useTranslation } from "@/i18n";
import { useAuth } from "@/lib/auth-context";
import { useState, useEffect, type ReactNode } from "react";

interface NavItem {
  href: string;
  icon: ReactNode;
  activeIcon: ReactNode;
  labelKey: string;
}

const ROLE_TO_VARIANT: Record<string, "owner" | "player" | "coach"> = {
  VENUE_OWNER: "owner",
  PLAYER: "player",
  COACH: "coach",
};

export function BottomNav({ variant = "public" }: { variant?: "public" | "owner" | "player" | "coach" }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const { user, isLoading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Only auto-detect after mount to avoid hydration mismatch
  const effectiveVariant = mounted && variant === "public" && user?.role && !isLoading
    ? ROLE_TO_VARIANT[user.role] ?? "public"
    : variant;

  const publicTabs: NavItem[] = [
    {
      href: "/",
      icon: <Sparkles size={22} strokeWidth={1.5} />,
      activeIcon: <Sparkles size={22} strokeWidth={2} />,
      labelKey: "nav.discover",
    },
    {
      href: "/browse",
      icon: <Search size={22} strokeWidth={1.5} />,
      activeIcon: <Search size={22} strokeWidth={2} />,
      labelKey: "nav.browse",
    },
    {
      href: "/play",
      icon: <Users size={22} strokeWidth={1.5} />,
      activeIcon: <Users size={22} strokeWidth={2} />,
      labelKey: "nav.play",
    },
    {
      href: "/coaches",
      icon: <GraduationCap size={22} strokeWidth={1.5} />,
      activeIcon: <GraduationCap size={22} strokeWidth={2} />,
      labelKey: "nav.coaches",
    },
    {
      href: "/market",
      icon: <ShoppingBag size={22} strokeWidth={1.5} />,
      activeIcon: <ShoppingBag size={22} strokeWidth={2} />,
      labelKey: "nav.market",
    },
  ];

  const ownerTabs: NavItem[] = [
    {
      href: "/dashboard",
      icon: <LayoutDashboard size={22} strokeWidth={1.5} />,
      activeIcon: <LayoutDashboard size={22} strokeWidth={2} />,
      labelKey: "nav.dashboard",
    },
    {
      href: "/courts",
      icon: <RectangleHorizontal size={22} strokeWidth={1.5} />,
      activeIcon: <RectangleHorizontal size={22} strokeWidth={2} />,
      labelKey: "nav.courts",
    },
    {
      href: "/bookings",
      icon: <CalendarDays size={22} strokeWidth={1.5} />,
      activeIcon: <CalendarDays size={22} strokeWidth={2} />,
      labelKey: "nav.bookings",
    },
    {
      href: "/settings",
      icon: <Settings size={22} strokeWidth={1.5} />,
      activeIcon: <Settings size={22} strokeWidth={2} />,
      labelKey: "nav.settings",
    },
  ];

  const playerTabs: NavItem[] = [
    {
      href: "/browse",
      icon: <Search size={22} strokeWidth={1.5} />,
      activeIcon: <Search size={22} strokeWidth={2} />,
      labelKey: "nav.browse",
    },
    {
      href: "/play",
      icon: <Gamepad2 size={22} strokeWidth={1.5} />,
      activeIcon: <Gamepad2 size={22} strokeWidth={2} />,
      labelKey: "nav.play",
    },
    {
      href: "/coaches",
      icon: <GraduationCap size={22} strokeWidth={1.5} />,
      activeIcon: <GraduationCap size={22} strokeWidth={2} />,
      labelKey: "nav.coaches",
    },
    {
      href: "/market",
      icon: <ShoppingBag size={22} strokeWidth={1.5} />,
      activeIcon: <ShoppingBag size={22} strokeWidth={2} />,
      labelKey: "nav.market",
    },
    {
      href: "/my-profile",
      icon: <User size={22} strokeWidth={1.5} />,
      activeIcon: <User size={22} strokeWidth={2} />,
      labelKey: "nav.myProfile",
    },
  ];

  const coachTabs: NavItem[] = [
    {
      href: "/coach-dashboard",
      icon: <User size={22} strokeWidth={1.5} />,
      activeIcon: <User size={22} strokeWidth={2} />,
      labelKey: "nav.myProfile",
    },
    {
      href: "/browse",
      icon: <Search size={22} strokeWidth={1.5} />,
      activeIcon: <Search size={22} strokeWidth={2} />,
      labelKey: "nav.browse",
    },
    {
      href: "/coaches",
      icon: <Users size={22} strokeWidth={1.5} />,
      activeIcon: <Users size={22} strokeWidth={2} />,
      labelKey: "nav.coaches",
    },
    {
      href: "/play",
      icon: <Gamepad2 size={22} strokeWidth={1.5} />,
      activeIcon: <Gamepad2 size={22} strokeWidth={2} />,
      labelKey: "nav.play",
    },
    {
      href: "/market",
      icon: <ShoppingBag size={22} strokeWidth={1.5} />,
      activeIcon: <ShoppingBag size={22} strokeWidth={2} />,
      labelKey: "nav.market",
    },
  ];

  const tabMap: Record<string, NavItem[]> = {
    public: publicTabs,
    owner: ownerTabs,
    player: playerTabs,
    coach: coachTabs,
  };

  const tabs = tabMap[effectiveVariant] ?? publicTabs;

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-50 bg-[#0a0f1a]/90 backdrop-blur-xl border-t border-white/5 safe-bottom"
      role="navigation"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-2.5">
        {tabs.map((tab) => {
          const active = isActive(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative flex flex-col items-center gap-1 min-h-[44px] justify-center transition-colors cursor-pointer ${tabs.length > 4 ? "px-1.5" : "px-3"}`}
              aria-current={active ? "page" : undefined}
            >
              <span
                className={
                  active
                    ? "flex items-center justify-center rounded-xl p-1.5 text-[#c8ff00]"
                    : "flex items-center justify-center p-1.5 text-white/30"
                }
              >
                {active ? tab.activeIcon : tab.icon}
              </span>
              {active && (
                <motion.div
                  layoutId="nav-dot"
                  className="h-1.5 w-1.5 rounded-full bg-[#c8ff00]"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={`text-xs font-medium leading-tight ${
                  active ? "text-[#c8ff00]" : "text-white/30"
                }`}
              >
                {t(tab.labelKey as Parameters<typeof t>[0])}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
