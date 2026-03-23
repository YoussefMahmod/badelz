"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  Share2,
  Users,
  ArrowUpRight,
  ChevronDown,
  UserX,
  Gift,
  MessageCircle,
  Download,
  Link2,
  CreditCard,
  Banknote,
  Globe,
  Languages,
  CalendarCheck,
  Trophy,
  GraduationCap,
  ShoppingBag,
  Check,
} from "lucide-react";
import { useTranslation } from "@/i18n";
import { Header } from "@/components/header";
import {
  heroTextReveal,
  perspectiveTilt,
  staggerDarkBento,
  darkBentoItem,
  scaleInGlow,
  revealUp,
} from "@/lib/animations";
import type { Easing } from "framer-motion";
import type { LucideIcon } from "lucide-react";

const easePremium = [0.22, 1, 0.36, 1] as unknown as Easing;

// ─── Floating Game Card ───
function FloatingGameCard() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 1.2, ease: easePremium }}
      className="absolute bottom-6 start-4 sm:start-6 z-20 animate-float"
    >
      <div className="glass-dark-strong rounded-2xl p-4 w-[200px] sm:w-[220px] shadow-dark-elevated border border-[#c8ff00]/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#c8ff00]">
            <Users size={11} className="text-[#111827]" />
          </div>
          <span className="text-xs font-bold text-white/90">
            {t("game.gameLink")}
          </span>
        </div>

        <div className="grid grid-cols-4 gap-1.5 mb-3">
          {[true, true, false, false].map((filled, i) => (
            <motion.div
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 1.6 + i * 0.1,
                type: "spring",
                stiffness: 300,
              }}
              className={`aspect-square rounded-full flex items-center justify-center text-[10px] font-bold ${
                filled
                  ? "bg-[#c8ff00] text-[#111827]"
                  : "border-2 border-dashed border-white/20"
              }`}
            >
              {filled ? (
                <span>{["A", "M"][i]}</span>
              ) : (
                <motion.span
                  animate={{ opacity: [0.2, 0.6, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-white/40"
                >
                  ?
                </motion.span>
              )}
            </motion.div>
          ))}
        </div>

        <p className="text-[10px] text-[#c8ff00] font-semibold mb-2">
          {t("landing.needPlayers")}
        </p>

        <div className="flex items-center justify-center gap-1.5 rounded-full bg-white/10 py-1.5 px-3 text-[10px] font-bold text-white/80">
          <Share2 size={9} />
          {t("landing.share")}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Value Chip ───
function ValueChip({
  icon: Icon,
  label,
}: {
  icon: LucideIcon;
  label: string;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full glass-dark px-4 py-2 border border-white/10">
      <Icon size={14} className="text-[#c8ff00] shrink-0" />
      <span className="text-xs sm:text-sm font-medium text-white/70">
        {label}
      </span>
    </div>
  );
}

// ─── Hero Section (above the fold) ───
function Hero() {
  const { t } = useTranslation();

  const staggerParent = {
    animate: {
      transition: { staggerChildren: 0.12, delayChildren: 0.15 },
    },
  };

  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden">
      <Header />

      <div className="relative z-10 flex-1 flex items-center">
        <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 py-16 sm:py-20 lg:py-0">
          <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12 xl:gap-20">
            {/* Text side */}
            <motion.div
              className="flex-1 max-w-2xl"
              variants={staggerParent}
              initial="initial"
              animate="animate"
            >
              {/* Badge */}
              <motion.div variants={heroTextReveal}>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c8ff00]/10 border border-[#c8ff00]/20 px-4 py-1.5 text-sm font-semibold text-[#c8ff00]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#c8ff00] animate-pulse" />
                  {t("landing.heroBadge")}
                </span>
              </motion.div>

              {/* Heading */}
              <motion.h1
                variants={heroTextReveal}
                className="mt-6 text-5xl sm:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight"
              >
                {t("landing.heroTitlePre")}{" "}
                <span className="text-[#c8ff00] glow-lime-text">
                  {t("landing.heroTitleHighlight")}
                </span>{" "}
                {t("landing.heroTitlePost")}
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                variants={heroTextReveal}
                className="mt-5 text-lg text-white/55 max-w-lg leading-relaxed"
              >
                {t("landing.heroSubtitle")}
              </motion.p>

              {/* CTAs */}
              <motion.div
                variants={heroTextReveal}
                className="mt-8 flex flex-col sm:flex-row gap-3"
              >
                <Link href="/browse">
                  <motion.span
                    whileHover={{
                      scale: 1.03,
                      boxShadow:
                        "0 0 30px rgba(200,255,0,0.3), 0 0 60px rgba(200,255,0,0.1)",
                    }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-[#c8ff00] text-[#111827] px-8 py-4 text-lg font-bold cursor-pointer transition-all min-w-[200px]"
                  >
                    {t("landing.browseCourts")}
                    <Search size={18} />
                  </motion.span>
                </Link>
                <Link href="/register">
                  <motion.span
                    whileHover={{ scale: 1.03, y: -2 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center justify-center rounded-full border border-white/20 text-white/80 px-8 py-4 text-lg font-semibold cursor-pointer transition-all hover:border-white/30 hover:bg-white/5 min-w-[200px]"
                  >
                    {t("landing.listVenue")}
                  </motion.span>
                </Link>
              </motion.div>

              {/* Value Proposition Chips */}
              <motion.div
                variants={heroTextReveal}
                className="mt-10 flex flex-wrap items-center gap-3"
              >
                <ValueChip
                  icon={UserX}
                  label={t("landing.valueNoAccount")}
                />
                <ValueChip
                  icon={Gift}
                  label={t("landing.valueFreeVenues")}
                />
                <ValueChip
                  icon={MessageCircle}
                  label={t("landing.valueWhatsApp")}
                />
              </motion.div>
            </motion.div>

            {/* Photo side */}
            <motion.div
              className="relative flex-1 mt-12 lg:mt-0 max-w-[560px] lg:max-w-none perspective-container"
              {...perspectiveTilt}
            >
              {/* Decorative lime orbs */}
              <div
                className="absolute -top-12 -end-12 w-48 h-48 rounded-full bg-[#c8ff00]/10 blur-3xl pointer-events-none"
                aria-hidden="true"
              />
              <div
                className="absolute -bottom-8 -start-8 w-36 h-36 rounded-full bg-[#c8ff00]/8 blur-3xl pointer-events-none"
                aria-hidden="true"
              />

              <div className="relative aspect-[4/5] sm:aspect-[3/4] lg:aspect-[4/5] rounded-2xl overflow-hidden perspective-card shadow-dark-elevated">
                <Image
                  src="https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&h=1000&fit=crop"
                  alt={t("landing.heroPhotoAlt")}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0f1a]/80 via-[#0a0f1a]/20 to-transparent" />
                <FloatingGameCard />
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-6 inset-x-0 flex justify-center z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="flex flex-col items-center gap-1"
        >
          <span className="text-[10px] text-white/30 font-medium">
            {t("landing.scrollToExplore")}
          </span>
          <ChevronDown size={16} className="text-white/30" />
        </motion.div>
      </motion.div>
    </section>
  );
}

// ─── Comparison Card ───
function ComparisonCard({
  iconOld: IconOld,
  iconNew: IconNew,
  oldText,
  newText,
  oldWayLabel,
  newWayLabel,
  index,
}: {
  iconOld: LucideIcon;
  iconNew: LucideIcon;
  oldText: string;
  newText: string;
  oldWayLabel: string;
  newWayLabel: string;
  index: number;
}) {
  return (
    <motion.div
      variants={darkBentoItem}
      className="group relative glass-dark-strong rounded-2xl gradient-border overflow-hidden transition-all duration-300 hover:translate-y-[-4px]"
    >
      {/* Hover glow */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[#c8ff00]/[0.03] pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 grid grid-cols-[1fr_auto_1fr] items-stretch min-h-[120px]">
        {/* Old way */}
        <div className="flex flex-col items-center justify-center p-5 sm:p-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 mb-3">
            <IconOld size={18} className="text-white/30" />
          </div>
          <p className="text-xs font-semibold text-white/25 uppercase tracking-wider mb-1.5">
            {oldWayLabel}
          </p>
          <p className="text-sm text-white/40 line-through decoration-white/20">
            {oldText}
          </p>
        </div>

        {/* Divider with arrow */}
        <div className="flex items-center justify-center px-2">
          <div className="relative flex flex-col items-center">
            <div className="w-px h-full bg-gradient-to-b from-transparent via-white/10 to-transparent absolute" />
            <div className="relative z-10 flex h-8 w-8 items-center justify-center rounded-full bg-[#c8ff00]/10 border border-[#c8ff00]/20">
              <ArrowUpRight size={14} className="text-[#c8ff00] rotate-45 rtl:-rotate-45" />
            </div>
          </div>
        </div>

        {/* New way */}
        <div className="flex flex-col items-center justify-center p-5 sm:p-6 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#c8ff00]/10 mb-3">
            <IconNew size={18} className="text-[#c8ff00]" />
          </div>
          <p className="text-xs font-semibold text-[#c8ff00]/70 uppercase tracking-wider mb-1.5">
            {newWayLabel}
          </p>
          <p className="text-sm text-white/80 font-medium">
            {newText}
          </p>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Differentiators Section ───
function DifferencesSection() {
  const { t } = useTranslation();

  const comparisons = [
    {
      iconOld: Download,
      iconNew: Link2,
      oldText: t("landing.diffCompare1Old"),
      newText: t("landing.diffCompare1New"),
    },
    {
      iconOld: CreditCard,
      iconNew: Banknote,
      oldText: t("landing.diffCompare2Old"),
      newText: t("landing.diffCompare2New"),
    },
    {
      iconOld: Globe,
      iconNew: Languages,
      oldText: t("landing.diffCompare3Old"),
      newText: t("landing.diffCompare3New"),
    },
  ];

  const oldWayLabel = t("landing.diffOldWay");
  const newWayLabel = t("landing.diffNewWay");

  return (
    <section className="relative py-24 sm:py-32 px-5 sm:px-8 overflow-hidden">
      <div className="mx-auto max-w-4xl">
        {/* Section heading */}
        <motion.div className="text-center mb-16" {...revealUp}>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            {t("landing.diffTitle")}
          </h2>
        </motion.div>

        {/* Comparison cards */}
        <motion.div
          className="grid grid-cols-1 gap-5"
          variants={staggerDarkBento}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          {comparisons.map((comp, i) => (
            <ComparisonCard
              key={i}
              iconOld={comp.iconOld}
              iconNew={comp.iconNew}
              oldText={comp.oldText}
              newText={comp.newText}
              oldWayLabel={oldWayLabel}
              newWayLabel={newWayLabel}
              index={i}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── How It Works Section ───
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
        <motion.div className="text-center mb-16" {...revealUp}>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            {t("landing.howItWorksTitle")}
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-6">
          {/* Connecting dotted line (desktop only) */}
          <div
            className="hidden md:block absolute top-10 inset-x-[15%] h-px border-t border-dashed border-white/10"
            aria-hidden="true"
          />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="relative flex flex-col items-center text-center"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{
                duration: 0.6,
                delay: i * 0.15,
                ease: easePremium,
              }}
            >
              {/* Icon circle */}
              <div className="relative z-10 flex h-20 w-20 items-center justify-center rounded-full bg-[#c8ff00]/10 border border-[#c8ff00]/20 mb-6">
                <step.icon size={28} className="text-[#c8ff00]" />
              </div>

              {/* Step number badge */}
              <div
                className="absolute top-0 end-1/2 translate-x-1/2 -translate-y-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#c8ff00] text-[#111827] text-xs font-bold z-20"
                style={{ transform: "translate(50%, -25%)" }}
              >
                {i + 1}
              </div>

              <h3 className="text-xl font-bold text-white mb-2">
                {step.title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed max-w-[280px]">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Community Card ───
function CommunityCard({
  icon: Icon,
  title,
  desc,
  href,
  index,
}: {
  icon: LucideIcon;
  title: string;
  desc: string;
  href: string;
  index: number;
}) {
  return (
    <motion.div variants={darkBentoItem}>
      <Link href={href} className="block group">
        <div className="relative glass-dark-strong rounded-2xl p-6 sm:p-8 gradient-border transition-all duration-300 hover:translate-y-[-4px] hover:shadow-[0_0_30px_rgba(200,255,0,0.08)] cursor-pointer">
          {/* Hover glow */}
          <div
            className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-[#c8ff00]/[0.03] pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#c8ff00]/10 mb-5 transition-colors duration-300 group-hover:bg-[#c8ff00]/15">
              <Icon size={22} className="text-[#c8ff00]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {title}
            </h3>
            <p className="text-white/55 text-sm leading-relaxed">
              {desc}
            </p>
          </div>

          {/* Arrow hint */}
          <div className="absolute top-6 end-6 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
            <ArrowUpRight size={16} className="text-[#c8ff00]/60" />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// ─── Community Showcase Section ───
function CommunitySection() {
  const { t } = useTranslation();

  const cards = [
    {
      icon: Users,
      title: t("landing.communityGameLink"),
      desc: t("lobby.noLobbiesDesc"),
      href: "/play",
    },
    {
      icon: CreditCard,
      title: t("landing.communityPlayerCard"),
      desc: t("player.viewYourCardDesc"),
      href: "/my-card",
    },
    {
      icon: GraduationCap,
      title: t("landing.communityCoaches"),
      desc: t("coach.registerDesc"),
      href: "/coaches",
    },
    {
      icon: ShoppingBag,
      title: t("landing.communityMarket"),
      desc: t("market.noListingsDesc"),
      href: "/market",
    },
  ];

  return (
    <section className="relative py-24 sm:py-32 px-5 sm:px-8 overflow-hidden">
      <div className="mx-auto max-w-5xl">
        {/* Section heading */}
        <motion.div className="text-center mb-16" {...revealUp}>
          <h2 className="text-3xl sm:text-4xl font-bold text-white">
            {t("landing.communityTitle")}
          </h2>
          <p className="mt-3 text-white/50 text-lg max-w-md mx-auto">
            {t("landing.communityDesc")}
          </p>
        </motion.div>

        {/* Community cards */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 gap-5"
          variants={staggerDarkBento}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
        >
          {cards.map((card, i) => (
            <CommunityCard
              key={i}
              icon={card.icon}
              title={card.title}
              desc={card.desc}
              href={card.href}
              index={i}
            />
          ))}
        </motion.div>
      </div>
    </section>
  );
}

// ─── Venue Owner CTA Section ───
function CtaBanner() {
  const { t } = useTranslation();

  const bullets = [
    t("landing.ctaBullet1"),
    t("landing.ctaBullet2"),
    t("landing.ctaBullet3"),
  ];

  return (
    <section className="relative py-20 sm:py-28 px-5 sm:px-8 overflow-hidden">
      <div className="mx-auto max-w-4xl">
        <motion.div
          className="relative glass-dark-strong rounded-3xl p-8 sm:p-12 gradient-border overflow-hidden"
          {...scaleInGlow}
          whileInView={scaleInGlow.animate}
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Background glow */}
          <div
            className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#c8ff00]/5 via-transparent to-[#c8ff00]/3 pointer-events-none"
            aria-hidden="true"
          />

          <div className="relative z-10 flex flex-col items-center text-center">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-8">
              {t("landing.ctaTitle")}
            </h2>

            {/* Bullet points */}
            <ul className="space-y-4 mb-10 text-start">
              {bullets.map((bullet, i) => (
                <motion.li
                  key={i}
                  className="flex items-center gap-3"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.4,
                    delay: 0.2 + i * 0.1,
                    ease: easePremium,
                  }}
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#c8ff00]/15">
                    <Check size={13} className="text-[#c8ff00]" />
                  </div>
                  <span className="text-white/70 text-base sm:text-lg">
                    {bullet}
                  </span>
                </motion.li>
              ))}
            </ul>

            <Link href="/register">
              <motion.span
                whileHover={{
                  scale: 1.05,
                  boxShadow:
                    "0 0 40px rgba(200,255,0,0.3), 0 0 80px rgba(200,255,0,0.1)",
                }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 rounded-full bg-[#c8ff00] text-[#111827] px-10 py-4 text-lg font-bold cursor-pointer transition-all"
              >
                {t("landing.ctaButton")}
                <ArrowUpRight size={18} />
              </motion.span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// ─── Footer ───
function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="py-8 text-center space-y-1">
      <p className="text-white/25 text-sm">
        {t("landing.footerCopy")} &copy;
      </p>
      <p className="text-white/15 text-xs">
        {t("landing.madeInEgypt")}
      </p>
    </footer>
  );
}

// ─── Main Export ───
export function HeroSection() {
  return (
    <div className="gradient-mesh noise-overlay">
      <Hero />
      <DifferencesSection />
      <HowItWorksSection />
      <CommunitySection />
      <CtaBanner />
      <Footer />
    </div>
  );
}
