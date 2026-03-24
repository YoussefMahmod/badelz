"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { FullPageSpinner } from "./loading-spinner";

export function OwnerProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
    if (!isLoading && isAuthenticated && user?.role !== "VENUE_OWNER") {
      router.replace("/");
    }
    if (!isLoading && isAuthenticated && !user?.isOnboarded) {
      router.replace("/onboarding");
    }
  }, [isLoading, isAuthenticated, user?.role, user?.isOnboarded, router]);

  if (isLoading) {
    return <FullPageSpinner />;
  }

  if (!isAuthenticated || user?.role !== "VENUE_OWNER" || !user?.isOnboarded) {
    return <FullPageSpinner />;
  }

  return <>{children}</>;
}
