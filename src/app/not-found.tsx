"use client";

import { motion } from "framer-motion";
import { MapPinOff, Search } from "lucide-react";
import { scaleIn, fadeIn } from "@/lib/animations";
import { useTranslation } from "@/i18n";
import { MainLayout } from "@/components/main-layout";
import Link from "next/link";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <MainLayout showNav navType="public">
      <div className="flex items-center justify-center min-h-[70vh] px-4">
        <motion.div
          {...scaleIn}
          className="flex flex-col items-center text-center max-w-sm w-full"
        >
          <motion.div
            {...fadeIn}
            className="mb-6 text-8xl font-display font-bold bg-gradient-to-r from-[#c8ff00] to-emerald-400 bg-clip-text text-transparent select-none"
          >
            404
          </motion.div>
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/40">
            <MapPinOff className="h-7 w-7" />
          </div>
          <h1 className="mb-2 text-xl font-bold text-white">
            {t("errors.pageNotFound")}
          </h1>
          <p className="mb-8 text-sm text-white/50 leading-relaxed">
            {t("errors.pageNotFoundDesc")}
          </p>
          <div className="flex flex-col gap-3 w-full">
            <Link href="/browse">
              <motion.div
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center gap-2 rounded-full bg-[#c8ff00] px-6 py-3 text-sm font-bold text-[#111827] shadow-sm transition-all hover:shadow-[0_0_20px_rgba(200,255,0,0.2)] cursor-pointer"
              >
                <Search className="h-4 w-4" />
                {t("errors.backToBrowse")}
              </motion.div>
            </Link>
            <Link
              href="/"
              className="text-sm text-white/50 hover:text-white/70 transition-colors py-2"
            >
              {t("errors.goHome")}
            </Link>
          </div>
        </motion.div>
      </div>
    </MainLayout>
  );
}
