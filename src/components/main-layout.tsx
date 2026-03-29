"use client";

import { ReactNode } from "react";
import { Header } from "./header";
import { BottomNav } from "./bottom-nav";
import { InstallPrompt } from "./install-prompt";

interface MainLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showNav?: boolean;
  navType?: "public" | "owner" | "player" | "coach" | "admin";
}

export function MainLayout({
  children,
  showHeader = true,
  showNav = true,
  navType = "public",
}: MainLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-[#0d0d0d]">
      {showHeader && <Header />}
      <main className={`flex-1 ${showNav ? "pb-24" : ""}`}>{children}</main>
      {showNav && <BottomNav variant={navType} />}
      {showNav && <InstallPrompt />}
    </div>
  );
}
