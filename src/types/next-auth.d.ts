import { DefaultSession } from "next-auth";

type UserRole = "PLAYER" | "COACH" | "VENUE_OWNER" | "ADMIN";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phone?: string | null;
      role: UserRole;
      isOnboarded: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role?: UserRole;
    phone?: string | null;
    isOnboarded?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    phone?: string | null;
    role?: UserRole;
    isOnboarded?: boolean;
  }
}
