"use client";

import { useEffect, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

interface RoleProtectedRouteProps {
  children: ReactNode;
  allowedRoles: string[];
}

function DarkFullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0f1a]">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 rounded-full border-2 border-white/10 border-t-[#c8ff00] animate-spin" />
        <div className="h-1 w-12 rounded-full bg-white/5 overflow-hidden">
          <div className="h-full w-1/2 rounded-full bg-[#c8ff00]/40 animate-[shimmer_1.5s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}

export function RoleProtectedRoute({ children, allowedRoles }: RoleProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
    if (!isLoading && isAuthenticated && user?.role && !allowedRoles.includes(user.role)) {
      router.replace("/");
    }
  }, [isLoading, isAuthenticated, user?.role, router, allowedRoles]);

  if (isLoading) {
    return <DarkFullPageSpinner />;
  }

  if (!isAuthenticated || !user?.role || !allowedRoles.includes(user.role)) {
    return <DarkFullPageSpinner />;
  }

  return <>{children}</>;
}
