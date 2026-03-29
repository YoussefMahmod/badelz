"use client";

import { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden bg-[#0d0d0d]">
      <div className="relative w-full max-w-md">
        {children}
      </div>
    </div>
  );
}
