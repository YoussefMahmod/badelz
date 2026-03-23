"use client";

import { motion } from "framer-motion";
import { MessageCircle } from "lucide-react";

interface WhatsAppShareButtonProps {
  shareUrl: string;
  label: string;
  fullWidth?: boolean;
}

export function WhatsAppShareButton({ shareUrl, label, fullWidth = false }: WhatsAppShareButtonProps) {
  return (
    <motion.a
      whileTap={{ scale: 0.96 }}
      href={shareUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-center gap-2 rounded-full bg-green-500 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-green-600 ${
        fullWidth ? "w-full" : "px-6"
      }`}
    >
      <MessageCircle size={18} />
      {label}
    </motion.a>
  );
}
