"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Mail, Lock, User, Phone, UserPlus } from "lucide-react";
import { useTranslation } from "@/i18n";
import { LocaleToggle } from "@/components/locale-toggle";
import { Logo } from "@/components/logo";

export default function RegisterPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
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
        router.push("/login");
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

      <h1 className="text-xl font-bold text-gray-900 mb-1">{t("auth.signUp")}</h1>
      <p className="text-sm text-gray-400 mb-6">{t("auth.signUpDesc")}</p>

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

        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
            <Phone size={14} className="text-gray-400" />
            {t("auth.phone")}
            <span className="text-gray-300 text-xs">({t("common.optional")})</span>
          </label>
          <input
            type="tel"
            value={form.phone}
            onChange={(e) => updateField("phone", e.target.value)}
            dir="ltr"
            placeholder="01XXXXXXXXX"
            className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] transition-all"
          />
        </div>

        <motion.button
          type="submit"
          whileTap={{ scale: 0.97 }}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-[#111827] py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-gray-800 disabled:opacity-50"
        >
          <UserPlus size={16} />
          {loading ? t("common.loading") : t("auth.signUp")}
        </motion.button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-400">
        {t("auth.hasAccount")}{" "}
        <Link
          href="/login"
          className="font-semibold text-[#111827] hover:underline transition-colors"
        >
          {t("auth.signIn")}
        </Link>
      </p>
    </div>
  );
}
