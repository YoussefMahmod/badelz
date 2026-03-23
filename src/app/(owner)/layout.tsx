"use client";

import { ReactNode } from "react";
import { OwnerProtectedRoute } from "@/components/owner-protected-route";
import { MainLayout } from "@/components/main-layout";

export default function OwnerLayout({ children }: { children: ReactNode }) {
  return (
    <OwnerProtectedRoute>
      <MainLayout showNav navType="owner">
        {children}
      </MainLayout>
    </OwnerProtectedRoute>
  );
}
