import { deriveRole, getPermissionsForRole, type UserRole } from "@/lib/roles";

type JsonRpcResponse<T> =
  | {
      jsonrpc: "2.0";
      id: number;
      result: T;
    }
  | {
      jsonrpc: "2.0";
      id: number;
      error: {
        code: number;
        message: string;
        data?: {
          name?: string;
          debug?: string;
          message?: string;
        };
      };
    };

type OdooAuthContext = {
  uid: number;
  password: string;
};

type OdooUserRecord = {
  id: number;
  name?: string;
  login?: string;
  email?: string;
  active?: boolean;
  groups_id?: number[];
  employee_id?: [number, string] | number[] | false;
  partner_id?: [number, string] | number[] | false;
};

type OdooEmployeeRecord = {
  id: number;
  job_title?: string | false;
  department_id?: [number, string] | false;
  user_id?: [number, string] | false;
  work_email?: string | false;
  private_email?: string | false;
};

export type OdooUserProfile = {
  id: string;
  uid: number;
  name: string;
  email: string;
  login: string;
  role: UserRole;
  permissions: string[];
  groups: string[];
  department: string | null;
  jobTitle: string | null;
};

const authDebugEnabled = process.env.AUTH_DEBUG === "true";

const logAuthDebug = (step: string, details: Record<string, unknown>) => {
  if (!authDebugEnabled) return;

  console.log(`[auth-debug] ${step}`, details);
};

const logAuthError = (step: string, error: unknown) => {
  if (!authDebugEnabled) return;

  console.error(`[auth-debug] ${step}`, {
    message: error instanceof Error ? error.message : String(error),
  });
};

const getRequiredEnv = (key: string) => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }

  return value;
};

const getOdooBaseUrl = () => getRequiredEnv("ODOO_URL").replace(/\/$/, "");
const getOdooDatabase = () => getRequiredEnv("ODOO_DB");

const getServiceCredentials = () => {
  const login = process.env.ODOO_USERNAME;
  const password = process.env.ODOO_PASSWORD;

  if (!login || !password) {
    throw new Error("Google SSO requires ODOO_USERNAME and ODOO_PASSWORD.");
  }

  return { login, password };
};

const callJsonRpc = async <T>(
  service: "common" | "object",
  method: string,
  args: unknown[],
): Promise<T> => {
  const response = await fetch(`${getOdooBaseUrl()}/jsonrpc`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      params: {
        service,
        method,
        args,
      },
      id: Date.now(),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Odoo request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as JsonRpcResponse<T>;

  if ("error" in payload) {
    throw new Error(
      payload.error.data?.message ||
        payload.error.message ||
        "Unknown Odoo JSON-RPC error",
    );
  }

  return payload.result;
};

const executeKw = async <T>(
  auth: OdooAuthContext,
  model: string,
  method: string,
  args: unknown[],
  kwargs: Record<string, unknown> = {},
) =>
  callJsonRpc<T>("object", "execute_kw", [
    getOdooDatabase(),
    auth.uid,
    auth.password,
    model,
    method,
    args,
    kwargs,
  ]);

const authenticate = async (login: string, password: string) =>
  callJsonRpc<number>("common", "authenticate", [
    getOdooDatabase(),
    login,
    password,
    {},
  ]);

const getEmployeeId = (employeeId: OdooUserRecord["employee_id"]) => {
  if (
    !employeeId ||
    !Array.isArray(employeeId) ||
    typeof employeeId[0] !== "number"
  ) {
    return null;
  }

  return employeeId[0];
};

const readGroupNames = async (auth: OdooAuthContext, groupIds: number[]) => {
  if (!groupIds.length) return [];

  try {
    const records = await executeKw<Array<{ name?: string }>>(
      auth,
      "res.groups",
      "read",
      [groupIds],
      {
        fields: ["name"],
      },
    );

    return records
      .map((record) => record.name?.trim())
      .filter((name): name is string => Boolean(name));
  } catch (error) {
    logAuthError("readGroupNames", error);
    return [];
  }
};

const readEmployeeRecord = async (
  auth: OdooAuthContext,
  employeeId: number | null,
) => {
  if (!employeeId) return null;

  try {
    const records = await executeKw<OdooEmployeeRecord[]>(
      auth,
      "hr.employee",
      "read",
      [[employeeId]],
      {
        fields: [
          "job_title",
          "department_id",
          "user_id",
          "work_email",
          "private_email",
        ],
      },
    );

    return records[0] ?? null;
  } catch (error) {
    logAuthError("readEmployeeRecord", error);
    return null;
  }
};

const readUserRecord = async (
  auth: OdooAuthContext,
  uid: number,
): Promise<OdooUserRecord | null> => {
  const records = await executeKw<OdooUserRecord[]>(
    auth,
    "res.users",
    "read",
    [[uid]],
    {
      fields: [
        "name",
        "login",
        "email",
        "active",
        "groups_id",
        "employee_id",
        "partner_id",
      ],
    },
  );

  const record = records[0];

  if (!record) return null;

  return { ...record, id: uid };
};

const findUserFromEmployeeEmail = async (
  auth: OdooAuthContext,
  normalizedEmail: string,
): Promise<OdooUserRecord | null> => {
  const [workEmailEmployees, privateEmailEmployees] = await Promise.all([
    executeKw<OdooEmployeeRecord[]>(
      auth,
      "hr.employee",
      "search_read",
      [
        [
          ["work_email", "=", normalizedEmail],
          ["user_id", "!=", false],
        ],
      ],
      {
        fields: ["user_id", "work_email", "private_email"],
        limit: 10,
      },
    ).catch((error) => {
      logAuthError("findUserFromEmployeeEmail.work_email", error);
      return [];
    }),
    executeKw<OdooEmployeeRecord[]>(
      auth,
      "hr.employee",
      "search_read",
      [
        [
          ["private_email", "=", normalizedEmail],
          ["user_id", "!=", false],
        ],
      ],
      {
        fields: ["user_id", "work_email", "private_email"],
        limit: 10,
      },
    ).catch((error) => {
      logAuthError("findUserFromEmployeeEmail.private_email", error);
      return [];
    }),
  ]);

  const employees = [...workEmailEmployees, ...privateEmailEmployees];

  logAuthDebug("findUserFromEmployeeEmail.candidates", {
    normalizedEmail,
    total: employees.length,
    employees: employees.map((employee) => ({
      user_id: employee.user_id,
      work_email: employee.work_email,
      private_email: employee.private_email,
    })),
  });

  const matchedEmployee =
    employees.find((employee) => {
      const candidates = [employee.work_email, employee.private_email]
        .map((value) =>
          typeof value === "string" ? value.trim().toLowerCase() : null,
        )
        .filter((value): value is string => Boolean(value));

      return candidates.includes(normalizedEmail);
    }) ?? employees[0];

  if (!matchedEmployee?.user_id || !Array.isArray(matchedEmployee.user_id)) {
    return null;
  }

  return readUserRecord(auth, matchedEmployee.user_id[0]);
};

const buildProfile = async (
  auth: OdooAuthContext,
  userRecord: OdooUserRecord,
): Promise<OdooUserProfile> => {
  const groupIds = Array.isArray(userRecord.groups_id)
    ? userRecord.groups_id
    : [];
  const [groups, employeeRecord] = await Promise.all([
    readGroupNames(auth, groupIds),
    readEmployeeRecord(auth, getEmployeeId(userRecord.employee_id)),
  ]);

  const department =
    employeeRecord?.department_id && Array.isArray(employeeRecord.department_id)
      ? employeeRecord.department_id[1]
      : null;
  const jobTitle =
    typeof employeeRecord?.job_title === "string"
      ? employeeRecord.job_title
      : null;
  const role = deriveRole({
    email: userRecord.email ?? userRecord.login,
    groups,
    jobTitle,
  });

  logAuthDebug("buildProfile", {
    uid: auth.uid,
    userId: userRecord.id,
    login: userRecord.login,
    email: userRecord.email,
    groupsCount: groups.length,
    department,
    jobTitle,
    role,
  });

  return {
    id: String(userRecord.id),
    uid: auth.uid,
    name: userRecord.name?.trim() || userRecord.login?.trim() || "Unknown User",
    email: userRecord.email?.trim() || userRecord.login?.trim() || "",
    login: userRecord.login?.trim() || userRecord.email?.trim() || "",
    role,
    permissions: getPermissionsForRole(role),
    groups,
    department,
    jobTitle,
  };
};

export const authenticateWithOdoo = async (
  login: string,
  password: string,
): Promise<OdooUserProfile> => {
  logAuthDebug("authenticateWithOdoo.start", { login });
  const uid = await authenticate(login, password);
  logAuthDebug("authenticateWithOdoo.authenticated", { login, uid });

  if (!uid) {
    throw new Error("Email/username atau password tidak valid.");
  }

  const auth = { uid, password };
  const userRecord = await readUserRecord(auth, uid);

  logAuthDebug("authenticateWithOdoo.userRecord", {
    uid,
    found: Boolean(userRecord),
    user: userRecord
      ? {
          id: userRecord.id,
          login: userRecord.login,
          email: userRecord.email,
          employee_id: userRecord.employee_id,
          groupsCount: userRecord.groups_id?.length ?? 0,
        }
      : null,
  });

  if (!userRecord) {
    throw new Error("User Odoo tidak ditemukan.");
  }

  return buildProfile(auth, userRecord);
};

export const findOdooUserByEmail = async (
  email: string,
): Promise<OdooUserProfile | null> => {
  logAuthDebug("findOdooUserByEmail.start", { email });
  const { login, password } = getServiceCredentials();
  const uid = await authenticate(login, password);

  logAuthDebug("findOdooUserByEmail.serviceAuthenticated", {
    serviceLogin: login,
    uid,
  });

  if (!uid) {
    throw new Error("ODOO service account gagal melakukan autentikasi.");
  }

  const auth = { uid, password };
  const normalizedEmail = email.trim().toLowerCase();
  const [emailMatches, loginMatches] = await Promise.all([
    executeKw<OdooUserRecord[]>(
      auth,
      "res.users",
      "search_read",
      [[["email", "=", normalizedEmail]]],
      {
        fields: [
          "name",
          "login",
          "email",
          "active",
          "groups_id",
          "employee_id",
          "partner_id",
        ],
        limit: 10,
      },
    ).catch((error) => {
      logAuthError("findOdooUserByEmail.emailLookup", error);
      return [];
    }),
    executeKw<OdooUserRecord[]>(
      auth,
      "res.users",
      "search_read",
      [[["login", "=", normalizedEmail]]],
      {
        fields: [
          "name",
          "login",
          "email",
          "active",
          "groups_id",
          "employee_id",
          "partner_id",
        ],
        limit: 10,
      },
    ).catch((error) => {
      logAuthError("findOdooUserByEmail.loginLookup", error);
      return [];
    }),
  ]);

  const records = [...emailMatches, ...loginMatches];

  logAuthDebug("findOdooUserByEmail.candidates", {
    email,
    normalizedEmail,
    total: records.length,
    users: records.map((record) => ({
      id: record.id,
      login: record.login,
      email: record.email,
      active: record.active,
      employee_id: record.employee_id,
      partner_id: record.partner_id,
    })),
  });

  const matchedUser =
    records.find((record) => {
      const candidates = [record.email, record.login]
        .map((value) => value?.trim().toLowerCase())
        .filter((value): value is string => Boolean(value));

      return candidates.includes(normalizedEmail);
    }) ?? records[0];

  if (!matchedUser) {
    const employeeLinkedUser = await findUserFromEmployeeEmail(
      auth,
      normalizedEmail,
    );

    logAuthDebug("findOdooUserByEmail.employeeFallback", {
      normalizedEmail,
      found: Boolean(employeeLinkedUser),
      user: employeeLinkedUser
        ? {
            id: employeeLinkedUser.id,
            login: employeeLinkedUser.login,
            email: employeeLinkedUser.email,
          }
        : null,
    });

    if (!employeeLinkedUser) {
      return null;
    }

    return buildProfile(auth, employeeLinkedUser);
  }

  return buildProfile(auth, matchedUser);
};
