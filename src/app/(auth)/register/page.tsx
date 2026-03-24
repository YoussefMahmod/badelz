"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Lock, User, Phone, UserPlus, Users, GraduationCap, Building2 } from "lucide-react";
import { useTranslation } from "@/i18n";
import { LocaleToggle } from "@/components/locale-toggle";
import { Logo } from "@/components/logo";

type RoleType = "PLAYER" | "COACH" | "VENUE_OWNER";

const ROLE_CONFIG = {
  PLAYER: {
    icon: Users,
    labelKey: "roles.player" as const,
    descKey: "roles.playerDesc" as const,
    signUpKey: "roles.playerSignUp" as const,
  },
  COACH: {
    icon: GraduationCap,
    labelKey: "roles.coach" as const,
    descKey: "roles.coachDesc" as const,
    signUpKey: "roles.coachSignUp" as const,
  },
  VENUE_OWNER: {
    icon: Building2,
    labelKey: "roles.owner" as const,
    descKey: "roles.ownerDesc" as const,
    signUpKey: "roles.ownerSignUp" as const,
  },
} as const;

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-elevated animate-pulse">
          <div className="h-8 w-32 bg-gray-100 rounded mb-6" />
          <div className="space-y-4">
            <div className="h-10 bg-gray-100 rounded-xl" />
            <div className="h-10 bg-gray-100 rounded-xl" />
            <div className="h-10 bg-gray-100 rounded-xl" />
          </div>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();

  const returnTo = searchParams.get("returnTo");
  const roleParam = searchParams.get("role");
  const validRoles: RoleType[] = ["PLAYER", "COACH", "VENUE_OWNER"];
  const validRole: RoleType | undefined = roleParam && validRoles.includes(roleParam as RoleType)
    ? (roleParam as RoleType)
    : undefined;

  const [form, setForm] = useState({
    name: searchParams.get("name") || "",
    email: "",
    password: "",
    phone: searchParams.get("phone") || "",
    role: (validRole || "PLAYER") as "PLAYER" | "COACH" | "VENUE_OWNER",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const roleConfig = ROLE_CONFIG[form.role];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.phone) {
      setError(t("auth.phoneRequired"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          role: form.role,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.message || t("common.error"));
        setLoading(false);
        return;
      }

      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.push(`/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`);
      } else if (returnTo) {
        router.push(returnTo);
      } else if (form.role === "PLAYER") {
        router.push("/my-profile");
      } else if (form.role === "COACH") {
        router.push("/coach-dashboard");
      } else {
        router.push("/dashboard");
      }
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-elevated">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/" className="transition-opacity hover:opacity-80">
            <Logo size={32} variant="full" colorMode="light" />
          </Link>
        </div>
        <LocaleToggle />
      </div>

      {/* Role Selector */}
      <p className="text-xs font-medium text-gray-400 mb-2">{t("auth.selectRole")}</p>
      <div className="grid grid-cols-3 gap-2 mb-5">
        {(Object.keys(ROLE_CONFIG) as RoleType[]).map((roleKey) => {
          const config = ROLE_CONFIG[roleKey];
          const Icon = config.icon;
          const active = form.role === roleKey;

          return (
            <motion.button
              key={roleKey}
              type="button"
              whileTap={{ scale: 0.95 }}
              onClick={() => updateField("role", roleKey)}
              className={`relative flex flex-col items-center gap-1.5 rounded-xl p-3 cursor-pointer transition-all ${
                active
                  ? "border-2 border-[#111827] bg-[#111827]/5"
                  : "border border-gray-200 bg-gray-50"
              }`}
            >
              <Icon
                size={20}
                className={active ? "text-[#111827]" : "text-gray-400"}
              />
              <span
                className={`text-xs font-medium ${
                  active ? "text-[#111827]" : "text-gray-500"
                }`}
              >
                {t(config.labelKey)}
              </span>
            </motion.button>
          );
        })}
      </div>

      {/* Dynamic heading based on role */}
      <AnimatePresence mode="wait">
        <motion.div
          key={form.role}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.2 }}
        >
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            {t(roleConfig.signUpKey)}
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            {t(roleConfig.descKey)}
          </p>
        </motion.div>
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600"
        >
          {error}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
            <User size={14} className="text-gray-400" />
            {t("auth.name")}
          </label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
            required
            className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] transition-all"
          />
        </div>

        {/* Email */}
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
            <Mail size={14} className="text-gray-400" />
            {t("auth.email")}
          </label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => updateField("email", e.target.value)}
            required
            dir="ltr"
            className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] transition-all"
          />
        </div>

        {/* Password */}
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
            <Lock size={14} className="text-gray-400" />
            {t("auth.password")}
          </label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
            required
            dir="ltr"
            className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] transition-all"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
            <Phone size={14} className="text-gray-400" />
            {t("auth.phone")}
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            required
            dir="ltr"
            placeholder="01XXXXXXXXX"
            className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] transition-all"
          />
        </div>

        {/* Submit */}
        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#111827] py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-gray-800 disabled:opacity-50"
        >
          <UserPlus size={16} />
          {loading ? t("common.loading") : t(roleConfig.signUpKey)}
        </motion.button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-400">
        {t("auth.hasAccount")}{" "}
        <Link
          href={`/login${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
          className="font-semibold text-[#111827] hover:underline transition-colors"
        >
          {t("auth.signIn")}
        </Link>
      </p>
    </div>
  );
}
