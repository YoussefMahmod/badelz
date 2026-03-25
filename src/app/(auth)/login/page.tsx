"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Mail, Lock, LogIn, Loader2, Eye, EyeOff } from "lucide-react";
import { useTranslation } from "@/i18n";
import { LocaleToggle } from "@/components/locale-toggle";
import { Logo } from "@/components/logo";

export default function LoginPage() {
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
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(t("auth.invalidCredentials"));
      } else {
        // Fetch session to determine redirect
        const session = await fetch("/api/auth/session").then((r) => r.json());

        if (returnTo) {
          router.push(returnTo);
        } else {
          const role = session?.user?.role;
          if (role === "PLAYER") router.push("/my-profile");
          else if (role === "COACH") router.push("/coach-dashboard");
          else router.push("/dashboard");
        }
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

      <h1 className="text-xl font-bold text-gray-900 mb-1">{t("auth.signIn")}</h1>
      <p className="text-sm text-gray-400 mb-6">{t("auth.signInDesc")}</p>

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

        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-gray-700">
            <Lock size={14} className="text-gray-400" />
            {t("auth.password")}
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              dir="ltr"
              className="w-full rounded-xl bg-gray-50 border border-gray-200 px-4 py-3 pe-12 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:ring-2 focus:ring-[#c8ff00]/30 focus:border-[#c8ff00] transition-all"
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

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-xs text-gray-400 hover:text-[#111827] transition-colors"
          >
            {t("auth.forgotPassword")}
          </Link>
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
            <>
              <LogIn size={16} />
              {t("auth.signIn")}
            </>
          )}
        </motion.button>
      </form>

      <p className="mt-5 text-center text-sm text-gray-400">
        {t("auth.noAccount")}{" "}
        <Link
          href={`/register${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
          className="font-semibold text-[#111827] hover:underline transition-colors"
        >
          {t("auth.signUp")}
        </Link>
      </p>
    </div>
  );
}
