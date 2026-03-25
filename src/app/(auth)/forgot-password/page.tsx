"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import { useTranslation } from "@/i18n";
import { LocaleToggle } from "@/components/locale-toggle";
import { Logo } from "@/components/logo";

export default function ForgotPasswordPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSent(true);
      } else {
        const json = await res.json();
        setError(json.message || t("common.error"));
      }
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-elevated">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <Logo size={32} variant="full" colorMode="light" />
        </Link>
        <LocaleToggle />
      </div>

      {sent ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-6"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle size={28} className="text-emerald-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            {t("auth.resetLinkSent")}
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            {t("auth.resetLinkSentDesc")}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#111827] hover:underline"
          >
            <ArrowLeft size={14} />
            {t("auth.backToLogin")}
          </Link>
        </motion.div>
      ) : (
        <>
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            {t("auth.forgotPassword")}
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            {t("auth.forgotPasswordDesc")}
          </p>

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
                <Mail size={14} className="text-gray-400" />
                {t("auth.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
                className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] transition-all"
              />
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-full bg-[#111827] py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-gray-800 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  {t("common.loading")}
                </>
              ) : (
                t("auth.sendResetLink")
              )}
            </motion.button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-400">
            <Link
              href="/login"
              className="font-semibold text-[#111827] hover:underline transition-colors"
            >
              {t("auth.backToLogin")}
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
