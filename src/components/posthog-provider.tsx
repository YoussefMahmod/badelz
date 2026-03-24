"use client";

import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { initPostHog, posthog } from "@/lib/posthog";
import { useAuth } from "@/lib/auth-context";

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isAuthenticated } = useAuth();

  // Initialize PostHog on mount
  useEffect(() => {
    initPostHog();
  }, []);

  // Track page views on route change
  useEffect(() => {
    if (!posthog.__loaded) return;
    const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : "");
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  // Identify user when authenticated
  useEffect(() => {
    if (!posthog.__loaded) return;
    if (isAuthenticated && user?.id) {
      posthog.identify(user.id, {
        email: user.email,
        name: user.name,
        role: user.role,
        isOnboarded: user.isOnboarded,
      });
    }
  }, [isAuthenticated, user?.id, user?.email, user?.name, user?.role, user?.isOnboarded]);

  return <>{children}</>;
}
