"use client";

import { motion, AnimatePresence } from "framer-motion";

interface RankUpFlashProps {
  show: boolean;
  tierColor: string;
}

export function RankUpFlash({ show, tierColor }: RankUpFlashProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{
            opacity: [0, 1, 0.8, 0],
            scale: [0.8, 1.1, 1],
          }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2 }}
          className="absolute inset-0 z-50 rounded-2xl pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${tierColor}40 0%, transparent 70%)`,
            boxShadow: `0 0 60px ${tierColor}60, 0 0 120px ${tierColor}30`,
          }}
        />
      )}
    </AnimatePresence>
  );
}
