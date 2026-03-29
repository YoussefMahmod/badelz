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
    <div className="bg-[#1a1a1a] border border-[#333] rounded-sm p-6 sm:p-8 ">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <Logo size={32} variant="full" colorMode="dark" />
        </Link>
        <LocaleToggle />
      </div>

      {sent ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-6"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-sm bg-emerald-50">
            <CheckCircle size={28} className="text-[#d4ff00]" />
          </div>
          <h2 className="text-lg font-bold text-white mb-2">
            {t("auth.resetLinkSent")}
          </h2>
          <p className="text-sm text-[#666] mb-6">
            {t("auth.resetLinkSentDesc")}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#d4ff00] hover:underline"
          >
            <ArrowLeft size={14} />
            {t("auth.backToLogin")}
          </Link>
        </motion.div>
      ) : (
        <>
          <h1 className="text-xl font-bold text-white mb-1">
            {t("auth.forgotPassword")}
          </h1>
          <p className="text-sm text-[#666] mb-6">
            {t("auth.forgotPasswordDesc")}
          </p>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-sm bg-[#ff4d4d]/10 border border-[#ff4d4d]/30 px-4 py-3 text-sm text-[#ff4d4d]"
            >
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[#999]">
                <Mail size={14} className="text-[#666]" />
                {t("auth.email")}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                dir="ltr"
                className="w-full rounded-sm bg-[#0d0d0d] border border-[#333] px-4 py-3 text-sm text-white outline-none placeholder:text-[#666] focus:ring-2 focus:ring-[#d4ff00]/30 focus:border-[#d4ff00] transition-all"
              />
            </div>

            <motion.button
              type="submit"
              whileTap={{ scale: 0.97 }}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-sm bg-[#1a1a1a] py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#222] disabled:opacity-50"
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

          <p className="mt-5 text-center text-sm text-[#666]">
            <Link
              href="/login"
              className="font-semibold text-[#d4ff00] hover:underline transition-colors"
            >
              {t("auth.backToLogin")}
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
