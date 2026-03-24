"use client";

import { ReactNode, Suspense } from "react";
import { AuthProvider } from "@/lib/auth-context";
import { I18nProvider } from "@/i18n";
import { PostHogProvider } from "@/components/posthog-provider";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <I18nProvider>
        <Suspense fallback={null}>
          <PostHogProvider>{children}</PostHogProvider>
        </Suspense>
      </I18nProvider>
    </AuthProvider>
  );
}
