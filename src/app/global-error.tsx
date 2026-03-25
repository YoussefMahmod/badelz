"use client";

import { useEffect, useState } from "react";

const translations = {
  ar: {
    title: "حصلت مشكلة",
    description: "حصل خطأ غير متوقع. جرب تاني.",
    tryAgain: "جرب تاني",
    goHome: "الرئيسية",
  },
  en: {
    title: "Something went wrong",
    description: "An unexpected error occurred. Please try again.",
    tryAgain: "Try Again",
    goHome: "Go Home",
  },
};

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [locale, setLocale] = useState<"ar" | "en">("ar");
  const t = translations[locale];
  const dir = locale === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    try {
      const stored = localStorage.getItem("badelz-locale");
      if (stored === "en") setLocale("en");
    } catch {}
    // Error logged server-side; no client console output
  }, [error]);

  return (
    <html lang={locale} dir={dir}>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0f1a",
          fontFamily: "Cairo, sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: 400,
            width: "90%",
            padding: 32,
            borderRadius: 20,
            backgroundColor: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(16px)",
            border: "1px solid rgba(255,255,255,0.1)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              margin: "0 auto 16px",
              borderRadius: 16,
              backgroundColor: "rgba(239,68,68,0.1)",
              border: "1px solid rgba(239,68,68,0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
            }}
          >
            !
          </div>
          <h1
            style={{
              color: "white",
              fontSize: 20,
              fontWeight: 700,
              margin: "0 0 8px",
            }}
          >
            {t.title}
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 14,
              margin: "0 0 24px",
              lineHeight: 1.6,
            }}
          >
            {t.description}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={() => reset()}
              style={{
                backgroundColor: "#c8ff00",
                color: "#111827",
                border: "none",
                borderRadius: 999,
                padding: "12px 24px",
                fontSize: 14,
                fontWeight: 700,
                fontFamily: "Cairo, sans-serif",
                cursor: "pointer",
              }}
            >
              {t.tryAgain}
            </button>
            <a
              href="/"
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              {t.goHome}
            </a>
          </div>
          <button
            onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
            style={{
              marginTop: 24,
              background: "none",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              padding: "4px 12px",
              color: "rgba(255,255,255,0.4)",
              fontSize: 12,
              cursor: "pointer",
              fontFamily: "Cairo, sans-serif",
            }}
          >
            {locale === "ar" ? "English" : "عربي"}
          </button>
        </div>
      </body>
    </html>
  );
}
