"use client";

import { ReactNode } from "react";
import { Header } from "./header";
import { BottomNav } from "./bottom-nav";

interface MainLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showNav?: boolean;
  navType?: "public" | "owner" | "player" | "coach";
}

export function MainLayout({
  children,
  showHeader = true,
  showNav = true,
  navType = "public",
}: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0a0f1a]">
      {showHeader && <Header />}
      <main className={`flex-1 ${showNav ? "pb-20" : ""}`}>{children}</main>
      {showNav && <BottomNav variant={navType} />}
    </div>
  );
}
