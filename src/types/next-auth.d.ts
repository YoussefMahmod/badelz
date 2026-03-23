import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      phone?: string | null;
      role: string;
      isOnboarded: boolean;
    } & DefaultSession["user"];
  }

  interface User {
    role?: string;
    isOnboarded?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    phone?: string | null;
    role?: string;
    isOnboarded?: boolean;
  }
}
