export type UserRole = "staff" | "head" | "manager";

export type Permission =
  | "dashboard:view"
  | "team:view"
  | "team:approve"
  | "division:view"
  | "division:manage"
  | "company:view"
  | "company:manage";

export const ROLE_LABELS: Record<UserRole, string> = {
  staff: "Staff",
  head: "Head",
  manager: "Manager",
};

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  staff: ["dashboard:view", "team:view"],
  head: [
    "dashboard:view",
    "team:view",
    "team:approve",
    "division:view",
    "division:manage",
  ],
  manager: [
    "dashboard:view",
    "team:view",
    "team:approve",
    "division:view",
    "division:manage",
    "company:view",
    "company:manage",
  ],
};

const MANAGER_KEYWORDS =
  /(manager|director|ceo|cto|cfo|coo|chief|founder|co-founder|owner|system|administration|admin)/i;
const HEAD_KEYWORDS = /(head|lead|supervisor|koordinator|coordinator)/i;

const getConfiguredEmails = (envValue?: string) =>
  new Set(
    (envValue ?? "")
      .split(",")
      .map((item) => item.trim().toLowerCase())
      .filter(Boolean),
  );

export const normalizeRole = (role?: string | null): UserRole => {
  if (!role) return "staff";

  const normalized = role.trim().toLowerCase();

  if (normalized === "manager") return "manager";
  if (normalized === "head") return "head";

  if (MANAGER_KEYWORDS.test(normalized)) return "manager";
  if (HEAD_KEYWORDS.test(normalized)) return "head";

  return "staff";
};

export const deriveRole = ({
  email,
  jobTitle,
  groups,
}: {
  email?: string | null;
  jobTitle?: string | null;
  groups?: string[];
}): UserRole => {
  const normalizedEmail = email?.trim().toLowerCase();
  const managerEmails = getConfiguredEmails(process.env.HRIS_MANAGER_EMAILS);
  const headEmails = getConfiguredEmails(process.env.HRIS_HEAD_EMAILS);
  const groupBlob = (groups ?? []).join(" ");

  if (normalizedEmail && managerEmails.has(normalizedEmail)) {
    return "manager";
  }

  if (normalizedEmail && headEmails.has(normalizedEmail)) {
    return "head";
  }

  if (MANAGER_KEYWORDS.test(jobTitle ?? "") || MANAGER_KEYWORDS.test(groupBlob)) {
    return "manager";
  }

  if (HEAD_KEYWORDS.test(jobTitle ?? "") || HEAD_KEYWORDS.test(groupBlob)) {
    return "head";
  }

  return "staff";
};

export const getPermissionsForRole = (role: UserRole): Permission[] =>
  ROLE_PERMISSIONS[role];

export const hasPermission = (role: UserRole, permission: Permission) =>
  ROLE_PERMISSIONS[role].includes(permission);

export const canAccessPath = (role: UserRole, pathname: string) => {
  if (pathname.startsWith("/dashboard/manager")) {
    return role === "manager";
  }

  if (pathname.startsWith("/dashboard/head")) {
    return role === "head" || role === "manager";
  }

  return true;
};
