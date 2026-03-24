"use client";

import { ReactNode } from "react";
import { RoleProtectedRoute } from "@/components/role-protected-route";
import { MainLayout } from "@/components/main-layout";

export default function CoachLayout({ children }: { children: ReactNode }) {
  return (
    <RoleProtectedRoute allowedRoles={["COACH"]}>
      <MainLayout showNav navType="coach">
        {children}
      </MainLayout>
    </RoleProtectedRoute>
  );
}
