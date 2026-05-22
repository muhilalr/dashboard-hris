import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

import { authenticateWithOdoo, findOdooUserByEmail } from "@/lib/odoo";
import {
  canAccessPath,
  getPermissionsForRole,
  ROLE_LABELS,
  type UserRole,
} from "@/lib/roles";

const googleProviderEnabled =
  Boolean(process.env.GOOGLE_CLIENT_ID) &&
  Boolean(process.env.GOOGLE_CLIENT_SECRET);
const devRoleAuthEnabled = process.env.ENABLE_DEV_ROLE_LOGIN === "true";

const demoUsers: Record<
  UserRole,
  {
    id: string;
    uid: number;
    name: string;
    email: string;
    login: string;
    department: string;
    jobTitle: string;
  }
> = {
  staff: {
    id: "demo-staff",
    uid: 9001,
    name: "Demo Staff",
    email: "staff.demo@kodingyuk.local",
    login: "staff.demo",
    department: "Operations",
    jobTitle: "Intern Staff",
  },
  head: {
    id: "demo-head",
    uid: 9002,
    name: "Demo Head",
    email: "head.demo@kodingyuk.local",
    login: "head.demo",
    department: "Product Division",
    jobTitle: "Head of Division",
  },
  manager: {
    id: "demo-manager",
    uid: 9003,
    name: "Demo Manager",
    email: "manager.demo@kodingyuk.local",
    login: "manager.demo",
    department: "Executive Office",
    jobTitle: "Co-Founder",
  },
};

export const authOptions: NextAuthOptions = {
  pages: {
    signIn: "/login",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      name: "Odoo Password",
      id: "odoo-credentials",
      credentials: {
        login: {
          label: "Email",
          type: "text",
        },
        password: {
          label: "Password",
          type: "password",
        },
      },
      async authorize(credentials) {
        const login = credentials?.login?.trim();
        const password = credentials?.password;

        if (!login || !password) {
          throw new Error("Email dan password Odoo wajib diisi.");
        }

        const profile = await authenticateWithOdoo(login, password);

        return {
          id: profile.id,
          uid: profile.uid,
          name: profile.name,
          email: profile.email,
          login: profile.login,
          role: profile.role,
          roleLabel: ROLE_LABELS[profile.role],
          permissions: profile.permissions,
          department: profile.department,
          jobTitle: profile.jobTitle,
          authMethod: "credentials",
        };
      },
    }),
    ...(devRoleAuthEnabled
      ? [
          CredentialsProvider({
            name: "Development Role Access",
            id: "dev-role",
            credentials: {
              role: {
                label: "Role",
                type: "text",
              },
            },
            async authorize(credentials) {
              const requestedRole = credentials?.role as UserRole | undefined;

              if (
                !requestedRole ||
                !["staff", "head", "manager"].includes(requestedRole)
              ) {
                throw new Error("Role demo tidak valid.");
              }

              const demoUser = demoUsers[requestedRole];

              return {
                id: demoUser.id,
                uid: demoUser.uid,
                name: demoUser.name,
                email: demoUser.email,
                login: demoUser.login,
                role: requestedRole,
                roleLabel: ROLE_LABELS[requestedRole],
                permissions: getPermissionsForRole(requestedRole),
                department: demoUser.department,
                jobTitle: demoUser.jobTitle,
                authMethod: "demo",
              };
            },
          }),
        ]
      : []),
    ...(googleProviderEnabled
      ? [
          GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
          }),
        ]
      : []),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "google") {
        return true;
      }

      if (!user.email) {
        return `/auth/error?code=GoogleAccountEmailRequired`;
      }

      let profile = null;

      try {
        profile = await findOdooUserByEmail(user.email);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Login Google gagal saat menghubungkan ke Odoo.";

        return `/auth/error?code=${encodeURIComponent(message)}`;
      }

      if (!profile) {
        return `/auth/error?code=GoogleAccountNotLinked`;
      }

      user.id = profile.id;
      user.uid = profile.uid;
      user.name = profile.name;
      user.email = profile.email;
      user.login = profile.login;
      user.role = profile.role;
      user.roleLabel = ROLE_LABELS[profile.role];
      user.permissions = profile.permissions;
      user.department = profile.department;
      user.jobTitle = profile.jobTitle;
      user.authMethod = "google";

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.uid;
        token.login = user.login;
        token.role = user.role;
        token.roleLabel = user.roleLabel;
        token.permissions = user.permissions;
        token.department = user.department;
        token.jobTitle = user.jobTitle;
        token.authMethod = user.authMethod;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.uid = token.uid as number;
        session.user.login = token.login as string;
        session.user.role = token.role as UserRole;
        session.user.roleLabel = token.roleLabel as string;
        session.user.permissions = (token.permissions as string[]) ?? [];
        session.user.department = (token.department as string | null) ?? null;
        session.user.jobTitle = (token.jobTitle as string | null) ?? null;
        session.user.authMethod = token.authMethod as "credentials" | "google";
      }

      return session;
    },
  },
};

export const isGoogleProviderEnabled = () => googleProviderEnabled;
export const isDevRoleAuthEnabled = () => devRoleAuthEnabled;

export const getDashboardSections = (role: UserRole) => [
  {
    href: "/dashboard",
    title: "Workspace Saya",
    description: "Ringkasan personal, agenda kerja, dan akses tool harian.",
    allowed: true,
  },
  {
    href: "/dashboard/head",
    title: "Kontrol Divisi",
    description: "Approval, pemantauan tim, dan koordinasi operasional divisi.",
    allowed: canAccessPath(role, "/dashboard/head"),
  },
  {
    href: "/dashboard/manager",
    title: "Panel Manajemen",
    description: "Visibilitas lintas divisi untuk C-Level dan co-founders.",
    allowed: canAccessPath(role, "/dashboard/manager"),
  },
];
