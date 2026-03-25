"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Loader2, CheckCircle, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "@/i18n";
import { LocaleToggle } from "@/components/locale-toggle";
import { Logo } from "@/components/logo";

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-elevated animate-pulse">
          <div className="h-8 w-32 bg-gray-100 rounded mb-6" />
          <div className="space-y-4">
            <div className="h-10 bg-gray-100 rounded-xl" />
            <div className="h-10 bg-gray-100 rounded-xl" />
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}

function ResetPasswordForm() {
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError(t("auth.passwordMismatch"));
      return;
    }

    if (newPassword.length < 6) {
      setError(t("auth.passwordTooShort"));
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const json = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        setError(json.message || t("common.error"));
      }
    } catch {
      setError(t("common.error"));
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-elevated text-center">
        <p className="text-sm text-gray-500 mb-4">{t("auth.invalidResetLink")}</p>
        <Link
          href="/forgot-password"
          className="text-sm font-semibold text-[#111827] hover:underline"
        >
          {t("auth.requestNewLink")}
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-elevated">
      <div className="flex items-center justify-between mb-6">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <Logo size={32} variant="full" colorMode="light" />
        </Link>
        <LocaleToggle />
      </div>

      {success ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-6"
        >
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle size={28} className="text-emerald-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">
            {t("auth.passwordResetSuccess")}
          </h2>
          <p className="text-sm text-gray-400 mb-6">
            {t("auth.passwordResetSuccessDesc")}
          </p>
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-[#111827] px-6 py-3 text-sm font-bold text-white hover:bg-gray-800 transition-all"
          >
            {t("auth.signIn")}
          </Link>
        </motion.div>
      ) : (
        <>
          <h1 className="text-xl font-bold text-gray-900 mb-1">
            {t("auth.resetPasswordTitle")}
          </h1>
          <p className="text-sm text-gray-400 mb-6">
            {t("auth.resetPasswordDesc")}
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
                <Lock size={14} className="text-gray-400" />
                {t("auth.newPassword")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  dir="ltr"
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 pe-10 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
                <Lock size={14} className="text-gray-400" />
                {t("auth.confirmPassword")}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  dir="ltr"
                  className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 pe-10 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
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
                t("auth.resetPassword")
              )}
            </motion.button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-400">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 font-semibold text-[#111827] hover:underline transition-colors"
            >
              <ArrowLeft size={14} />
              {t("auth.backToLogin")}
            </Link>
          </p>
        </>
      )}
    </div>
  );
}
