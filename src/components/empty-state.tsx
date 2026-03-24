"use client";

import { motion } from "framer-motion";
import { scaleIn } from "@/lib/animations";
import type { ReactNode } from "react";

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      {...scaleIn}
      className="flex flex-col items-center justify-center px-6 py-16 text-center"
    >
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/40">
        {icon}
      </div>
      <h3 className="mb-1 text-lg font-semibold text-white">{title}</h3>
      {description && (
        <p className="mb-6 max-w-xs text-sm text-white/50">{description}</p>
      )}
      {action && (
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={action.onClick}
          className="rounded-full bg-[#c8ff00] px-6 py-2.5 text-sm font-bold text-[#111827] shadow-sm transition-all hover:shadow-[0_0_20px_rgba(200,255,0,0.2)] cursor-pointer active:scale-95"
        >
          {action.label}
        </motion.button>
      )}
    </motion.div>
  );
}
