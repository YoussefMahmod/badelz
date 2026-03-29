"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import Link from "next/link";
import {
  Search,
  Users,
  ChevronDown,
  UserX,
  Gift,
  MessageCircle,
  CalendarCheck,
  Trophy,
  GraduationCap,
  ShoppingBag,
  Check,
  CheckCircle,
  ArrowUpRight,
} from "lucide-react";
import { useTranslation } from "@/i18n";
import { Header } from "@/components/header";
import type { Easing } from "framer-motion";
import type { LucideIcon } from "lucide-react";

const easePremium = [0.22, 1, 0.36, 1] as unknown as Easing;

// ─── Phone Mockup Frame ───
function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-[240px] h-[480px] rounded-sm border-[3px] border-[#333] bg-[#0d0d0d] overflow-hidden shadow-2xl shadow-black/50 animate-float-slow">
      {/* Notch */}
      <div className="mx-auto w-24 h-6 bg-black rounded-b-sm" />
      {/* Screen content */}
      <div className="p-3 space-y-3">{children}</div>
      {/* Bottom nav mockup */}
      <div className="absolute bottom-0 inset-x-0 h-12 bg-[#0d0d0d]/90 border-t border-[#222] flex items-center justify-around px-4">
        <div className="h-1.5 w-1.5 rounded-sm bg-[#d4ff00]" />
        <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
        <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
        <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
        <div className="h-1.5 w-1.5 rounded-full bg-white/20" />
      </div>
    </div>
  );
}

// ─── Hero Phone Mockup (Brutalist Stadium Discover) ───
function HeroPhoneMockup() {
  return (
    <PhoneFrame>
      {/* Header — lime bottom border */}
      <div className="flex items-center justify-between pb-1.5 border-b-2 border-b-[#d4ff00] mb-1">
        <div className="text-[8px] font-bold text-[#d4ff00] uppercase">BADELZ</div>
        <div className="h-2.5 w-2.5 rounded-sm bg-[#333]" />
      </div>
      {/* Featured venue — lime block with clip-path */}
      <div className="bg-[#d4ff00] text-[#0d0d0d] p-2.5 mb-0" style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 6px), 0 100%)" }}>
        <div className="text-[5px] font-bold uppercase opacity-50 tracking-widest">COURTS NEAR YOU</div>
        <div className="text-[11px] font-bold uppercase leading-none mt-0.5">NEW CAIRO PADEL</div>
        <div className="text-[7px] font-bold mt-1">250 EGP</div>
      </div>
      {/* Stadium buttons */}
      <div className="grid grid-cols-3 gap-0 mb-1">
        <div className="bg-[#d4ff00] text-[#0d0d0d] text-center py-1.5 text-[6px] font-bold uppercase relative">
          BOOK
          <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#a0c200]" />
        </div>
        <div className="bg-[#161616] text-[#666] text-center py-1.5 text-[6px] font-bold uppercase border-x border-x-[#0d0d0d]">PLAYERS</div>
        <div className="bg-[#161616] text-[#666] text-center py-1.5 text-[6px] font-bold uppercase">SELL</div>
      </div>
      {/* Section header block */}
      <div className="bg-[#111] px-2 py-1.5 flex items-center justify-between border-b-2 border-b-[#d4ff00]">
        <div className="text-[7px] font-bold uppercase text-white">COURTS</div>
        <div className="text-[5px] text-[#555] uppercase">SEE ALL</div>
      </div>
      {/* Venue rows with left bar */}
      <div className="relative bg-[#0d0d0d] border-b border-b-[#161616] px-2 py-2 flex items-center gap-2">
        <span className="absolute top-0 bottom-0 end-0 w-[3px] bg-[#d4ff00]" />
        <div className="w-8 h-8 bg-[#161616] border border-[#222]" />
        <div className="flex-1 space-y-0.5">
          <div className="h-2 w-16 rounded bg-white/15" />
          <div className="h-1.5 w-10 rounded bg-[#333]" />
        </div>
        <div className="text-[7px] font-bold text-[#d4ff00]">200</div>
      </div>
      <div className="relative bg-[#0d0d0d] border-b border-b-[#161616] px-2 py-2 flex items-center gap-2">
        <span className="absolute top-0 bottom-0 end-0 w-[3px] bg-[#d4ff00]" />
        <div className="w-8 h-8 bg-[#161616] border border-[#222]" />
        <div className="flex-1 space-y-0.5">
          <div className="h-2 w-14 rounded bg-white/15" />
          <div className="h-1.5 w-8 rounded bg-[#333]" />
        </div>
        <div className="text-[7px] font-bold text-[#d4ff00]">180</div>
      </div>
      {/* Lobbies section header */}
      <div className="bg-[#111] px-2 py-1.5 flex items-center justify-between border-b-2 border-b-[#ff4d4d] mt-1">
        <div className="flex items-center gap-1">
          <div className="text-[7px] font-bold uppercase text-white">LOBBIES</div>
          <div className="text-[5px] font-bold bg-[#ff4d4d] text-white px-1 py-px uppercase">LIVE</div>
        </div>
        <div className="text-[5px] text-[#555] uppercase">SEE ALL</div>
      </div>
      {/* Lobby row */}
      <div className="relative bg-[#0d0d0d] border-b border-b-[#161616] px-2 py-2 flex items-center justify-between">
        <span className="absolute top-0 bottom-0 end-0 w-[3px] bg-[#ff4d4d]" />
        <div className="space-y-0.5 ps-1">
          <div className="h-2 w-12 rounded bg-white/15" />
          <div className="h-1.5 w-16 rounded bg-[#333]" />
        </div>
        <div className="text-[10px] font-bold text-[#ff4d4d]">2/4</div>
      </div>
    </PhoneFrame>
  );
}

// ─── Feature Mockups (per tab) ───
function CourtsMockup() {
  return (
    <PhoneFrame>
      <div className="h-3 w-20 rounded bg-white/20 mb-1" />
      {/* Search bar */}
      <div className="h-8 rounded-sm bg-[#1a1a1a] border border-[#333] flex items-center ps-3 gap-2">
        <div className="h-2.5 w-2.5 rounded-sm bg-[#d4ff00]/40" />
        <div className="h-2 w-16 rounded bg-[#222]" />
      </div>
      {/* Venue card */}
      <div className="rounded-sm bg-[#1a1a1a] border border-[#333] overflow-hidden">
        <div className="h-20 bg-[#d4ff00]/8" />
        <div className="p-2 space-y-1.5">
          <div className="h-2.5 w-24 rounded bg-white/15" />
          <div className="h-2 w-16 rounded bg-[#1a1a1a]" />
          <div className="h-2 w-12 rounded bg-[#d4ff00]/30" />
        </div>
      </div>
      {/* Time slot grid */}
      <div className="space-y-1.5">
        <div className="h-2 w-14 rounded bg-white/15" />
        <div className="grid grid-cols-3 gap-1.5">
          {[true, true, false, true, false, true].map((avail, i) => (
            <div
              key={i}
              className={`h-7 rounded-sm flex items-center justify-center text-[8px] font-bold ${
                avail
                  ? "bg-[#d4ff00]/15 border border-[#d4ff00]/20 text-[#d4ff00]/60"
                  : "bg-white/3 border border-[#222] text-white/15"
              }`}
            >
              {`${i + 3}:00`}
            </div>
          ))}
        </div>
      </div>
      {/* CTA */}
      <div className="h-8 rounded-sm bg-[#d4ff00]/20 border border-[#d4ff00]/20" />
    </PhoneFrame>
  );
}

function PlayersMockup() {
  return (
    <PhoneFrame>
      <div className="h-3 w-20 rounded bg-white/20 mb-1" />
      {/* Lobby cards */}
      {[0, 1, 2].map((i) => (
        <div key={i} className="bg-[#1a1a1a] border-s-[3px] border-s-[#ff4d4d] p-2.5 space-y-2 border-b border-b-[#222]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="h-1.5 w-1.5 rounded-full bg-[#ff4d4d]" />
              <div className="h-2 w-20 rounded bg-white/15" />
            </div>
            <div className="h-4 px-1.5 rounded-sm bg-[#ff4d4d]/15 flex items-center">
              <span className="text-[7px] font-bold text-[#ff4d4d]">2/4</span>
            </div>
          </div>
          <div className="flex gap-1">
            {[true, true, false, false].map((filled, j) => (
              <div
                key={j}
                className={`h-5 w-5 rounded-full ${
                  filled ? "bg-[#ff4d4d]/30" : "border border-dashed border-[#333]"
                }`}
              />
            ))}
          </div>
          <div className="h-2 w-24 rounded bg-[#222]" />
        </div>
      ))}
    </PhoneFrame>
  );
}

function CoachesMockup() {
  return (
    <PhoneFrame>
      <div className="h-3 w-20 rounded bg-white/20 mb-1" />
      {/* Coach cards */}
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex gap-2.5 bg-[#1a1a1a] border-t-[3px] border-t-[#00c2ff] p-2.5 mb-1">
          {/* Avatar */}
          <div className="h-12 w-12 shrink-0 rounded-full bg-[#00c2ff]/10 border-2 border-[#00c2ff]/30" />
          <div className="flex-1 space-y-1.5">
            <div className="h-2.5 w-20 rounded bg-white/15" />
            <div className="flex gap-1">
              <div className="h-4 px-1.5 rounded-sm bg-[#00c2ff]/10 flex items-center">
                <span className="text-[6px] font-bold text-[#00c2ff]">PRO</span>
              </div>
            </div>
            <div className="h-2 w-16 rounded bg-[#d4ff00]/20" />
          </div>
        </div>
      ))}
      {/* CTA */}
      <div className="h-8 rounded-sm bg-[#00c2ff] flex items-center justify-center">
        <div className="h-2 w-16 rounded bg-[#0d0d0d]/30" />
      </div>
    </PhoneFrame>
  );
}

function MarketMockup() {
  return (
    <PhoneFrame>
      <div className="h-3 w-20 rounded bg-white/20 mb-1" />
      {/* Category pills */}
      <div className="flex gap-1.5 overflow-hidden">
        <div className="h-6 px-2 rounded-sm bg-[#d4ff00]/10 border border-[#d4ff00]/20 shrink-0" />
        <div className="h-6 px-2 rounded-sm bg-[#1a1a1a] border border-[#333] shrink-0 w-12" />
        <div className="h-6 px-2 rounded-sm bg-[#1a1a1a] border border-[#333] shrink-0 w-10" />
      </div>
      {/* Listing grid */}
      <div className="grid grid-cols-2 gap-2">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="rounded-sm bg-[#1a1a1a] border border-[#333] overflow-hidden">
            <div className={`h-20 ${i === 0 ? "bg-[#d4ff00]/5" : i === 1 ? "bg-[#00c2ff]/5" : i === 2 ? "bg-purple-500/5" : "bg-[#d4ff00]/5"}`}>
              {i === 0 && (
                <div className="m-1">
                  <div className="h-3 w-6 rounded-sm bg-[#d4ff00]/20 flex items-center justify-center">
                    <span className="text-[5px] font-bold text-[#d4ff00]/60">NEW</span>
                  </div>
                </div>
              )}
            </div>
            <div className="p-1.5 space-y-0.5">
              <div className="h-1.5 w-14 rounded bg-white/15" />
              <div className="h-1.5 w-10 rounded bg-[#d4ff00]/20" />
            </div>
          </div>
        ))}
      </div>
    </PhoneFrame>
  );
}

// ─── Screenshot Phone (real app screenshots) ───
function ScreenshotPhone({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative w-[240px] h-[480px] rounded-sm border-[3px] border-[#333] bg-[#0d0d0d] overflow-hidden shadow-2xl shadow-black/50 animate-float-slow">
      <img src={src} alt={alt} className="w-full h-full object-cover object-top" />
    </div>
  );
}

const FEATURE_MOCKUPS = [
  CourtsMockup,
  PlayersMockup,
  CoachesMockup,
  MarketMockup,
];

// ─── Leaderboard Mockup (CSS-built) ───
function LeaderboardMockup() {
  const podium = [
    { rank: 2, name: "أحمد سعيد", tier: "DIAMOND", color: "#b9f2ff", games: 30, h: "h-28" },
    { rank: 1, name: "محمد إبراهيم", tier: "MASTER", color: "#ff4655", games: 55, h: "h-36" },
    { rank: 3, name: "عمر حسن", tier: "GOLD", color: "#ffd700", games: 15, h: "h-24" },
  ];

  return (
    <div className="w-full max-w-sm rounded-sm border border-[#333] bg-[#111] p-5 shadow-2xl shadow-black/40">
      {/* Header */}
      <div className="text-center mb-5">
        <div className="flex items-center justify-center gap-2 mb-1">
          <Trophy size={16} className="text-amber-400" />
          <span className="text-sm font-bold text-[#999]">لاعبين بادلز</span>
        </div>
        <p className="text-[10px] text-[#666]">ليدربورد ورانكينج اللاعبين</p>
      </div>

      {/* Podium */}
      <div className="flex items-end justify-center gap-3 mb-5">
        {podium.map((p) => (
          <div key={p.rank} className="flex flex-col items-center gap-1.5">
            {/* Avatar */}
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold"
              style={{
                border: `2px solid ${p.color}`,
                background: `${p.color}15`,
                color: p.color,
                boxShadow: `0 0 12px ${p.color}30`,
              }}
            >
              {p.name.split(" ").map(w => w[0]).join("")}
            </div>
            {/* Name */}
            <span className="text-[10px] font-semibold text-[#999] truncate w-16 text-center">{p.name}</span>
            {/* Podium bar */}
            <div
              className={`w-16 ${p.h} rounded-t-lg flex flex-col items-center justify-start pt-2`}
              style={{
                background: `linear-gradient(to top, ${p.color}08, ${p.color}20)`,
                borderTop: `2px solid ${p.color}`,
              }}
            >
              <span className="text-lg font-black" style={{ color: p.color }}>#{p.rank}</span>
              <span
                className="text-[8px] font-bold mt-0.5 px-1.5 py-0.5 rounded-sm"
                style={{ background: `${p.color}20`, color: p.color }}
              >
                {p.tier}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Ranked list */}
      <div className="space-y-2">
        {[
          { rank: 4, name: "خالد محمود", tier: "EMERALD", color: "#50c878", games: 12 },
          { rank: 5, name: "يوسف محمد", tier: "GOLD", color: "#ffd700", games: 8 },
        ].map((p) => (
          <div key={p.rank} className="flex items-center gap-3 rounded-sm bg-[#0d0d0d] border-b-2 border-b-[#161616] px-3 py-2">
            <span className="text-xs font-bold text-[#666] w-5">#{p.rank}</span>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0"
              style={{ border: `1.5px solid ${p.color}`, background: `${p.color}10`, color: p.color }}
            >
              {p.name.split(" ").map(w => w[0]).join("")}
            </div>
            <span className="text-xs font-medium text-[#999] flex-1 truncate">{p.name}</span>
            <span
              className="text-[8px] font-bold px-1.5 py-0.5 rounded-sm"
              style={{ background: `${p.color}15`, color: p.color }}
            >
              {p.tier}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Marketplace Mockup (CSS-built) ───
function MarketplaceMockup() {
  const categories = [
    { name: "مضارب", active: true },
    { name: "جزم", active: false },
    { name: "شنط", active: false },
    { name: "كور", active: false },
  ];

  const listings = [
    { title: "Metalbone مضرب", price: "4,500", condition: "NEW", color: "#d4ff00" },
    { title: "جزم بادل Head", price: "1,200", condition: "USED", color: "#00d4ff" },
    { title: "شنطة Nox Pro", price: "800", condition: "NEW", color: "#c084fc" },
    { title: "كور Head Pro S", price: "350", condition: "NEW", color: "#d4ff00" },
  ];

  return (
    <div className="w-full max-w-sm rounded-sm border border-[#333] bg-[#111] p-5 shadow-2xl shadow-black/40">
      {/* Header */}
      <div className="text-center mb-4">
        <div className="flex items-center justify-center gap-2 mb-1">
          <ShoppingBag size={16} className="text-[#d4ff00]" />
          <span className="text-sm font-bold text-[#999]">سوق بادلز</span>
        </div>
        <p className="text-[10px] text-[#666]">اشتري وبيع معدات بادل</p>
      </div>

      {/* Category pills */}
      <div className="flex gap-1.5 mb-4 overflow-hidden">
        {categories.map((cat) => (
          <div
            key={cat.name}
            className={`px-3 py-1 rounded-sm text-[10px] font-semibold shrink-0 ${
              cat.active
                ? "bg-[#d4ff00]/15 border border-[#d4ff00]/30 text-[#d4ff00]"
                : "bg-[#1a1a1a] border border-[#333] text-[#666]"
            }`}
          >
            {cat.name}
          </div>
        ))}
      </div>

      {/* Listing grid */}
      <div className="grid grid-cols-2 gap-2.5">
        {listings.map((item, i) => (
          <div
            key={i}
            className="rounded-sm bg-[#1a1a1a] overflow-hidden"
          >
            {/* Image placeholder */}
            <div
              className="h-20 relative"
              style={{ background: `linear-gradient(135deg, ${item.color}08, ${item.color}03)` }}
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <ShoppingBag size={20} style={{ color: `${item.color}30` }} />
              </div>
              {item.condition === "NEW" && (
                <div className="absolute top-1.5 start-1.5">
                  <span
                    className="text-[7px] font-bold px-1.5 py-0.5 rounded-sm"
                    style={{ background: `${item.color}20`, color: item.color }}
                  >
                    NEW
                  </span>
                </div>
              )}
            </div>
            {/* Info */}
            <div className="p-2 space-y-1">
              <p className="text-[10px] font-semibold text-[#999] truncate">{item.title}</p>
              <p className="text-xs font-bold" style={{ color: item.color }}>{item.price} ج.م</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-4 h-9 rounded-sm bg-[#d4ff00] flex items-center justify-center">
        <span className="text-[11px] font-semibold text-[#0d0d0d]">اعرض للبيع</span>
      </div>
    </div>
  );
}

// ─── Value Chip ───
function ValueChip({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="inline-flex items-center gap-2 bg-[#111] border-b-2 border-b-[#d4ff00] px-4 py-2 rounded-sm">
      <Icon size={14} className="text-[#d4ff00] shrink-0" />
      <span className="text-xs sm:text-sm font-medium text-[#999]">{label}</span>
    </div>
  );
}

// ─── Animated Counter ───
function AnimatedCounter({ target, label, suffix = "+" }: { target: number; label: string; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const duration = 2000;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target]);

  return (
    <div ref={ref} className="text-center">
      <p className="text-3xl sm:text-4xl font-black text-white">
        {count}{suffix}
      </p>
      <p className="text-sm text-[#666] mt-1">{label}</p>
    </div>
  );
}

// ─── Tier Card Stack ───
function TierCardStack() {
  const tiers = [
    { name: "Diamond", color: "#60a5fa", glow: "shadow-blue-500/30" },
    { name: "Emerald", color: "#10b981", glow: "shadow-emerald-500/30" },
    { name: "Gold", color: "#f59e0b", glow: "shadow-amber-500/30" },
    { name: "Bronze", color: "#d97706", glow: "shadow-orange-500/30" },
  ];

  return (
    <div className="relative h-64 w-48 mx-auto perspective-container">
      {tiers.map((tier, i) => (
        <div
          key={tier.name}
          className={`absolute inset-0 rounded-sm border-2 p-4 bg-[#111] ${tier.glow}`}
          style={{
            borderColor: tier.color,
            zIndex: tiers.length - i,
            opacity: 1 - i * 0.15,
            transform: `translateY(${i * -16}px) rotateX(5deg)`,
          }}
        >
          <div
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: tier.color }}
          >
            {tier.name}
          </div>
          <div className="mt-2 h-2 w-16 rounded bg-[#222]" />
          <div className="mt-1.5 h-2 w-10 rounded bg-[#1a1a1a]" />
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════
// Section 1: Hero
// ════════════════════════════════════════════════════
function Hero() {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      <Header />

      <div className="relative z-10 flex-1 flex items-center">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 py-16 sm:py-20 lg:py-0">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12 xl:gap-20">
            {/* Text side */}
            <div className="flex-1 max-w-2xl">
              {/* Badge */}
              <div>
                <span className="inline-flex items-center gap-1.5 bg-[#d4ff00] text-[#0d0d0d] font-[family-name:var(--font-display-en)] text-[10px] uppercase tracking-[0.1em] px-2 py-0.5">
                  {t("landing.platformBadge")}
                </span>
              </div>

              {/* Heading — 3 lines */}
              <div className="mt-6 space-y-1">
                {(["heroLine1", "heroLine2", "heroLine3"] as const).map(
                  (key, i) => (
                    <h1
                      key={key}
                      className="text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight font-[family-name:var(--font-display-en)]"
                    >
                      {i === 2 ? (
                        <span className="text-[#d4ff00]">
                          {t(`landing.${key}`)}
                        </span>
                      ) : (
                        t(`landing.${key}`)
                      )}
                    </h1>
                  )
                )}
              </div>

              {/* Subtitle */}
              <p
                className="mt-5 text-lg text-[#999] max-w-lg leading-relaxed"
              >
                {t("landing.heroSubtitleNew")}
              </p>

              {/* CTAs */}
              <div
                className="mt-8 flex flex-col sm:flex-row gap-3"
              >
                <Link href="/browse">
                  <span
                    className="relative inline-flex items-center justify-center gap-2 bg-[#d4ff00] text-[#0d0d0d] font-[family-name:var(--font-display-en)] uppercase tracking-wide px-8 py-4 text-lg rounded-sm cursor-pointer transition-all min-w-[200px] active:scale-[0.97] duration-75 hover:brightness-110"
                  >
                    {t("landing.startBooking")}
                    <Search size={18} />
                    <span className="absolute bottom-0 inset-x-0 h-1 bg-[#a0c200]" />
                  </span>
                </Link>
                <Link href="/register">
                  <span
                    className="relative inline-flex items-center justify-center bg-[#161616] text-[#888] font-[family-name:var(--font-display-en)] uppercase tracking-wide px-8 py-4 text-lg rounded-sm border-none cursor-pointer transition-all hover:bg-[#1a1a1a] min-w-[200px] active:scale-[0.97] duration-75"
                  >
                    {t("landing.imVenueOwner")}
                    <span className="absolute bottom-0 inset-x-0 h-[2px] bg-[#333]" />
                  </span>
                </Link>
              </div>

              {/* Value chips */}
              <div
                className="mt-10 flex flex-wrap items-center gap-3"
              >
                <ValueChip icon={UserX} label={t("landing.valueNoAccount")} />
                <ValueChip icon={Gift} label={t("landing.valueFreeVenues")} />
                <ValueChip
                  icon={MessageCircle}
                  label={t("landing.valueWhatsApp")}
                />
              </div>
            </div>

            {/* Phone mockup — hidden on mobile */}
            <div
              className="hidden lg:flex flex-1 justify-center perspective-container"
            >
              <HeroPhoneMockup />
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-6 inset-x-0 flex justify-center z-10">
        <div className="flex flex-col items-center gap-1">
          <span className="text-[10px] text-[#666] font-medium">
            {t("landing.scrollToExplore")}
          </span>
          <ChevronDown size={16} className="text-[#666]" />
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════
// Section 2: Feature Showcase — "Everything You Need"
// ════════════════════════════════════════════════════
function FeatureShowcase() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState(0);

  const FEATURES = [
    {
      key: "courts",
      icon: Search,
      title: t("landing.featureCourtTitle"),
      desc: t("landing.featureCourtDesc"),
      bullets: [
        t("landing.featureCourtBullet1"),
        t("landing.featureCourtBullet2"),
        t("landing.featureCourtBullet3"),
      ],
      cta: { label: t("landing.browseCourts"), href: "/browse" },
      color: "#d4ff00",
    },
    {
      key: "players",
      icon: Users,
      title: t("landing.featurePlayTitle"),
      desc: t("landing.featurePlayDesc"),
      bullets: [
        t("landing.featurePlayBullet1"),
        t("landing.featurePlayBullet2"),
        t("landing.featurePlayBullet3"),
      ],
      cta: { label: t("landing.findPlayers"), href: "/play" },
      color: "#ff4d4d",
    },
    {
      key: "coaches",
      icon: GraduationCap,
      title: t("landing.featureCoachTitle"),
      desc: t("landing.featureCoachDesc"),
      bullets: [
        t("landing.featureCoachBullet1"),
        t("landing.featureCoachBullet2"),
        t("landing.featureCoachBullet3"),
      ],
      cta: { label: t("landing.findCoach"), href: "/coaches" },
      color: "#00c2ff",
    },
    {
      key: "market",
      icon: ShoppingBag,
      title: t("landing.featureMarketTitle"),
      desc: t("landing.featureMarketDesc"),
      bullets: [
        t("landing.featureMarketBullet1"),
        t("landing.featureMarketBullet2"),
        t("landing.featureMarketBullet3"),
      ],
      cta: { label: t("landing.browseMarket"), href: "/market" },
      color: "#d4ff00",
    },
  ];

  const active = FEATURES[activeTab];
  const ActiveMockup = FEATURE_MOCKUPS[activeTab];

  return (
    <section className="relative py-24 sm:py-32 px-5 sm:px-8 overflow-hidden">
      <div className="mx-auto max-w-6xl">
        {/* Section heading */}
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-[family-name:var(--font-display-en)] uppercase tracking-wide">
            {t("landing.everythingYouNeed")}
          </h2>
        </div>

        {/* Tab pills */}
        <div
          className="flex gap-2 mb-12 overflow-x-auto pb-2 hide-scrollbar justify-start sm:justify-center"
        >
          {FEATURES.map((feature, i) => {
            const isActive = i === activeTab;
            const Icon = feature.icon;
            return (
              <button
                key={feature.key}
                onClick={() => setActiveTab(i)}
                className={`inline-flex items-center gap-2 rounded-sm px-5 py-2.5 text-sm font-semibold border transition-all duration-300 whitespace-nowrap shrink-0 ${
                  isActive
                    ? "text-white"
                    : "rounded-sm bg-[#161616] border-[#333] text-[#666] hover:text-[#999] hover:border-[#333]"
                }`}
                style={
                  isActive
                    ? {
                        backgroundColor: `${feature.color}15`,
                        borderColor: `${feature.color}30`,
                      }
                    : undefined
                }
              >
                <Icon size={16} style={isActive ? { color: feature.color } : undefined} />
                {feature.title}
              </button>
            );
          })}
        </div>

        {/* Content area */}
        <AnimatePresence mode="wait">
          <motion.div
            key={active.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.35, ease: easePremium }}
            className="flex flex-col-reverse lg:flex-row items-center gap-8 lg:gap-16"
          >
            {/* Text side */}
            <div className="flex-1 max-w-lg">
              <h3
                className="text-2xl sm:text-3xl font-bold text-white mb-4"
                style={{ color: active.color }}
              >
                {active.title}
              </h3>
              <p className="text-[#999] text-lg mb-8 leading-relaxed">
                {active.desc}
              </p>

              {/* Bullet points */}
              <ul className="space-y-4 mb-8">
                {active.bullets.map((bullet, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: 0.1 + i * 0.08,
                      ease: easePremium,
                    }}
                    className="flex items-center gap-3"
                  >
                    <div
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm"
                      style={{ backgroundColor: `${active.color}20` }}
                    >
                      <Check size={12} style={{ color: active.color }} />
                    </div>
                    <span className="text-[#999] text-sm sm:text-base">
                      {bullet}
                    </span>
                  </motion.li>
                ))}
              </ul>

              {/* CTA link */}
              <Link
                href={active.cta.href}
                className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:gap-3 font-[family-name:var(--font-display-en)] uppercase tracking-wide"
                style={{ color: active.color }}
              >
                {active.cta.label}
                <ArrowUpRight size={16} />
              </Link>
            </div>

            {/* Phone mockup side */}
            <div className="flex justify-center perspective-container">
              <ActiveMockup />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════
// Section 3: How It Works
// ════════════════════════════════════════════════════
function HowItWorksSection() {
  const { t } = useTranslation();

  const steps = [
    {
      icon: Search,
      title: t("landing.step1Title"),
      desc: t("landing.step1Desc"),
    },
    {
      icon: CalendarCheck,
      title: t("landing.step2Title"),
      desc: t("landing.step2Desc"),
    },
    {
      icon: Trophy,
      title: t("landing.step3Title"),
      desc: t("landing.step3Desc"),
    },
  ];

  return (
    <section className="relative py-24 sm:py-32 px-5 sm:px-8 overflow-hidden">
      <div className="mx-auto max-w-5xl">
        {/* Section heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white font-[family-name:var(--font-display-en)] uppercase tracking-wide">
            {t("landing.howItWorksTitle")}
          </h2>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
          {/* Connecting dashed line (desktop only) */}
          <div
            className="hidden md:block absolute top-10 inset-x-[15%] h-px border-t border-dashed border-[#d4ff00]/30"
            aria-hidden="true"
          />

          {steps.map((step, i) => (
            <div
              key={i}
              className="relative flex flex-col items-center text-center"
            >
              {/* Icon circle */}
              <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-sm bg-[#d4ff00]/10 border border-[#d4ff00]/20 mb-6">
                <step.icon size={28} className="text-[#d4ff00]" />
              </div>

              {/* Step number badge */}
              <div className="absolute top-0 end-1/2 z-20 flex h-6 w-6 items-center justify-center rounded-sm bg-[#d4ff00] text-[#0d0d0d] text-xs font-bold translate-x-1/2 -translate-y-1">
                {i + 1}
              </div>

              <h3 className="text-xl font-bold text-white mb-2 font-[family-name:var(--font-display-en)] uppercase">
                {step.title}
              </h3>
              <p className="text-[#999] text-sm leading-relaxed max-w-[280px]">
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════
// Section 4: Player Cards & Ranks
// ════════════════════════════════════════════════════
function PlayerCardsSection() {
  const { t } = useTranslation();

  return (
    <section className="relative py-24 sm:py-32 px-5 sm:px-8 overflow-hidden">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          {/* Text side */}
          <div
            className="flex-1 text-center lg:text-start"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-[family-name:var(--font-display-en)] uppercase tracking-wide">
              {t("landing.everyGameLevels")}
            </h2>
            <p className="text-[#999] text-lg max-w-md mx-auto lg:mx-0 mb-8 leading-relaxed">
              {t("landing.everyGameLevelsDesc")}
            </p>
            <Link
              href="/players"
              className="inline-flex items-center gap-2 text-[#d4ff00] font-semibold hover:gap-3 transition-all font-[family-name:var(--font-display-en)] uppercase"
            >
              {t("landing.seeLeaderboard")}
              <ArrowUpRight size={18} />
            </Link>
          </div>

          {/* Leaderboard mockup */}
          <div
            className="flex-1 flex justify-center"
          >
            <LeaderboardMockup />
          </div>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════
// Section 5: Marketplace Showcase
// ════════════════════════════════════════════════════
function MarketplaceSection() {
  const { t } = useTranslation();

  return (
    <section className="relative py-24 sm:py-32 px-5 sm:px-8 overflow-hidden">
      <div className="mx-auto max-w-5xl">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-8 lg:gap-20">
          {/* Marketplace mockup */}
          <div
            className="flex-1 flex justify-center"
          >
            <MarketplaceMockup />
          </div>

          {/* Text side */}
          <div
            className="flex-1 text-center lg:text-start"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 font-[family-name:var(--font-display-en)] uppercase tracking-wide">
              {t("landing.marketShowcaseTitle")}
            </h2>
            <p className="text-[#999] text-lg max-w-md mx-auto lg:mx-0 mb-8 leading-relaxed">
              {t("landing.marketShowcaseDesc")}
            </p>
            <Link
              href="/market"
              className="inline-flex items-center gap-2 text-[#d4ff00] font-semibold hover:gap-3 transition-all font-[family-name:var(--font-display-en)] uppercase"
            >
              {t("landing.browseMarket")}
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

// ════════════════════════════════════════════════════
// Section 6: For Venue Owners
// ════════════════════════════════════════════════════
function VenueOwnerSection() {
  const { t } = useTranslation();
  const [foundingCount, setFoundingCount] = useState(0);
  const [coachCount, setCoachCount] = useState(0);

  useEffect(() => {
    fetch("/api/stats/founding")
      .then((r) => r.json())
      .then((d) => {
        setFoundingCount(d.data?.venues ?? 0);
        setCoachCount(d.data?.coaches ?? 0);
      })
      .catch(() => {});
  }, []);

  const MAX_FOUNDING = 20;
  const venueProgress = Math.min(100, (foundingCount / MAX_FOUNDING) * 100);
  const coachProgress = Math.min(100, (coachCount / MAX_FOUNDING) * 100);

  const venueBullets = [
    t("landing.ctaBullet1"),
    t("landing.ctaBullet2"),
    t("landing.ctaBullet3"),
    t("landing.ctaBullet4"),
  ];

  const coachBullets = [
    t("landing.coachCtaBullet1"),
    t("landing.coachCtaBullet2"),
    t("landing.coachCtaBullet3"),
    t("landing.coachCtaBullet4"),
  ];

  return (
    <section className="relative py-20 sm:py-28 px-5 sm:px-8 overflow-hidden">
      <div className="mx-auto max-w-5xl">
        <div
          className="relative bg-[#111] rounded-sm border-t-[3px] border-t-[#d4ff00] p-8 sm:p-12 overflow-hidden"
        >
          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-10 font-[family-name:var(--font-display-en)] uppercase tracking-wide">
              {t("landing.ownACourt")}
            </h2>

            {/* Two founding partner cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full mb-10">
              {/* Venue card — gold theme */}
              <div
                className="rounded-sm bg-[#1a1a1a] border-t-[3px] border-t-[#ffd700] border border-[#222] p-5 flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#ffd700] font-bold text-sm tracking-wide uppercase">
                    {t("landing.freeForever")}
                  </span>
                  <span className="text-[#999] text-sm font-bold tabular-nums">
                    {foundingCount}/{MAX_FOUNDING}
                  </span>
                </div>
                <div className="w-full h-2 rounded-sm bg-[#222] mb-3 overflow-hidden">
                  <motion.div
                    className="h-full rounded-sm"
                    style={{
                      background: "linear-gradient(90deg, #ffd700, #ffaa00)",
                      boxShadow: "0 0 10px rgba(255,215,0,0.3)",
                    }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${venueProgress}%` }}
                    viewport={{ once: true }}

                  />
                </div>
                <p className="text-[#999] text-xs text-center mb-4">
                  {t("landing.foundingCounter", { count: foundingCount })}
                </p>

                <ul className="space-y-3 text-start mb-6 flex-1">
                  {venueBullets.map((bullet, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-[#d4ff00]/15">
                        <CheckCircle size={12} className="text-[#d4ff00]" />
                      </div>
                      <span className="text-[#999] text-sm">{bullet}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/register" className="mt-auto">
                  <span
                    className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-[#d4ff00] text-[#0d0d0d] px-6 py-3 text-sm font-bold cursor-pointer transition-all active:scale-[0.97] duration-75 hover:brightness-110"
                  >
                    {t("landing.registerVenue")}
                    <ArrowUpRight size={16} />
                  </span>
                </Link>
              </div>

              {/* Coach card — purple theme */}
              <div
                className="rounded-sm bg-[#1a1a1a] border-t-[3px] border-t-[#a78bfa] border border-[#222] p-5 flex flex-col"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[#a78bfa] font-bold text-sm tracking-wide uppercase">
                    {t("landing.freeForever")}
                  </span>
                  <span className="text-[#999] text-sm font-bold tabular-nums">
                    {coachCount}/{MAX_FOUNDING}
                  </span>
                </div>
                <div className="w-full h-2 rounded-sm bg-[#222] mb-3 overflow-hidden">
                  <motion.div
                    className="h-full rounded-sm"
                    style={{
                      background: "linear-gradient(90deg, #a78bfa, #7c3aed)",
                      boxShadow: "0 0 10px rgba(167,139,250,0.3)",
                    }}
                    initial={{ width: 0 }}
                    whileInView={{ width: `${coachProgress}%` }}
                    viewport={{ once: true }}

                  />
                </div>
                <p className="text-[#999] text-xs text-center mb-4">
                  {t("landing.foundingCoachCounter", { count: coachCount })}
                </p>

                <ul className="space-y-3 text-start mb-6 flex-1">
                  {coachBullets.map((bullet, i) => (
                    <li key={i} className="flex items-center gap-2.5">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-sm bg-purple-500/15">
                        <CheckCircle size={12} className="text-purple-400" />
                      </div>
                      <span className="text-[#999] text-sm">{bullet}</span>
                    </li>
                  ))}
                </ul>

                <Link href="/coaches/register" className="mt-auto">
                  <span
                    className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-[#a78bfa] text-[#0d0d0d] px-6 py-3 text-sm font-bold cursor-pointer transition-all active:scale-[0.97] duration-75 hover:brightness-110"
                  >
                    {t("landing.registerCoachCta")}
                    <ArrowUpRight size={16} />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Stats section removed

// ════════════════════════════════════════════════════
// Section 7: Final CTA + Footer
// ════════════════════════════════════════════════════
function FinalCta() {
  const { t } = useTranslation();

  return (
    <section className="relative py-20 sm:py-28 px-5 sm:px-8 overflow-hidden">
      <div className="mx-auto max-w-4xl">
        <div
          className="relative rounded-sm bg-[#d4ff00] p-8 sm:p-14 text-center overflow-hidden"
          style={{ clipPath: "polygon(0 0, 100% 0, 100% calc(100% - 20px), 0 100%)" }}
        >
          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl font-bold text-[#0d0d0d] mb-6 font-[family-name:var(--font-display-en)] uppercase tracking-wide">
              {t("landing.startBookingNow")}
            </h2>

            <Link href="/browse">
              <span
                className="inline-flex items-center gap-2 rounded-sm bg-[#0d0d0d] text-[#d4ff00] font-[family-name:var(--font-display-en)] uppercase tracking-wide px-10 py-4 text-lg font-bold cursor-pointer transition-all hover:bg-[#1a1a1a] active:scale-[0.97] duration-75 border-2 border-[#0d0d0d]"
              >
                {t("landing.browseCourts")}
                <Search size={18} />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="py-8 text-center space-y-1">
      <p className="text-[#666] text-sm">
        {t("landing.footerCopy")} &copy;
      </p>
      <p className="text-white/15 text-xs">{t("landing.madeInEgypt")}</p>
    </footer>
  );
}

// ─── Main Export ───
export function HeroSection() {
  return (
    <div className="bg-[#0d0d0d]">
      <Hero />
      <FeatureShowcase />
      <HowItWorksSection />
      <PlayerCardsSection />
      <MarketplaceSection />
      <VenueOwnerSection />
      {/* Stats section removed */}
      <FinalCta />
      <Footer />
    </div>
  );
}
