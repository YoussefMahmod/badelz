"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Loader2, Eye, EyeOff, UserCircle, Lock } from "lucide-react";
import { useTranslation, useLocale } from "@/i18n";
import Link from "next/link";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="bg-[#1a1a1a] border border-[#333] rounded-sm p-6 sm:p-8 animate-pulse">
          <div className="h-8 w-32 bg-[#222] rounded mx-auto mb-6" />
          <div className="space-y-4">
            <div className="h-12 bg-[#222] rounded-sm" />
            <div className="h-12 bg-[#222] rounded-sm" />
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
  const { locale, setLocale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
        const session = await fetch("/api/auth/session").then((r) => r.json());

        if (returnTo) {
          router.push(returnTo);
        } else {
          const role = session?.user?.role;
          if (role === "ADMIN") router.push("/admin/dashboard");
          else if (role === "PLAYER") router.push("/my-profile");
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

  if (!mounted) {
    return (
      <div className="bg-[#1a1a1a] border border-[#333] rounded-sm p-6 sm:p-8 animate-pulse">
        <div className="flex justify-center mb-6">
          <div className="h-10 w-32 bg-[#222] rounded" />
        </div>
        <div className="h-5 w-40 bg-[#222] rounded mx-auto mb-2" />
        <div className="h-4 w-52 bg-[#222] rounded mx-auto mb-6" />
        <div className="space-y-4">
          <div className="h-12 bg-[#222] rounded-sm" />
          <div className="h-12 bg-[#222] rounded-sm" />
          <div className="h-12 bg-[#222] rounded-sm" />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#1a1a1a] border border-[#333] rounded-sm p-6 sm:p-8">
      {/* Logo centered */}
      <div className="flex justify-center mb-6">
        <Logo size={40} variant="full" colorMode="dark" />
      </div>

      {/* Title */}
      <h1 className="text-center text-lg font-bold text-white mb-1">
        {t("auth.signInTitle")}
      </h1>
      <p className="text-center text-sm text-[#666] mb-6">
        {t("auth.signInSubtitle")}
      </p>

      {error && (
        <div className="mb-4 rounded-sm bg-[#ff4d4d]/10 border border-[#ff4d4d]/30 px-4 py-3 text-sm text-[#ff4d4d] text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[#999]">
            <UserCircle size={14} className="text-[#666]" />
            {t("auth.emailOrPhone")}
          </label>
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            dir="ltr"
            placeholder={t("auth.emailOrPhonePlaceholder")}
            className="w-full rounded-sm bg-[#0d0d0d] border-2 border-[#333] px-4 py-3.5 text-sm text-white outline-none placeholder:text-[#555] focus:border-[#d4ff00] transition-all"
          />
        </div>

        <div>
          <label className="mb-1.5 flex items-center gap-2 text-sm font-medium text-[#999]">
            <Lock size={14} className="text-[#666]" />
            {t("auth.password")}
          </label>
          <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            dir="ltr"
            placeholder={t("auth.passwordPlaceholder")}
            className="w-full rounded-sm bg-[#0d0d0d] border-2 border-[#333] px-4 py-3.5 pe-12 text-sm text-white outline-none placeholder:text-[#555] focus:border-[#d4ff00] transition-all"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute end-3 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#999] transition-colors cursor-pointer"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          </div>
          <div className="mt-1.5 flex justify-end">
            <Link
              href="/forgot-password"
              className="text-xs text-[#666] hover:text-[#d4ff00] transition-colors"
            >
              {t("auth.forgotPassword")}
            </Link>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="relative flex w-full items-center justify-center gap-2 rounded-sm bg-[#d4ff00] py-4 text-base font-bold text-[#0d0d0d] transition-all active:scale-[0.97] disabled:opacity-50"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            t("auth.signIn")
          )}
          <span className="absolute bottom-0 inset-x-0 h-1 bg-[#a0c200]" />
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-[#666]">
        {t("auth.noAccount")}{" "}
        <Link
          href={`/register${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`}
          className="font-semibold text-[#d4ff00] hover:underline transition-colors"
        >
          {t("auth.signUp")}
        </Link>
      </p>

      {/* Language toggle */}
      <div className="mt-3 flex justify-center">
        <button
          type="button"
          onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
          className="text-xs text-[#666] hover:text-[#999] transition-colors"
        >
          {locale === "ar" ? "English" : "عربي"}
        </button>
      </div>
    </div>
  );
}
