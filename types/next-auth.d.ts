import type { DefaultSession } from "next-auth";

import type { UserRole } from "@/lib/roles";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      uid: number;
      login: string;
      role: UserRole;
      roleLabel: string;
      permissions: string[];
      department: string | null;
      jobTitle: string | null;
      authMethod: "credentials" | "google" | "demo";
    };
  }

  interface User {
    uid: number;
    login: string;
    role: UserRole;
    roleLabel: string;
    permissions: string[];
    department: string | null;
    jobTitle: string | null;
    authMethod: "credentials" | "google" | "demo";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    uid: number;
    login: string;
    role: UserRole;
    roleLabel: string;
    permissions: string[];
    department: string | null;
    jobTitle: string | null;
    authMethod: "credentials" | "google" | "demo";
  }
}
