"use client";

import { ReactNode } from "react";
import { RoleProtectedRoute } from "@/components/role-protected-route";
import { MainLayout } from "@/components/main-layout";

export default function PlayerLayout({ children }: { children: ReactNode }) {
  return (
    <RoleProtectedRoute allowedRoles={["PLAYER"]}>
      <MainLayout showNav navType="player">
        {children}
      </MainLayout>
    </RoleProtectedRoute>
  );
}
