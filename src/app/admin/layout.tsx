"use client";

import { ReactNode } from "react";
import { RoleProtectedRoute } from "@/components/role-protected-route";
import { MainLayout } from "@/components/main-layout";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleProtectedRoute allowedRoles={["ADMIN"]}>
      <MainLayout showNav navType="admin">
        {children}
      </MainLayout>
    </RoleProtectedRoute>
  );
}
