"use client";

import { SessionProvider, useSession } from "next-auth/react";
import { ReactNode } from "react";

export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}

export function useAuth() {
  const { data: session, status } = useSession();

  return {
    session,
    user: session?.user as
      | {
          id: string;
          phone?: string | null;
          name?: string | null;
          email?: string | null;
          role: string;
          isOnboarded: boolean;
        }
      | undefined,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
  };
}
