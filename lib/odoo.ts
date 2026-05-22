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
  apiKey: string;
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

type OdooRecruitmentStageRecord = {
  id: number;
  name?: string;
  sequence?: number;
  hired_stage?: boolean;
  fold?: boolean;
};

type OdooRecruitmentApplicantRecord = {
  id: number;
  partner_name?: string | false;
  email_from?: string | false;
  partner_phone?: string | false;
  partner_mobile?: string | false;
  stage_id?: [number, string] | false;
  job_id?: [number, string] | false;
  department_id?: [number, string] | false;
  source_id?: [number, string] | false;
  type_id?: [number, string] | false;
  degree_id?: [number, string] | false;
  create_date?: string | false;
  write_date?: string | false;
  priority?: string | number | false;
  description?: string | false;
};

type OdooRecruitmentJobRecord = {
  id: number;
  name?: string;
  department_id?: [number, string] | false;
  no_of_recruitment?: number;
  application_count?: number;
  new_application_count?: number;
};

export type OdooRecruitmentStage = {
  id: string;
  odooId: number;
  name: string;
  sequence: number;
  hired: boolean;
  folded: boolean;
};

export type OdooRecruitmentApplicant = {
  id: string;
  odooId: number;
  name: string;
  avatar: string;
  jobId: string;
  position: string;
  division: string;
  stageId: string;
  stageName: string;
  source: string;
  university: string;
  major: string;
  appliedAt: string;
  lastUpdated: string;
  tags: string[];
  priority: number;
  notes?: string;
  phone: string;
  email: string;
  isHired: boolean;
  isRejected: boolean;
};

export type OdooRecruitmentJob = {
  id: string;
  odooId: number;
  name: string;
  department: string;
  target: number;
  applications: number;
  newApplications: number;
};

export type OdooRecruitmentBoard = {
  stages: OdooRecruitmentStage[];
  applicants: OdooRecruitmentApplicant[];
  jobs: OdooRecruitmentJob[];
};

type OdooAttendanceRecord = {
  id: number;
  employee_id?: [number, string] | false;
  check_in?: string | false;
  check_out?: string | false;
  worked_hours?: number | false;
};

type OdooAttendanceEmployeeRecord = {
  id: number;
  name?: string;
  department_id?: [number, string] | false;
  job_title?: string | false;
  work_email?: string | false;
  attendance_state?: string | false;
};

export type OdooAttendanceEmployee = {
  id: string;
  odooId: number;
  name: string;
  avatar: string;
  department: string;
  jobTitle: string;
  email: string;
  attendanceState: string | null;
  checkIn: string | null;
  checkOut: string | null;
  workedHours: number | null;
  status: "checked_in" | "checked_out" | "no_record";
  totalAttendances: number;
  totalWorkedHours: number;
  monthlyAttendances: number;
  monthlyWorkedHours: number;
  records: Array<{
    id: string;
    checkIn: string | null;
    checkOut: string | null;
    workedHours: number;
  }>;
};

export type OdooAttendanceBoard = {
  employees: OdooAttendanceEmployee[];
  generatedOn: string;
  monthLabel: string;
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

const normalizeLoginIdentifier = (value: string) => {
  const trimmed = value.trim();

  return trimmed.includes("@") ? trimmed.toLowerCase() : trimmed;
};

const getServiceCredentials = () => {
  const login = process.env.ODOO_SERVICE_LOGIN;
  const apiKey = process.env.ODOO_SERVICE_API_KEY;

  if (!login || !apiKey) {
    throw new Error(
      "Google SSO requires ODOO_SERVICE_LOGIN and ODOO_SERVICE_API_KEY.",
    );
  }

  return { login, apiKey };
};

const getOptionalServiceCredentials = () => {
  const login = process.env.ODOO_SERVICE_LOGIN;
  const apiKey = process.env.ODOO_SERVICE_API_KEY;

  if (!login || !apiKey) {
    return null;
  }

  return { login, apiKey };
};

const getServiceAuthContext = async (): Promise<OdooAuthContext> => {
  const { login, apiKey } = getServiceCredentials();
  const uid = await authenticate(login, apiKey);

  if (!uid) {
    throw new Error("ODOO service account gagal melakukan autentikasi.");
  }

  return { uid, apiKey };
};

const getRelationId = (value: [number, string] | false | undefined) =>
  Array.isArray(value) && typeof value[0] === "number" ? value[0] : null;

const getRelationName = (value: [number, string] | false | undefined) =>
  Array.isArray(value) && typeof value[1] === "string" ? value[1] : null;

const normalizeOdooDate = (value: string | false | undefined) => {
  if (!value || typeof value !== "string") {
    return new Date().toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
};

const getInitials = (value: string) => {
  const parts = value.trim().split(/\s+/).filter(Boolean).slice(0, 2);

  if (!parts.length) {
    return "NA";
  }

  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("");
};

const getApplicantRating = (
  priority: OdooRecruitmentApplicantRecord["priority"],
) => {
  if (typeof priority === "number") {
    return Math.max(0, Math.min(5, priority));
  }

  if (typeof priority !== "string") {
    return 0;
  }

  const trimmedPriority = priority.trim();

  if (/^\d+$/.test(trimmedPriority)) {
    return Math.max(0, Math.min(5, Number.parseInt(trimmedPriority, 10)));
  }

  const numericPriority = trimmedPriority.replace(/[^1-5]/g, "").length;

  if (!numericPriority) {
    return 0;
  }

  return Math.max(0, Math.min(5, numericPriority));
};

const buildApplicantTags = (record: OdooRecruitmentApplicantRecord) => {
  const tags = [
    getRelationName(record.source_id),
    getRelationName(record.type_id),
    getRelationName(record.degree_id),
  ].filter((value): value is string => Boolean(value));

  return [...new Set(tags)].slice(0, 4);
};

const isRejectedStageName = (stageName: string) =>
  /(reject|refus|ditolak|gagal|declin|drop)/i.test(stageName);

const stripHtml = (value: string) =>
  value
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getModelFieldNames = async (
  auth: OdooAuthContext,
  model: string,
): Promise<Set<string>> => {
  const fields = await executeKw<Record<string, unknown>>(
    auth,
    model,
    "fields_get",
    [],
    {},
  );

  return new Set(Object.keys(fields));
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
    auth.apiKey,
    model,
    method,
    args,
    kwargs,
  ]);

const authenticate = async (login: string, apiKey: string) =>
  callJsonRpc<number>("common", "authenticate", [
    getOdooDatabase(),
    login,
    apiKey,
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

const findOdooUserRecordByIdentifier = async (
  auth: OdooAuthContext,
  identifier: string,
): Promise<OdooUserRecord | null> => {
  const normalizedIdentifier = normalizeLoginIdentifier(identifier);
  const [emailMatches, loginMatches] = await Promise.all([
    executeKw<OdooUserRecord[]>(
      auth,
      "res.users",
      "search_read",
      [[["email", "=", normalizedIdentifier]]],
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
      logAuthError("findOdooUserRecordByIdentifier.emailLookup", error);
      return [];
    }),
    executeKw<OdooUserRecord[]>(
      auth,
      "res.users",
      "search_read",
      [[["login", "=", normalizedIdentifier]]],
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
      logAuthError("findOdooUserRecordByIdentifier.loginLookup", error);
      return [];
    }),
  ]);

  const records = [...emailMatches, ...loginMatches];

  const matchedUser =
    records.find((record) => {
      const candidates = [record.email, record.login]
        .map((value) =>
          typeof value === "string" ? value.trim().toLowerCase() : null,
        )
        .filter((value): value is string => Boolean(value));

      return candidates.includes(normalizedIdentifier.toLowerCase());
    }) ?? records[0];

  if (matchedUser) {
    return matchedUser;
  }

  if (!normalizedIdentifier.includes("@")) {
    return null;
  }

  return findUserFromEmployeeEmail(auth, normalizedIdentifier);
};

const authenticateViaResolvedLogin = async (
  identifier: string,
  apiKey: string,
): Promise<{ uid: number; resolvedLogin: string } | null> => {
  const serviceCredentials = getOptionalServiceCredentials();

  if (!serviceCredentials) {
    return null;
  }

  const serviceUid = await authenticate(
    serviceCredentials.login,
    serviceCredentials.apiKey,
  );

  if (!serviceUid) {
    logAuthDebug("authenticateViaResolvedLogin.serviceAuthFailed", {
      serviceLogin: serviceCredentials.login,
    });
    return null;
  }

  const serviceAuth = {
    uid: serviceUid,
    apiKey: serviceCredentials.apiKey,
  };
  const userRecord = await findOdooUserRecordByIdentifier(
    serviceAuth,
    identifier,
  );
  const resolvedLogin = userRecord?.login?.trim();

  logAuthDebug("authenticateViaResolvedLogin.lookup", {
    identifier,
    serviceUid,
    resolvedLogin,
    found: Boolean(userRecord),
  });

  if (!resolvedLogin) {
    return null;
  }

  const uid = await authenticate(resolvedLogin, apiKey);

  if (!uid) {
    return null;
  }

  return { uid, resolvedLogin };
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
  const normalizedLogin = normalizeLoginIdentifier(login);
  logAuthDebug("authenticateWithOdoo.start", { login: normalizedLogin });
  let uid = await authenticate(normalizedLogin, password);
  let effectiveLogin = normalizedLogin;

  if (!uid) {
    const fallbackAuth = await authenticateViaResolvedLogin(
      normalizedLogin,
      password,
    );

    if (fallbackAuth) {
      uid = fallbackAuth.uid;
      effectiveLogin = fallbackAuth.resolvedLogin;
    }
  }

  logAuthDebug("authenticateWithOdoo.authenticated", {
    login: effectiveLogin,
    uid,
  });

  if (!uid) {
    throw new Error("Email atau password tidak valid.");
  }

  const auth = { uid, apiKey: password };
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
  const { login, apiKey } = getServiceCredentials();
  const uid = await authenticate(login, apiKey);

  logAuthDebug("findOdooUserByEmail.serviceAuthenticated", {
    serviceLogin: login,
    uid,
  });

  if (!uid) {
    throw new Error("ODOO service account gagal melakukan autentikasi.");
  }

  const auth = { uid, apiKey };
  const normalizedEmail = normalizeLoginIdentifier(email);
  const matchedUser = await findOdooUserRecordByIdentifier(
    auth,
    normalizedEmail,
  );

  logAuthDebug("findOdooUserByEmail.candidates", {
    email,
    normalizedEmail,
    found: Boolean(matchedUser),
    user: matchedUser
      ? {
          id: matchedUser.id,
          login: matchedUser.login,
          email: matchedUser.email,
          active: matchedUser.active,
          employee_id: matchedUser.employee_id,
          partner_id: matchedUser.partner_id,
        }
      : null,
  });

  if (!matchedUser) {
    return null;
  }

  return buildProfile(auth, matchedUser);
};

export const getOdooRecruitmentBoard =
  async (): Promise<OdooRecruitmentBoard> => {
    const auth = await getServiceAuthContext();
    const applicantFieldNames = await getModelFieldNames(auth, "hr.applicant");
    const applicantFields = [
      "partner_name",
      "email_from",
      "partner_phone",
      "partner_mobile",
      "stage_id",
      "job_id",
      "department_id",
      "source_id",
      "type_id",
      "degree_id",
      "create_date",
      "write_date",
      "priority",
      "description",
    ].filter((field) => applicantFieldNames.has(field));

    const [stageRecords, applicantRecords, jobRecords] = await Promise.all([
      executeKw<OdooRecruitmentStageRecord[]>(
        auth,
        "hr.recruitment.stage",
        "search_read",
        [[]],
        {
          fields: ["name", "sequence", "hired_stage", "fold"],
          order: "sequence asc, id asc",
        },
      ),
      executeKw<OdooRecruitmentApplicantRecord[]>(
        auth,
        "hr.applicant",
        "search_read",
        [[]],
        {
          fields: applicantFields,
          order: "create_date desc, id desc",
          limit: 300,
        },
      ),
      executeKw<OdooRecruitmentJobRecord[]>(
        auth,
        "hr.job",
        "search_read",
        [[]],
        {
          fields: [
            "name",
            "department_id",
            "no_of_recruitment",
            "application_count",
            "new_application_count",
          ],
          order: "name asc",
          limit: 200,
        },
      ),
    ]);

    const stages = stageRecords
      .filter((record) => record.name?.trim())
      .map((record, index) => ({
        id: String(record.id),
        odooId: record.id,
        name: record.name?.trim() ?? `Stage ${index + 1}`,
        sequence: record.sequence ?? index,
        hired: Boolean(record.hired_stage),
        folded: Boolean(record.fold),
      }))
      .sort((left, right) => {
        if (left.sequence !== right.sequence) {
          return left.sequence - right.sequence;
        }

        return left.odooId - right.odooId;
      });

    const stageMap = new Map(stages.map((stage) => [stage.odooId, stage]));

    const applicants = applicantRecords.map((record) => {
      const stageId = getRelationId(record.stage_id);
      const stage = stageId ? stageMap.get(stageId) : null;
      const stageName =
        stage?.name ?? getRelationName(record.stage_id) ?? "Belum Ditentukan";
      const applicantName =
        (typeof record.partner_name === "string" &&
          record.partner_name.trim()) ||
        (typeof record.email_from === "string" && record.email_from.trim()) ||
        `Applicant #${record.id}`;

      return {
        id: String(record.id),
        odooId: record.id,
        name: applicantName,
        avatar: getInitials(applicantName),
        jobId: String(getRelationId(record.job_id) ?? 0),
        position: getRelationName(record.job_id) ?? "Posisi Belum Ditentukan",
        division: getRelationName(record.department_id) ?? "Tanpa Divisi",
        stageId: stage ? stage.id : String(stageId ?? 0),
        stageName,
        source: getRelationName(record.source_id) ?? "Odoo",
        university:
          (applicantFieldNames.has("type_id")
            ? getRelationName(record.type_id)
            : null) ?? "Data belum tersedia",
        major:
          (applicantFieldNames.has("degree_id")
            ? getRelationName(record.degree_id)
            : null) ?? "Data belum tersedia",
        appliedAt: normalizeOdooDate(record.create_date),
        lastUpdated: normalizeOdooDate(record.write_date ?? record.create_date),
        tags: buildApplicantTags(record),
        priority: getApplicantRating(record.priority),
        notes:
          typeof record.description === "string" && record.description.trim()
            ? stripHtml(record.description)
            : undefined,
        phone:
          (typeof record.partner_phone === "string" &&
            record.partner_phone.trim()) ||
          (typeof record.partner_mobile === "string" &&
            record.partner_mobile.trim()) ||
          "-",
        email:
          (typeof record.email_from === "string" && record.email_from.trim()) ||
          "-",
        isHired: Boolean(stage?.hired),
        isRejected: isRejectedStageName(stageName),
      };
    });

    const jobs = jobRecords
      .filter((record) => record.name?.trim())
      .map((record) => ({
        id: String(record.id),
        odooId: record.id,
        name: record.name?.trim() ?? `Job ${record.id}`,
        department: getRelationName(record.department_id) ?? "Tanpa Departemen",
        target: record.no_of_recruitment ?? 0,
        applications: record.application_count ?? 0,
        newApplications: record.new_application_count ?? 0,
      }));

    return {
      stages,
      applicants,
      jobs,
    };
  };

export const updateOdooRecruitmentApplicantStage = async (
  applicantId: number,
  stageId: number,
) => {
  const auth = await getServiceAuthContext();

  const success = await executeKw<boolean>(auth, "hr.applicant", "write", [
    [applicantId],
    { stage_id: stageId },
  ]);

  if (!success) {
    throw new Error("Gagal mengubah stage applicant di Odoo.");
  }

  return success;
};

export const getOdooAttendanceBoard =
  async (): Promise<OdooAttendanceBoard> => {
    const auth = await getServiceAuthContext();
    const attendanceFieldNames = await getModelFieldNames(auth, "hr.attendance");
    const employeeFieldNames = await getModelFieldNames(auth, "hr.employee");

    const today = new Date();
    const todayStart = `${today.toISOString().slice(0, 10)} 00:00:00`;
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
      .toISOString()
      .slice(0, 10);
    const monthStartDateTime = `${monthStart} 00:00:00`;

    const attendanceFields = [
      "employee_id",
      "check_in",
      "check_out",
      "worked_hours",
    ].filter((field) => attendanceFieldNames.has(field));
    const employeeFields = [
      "name",
      "department_id",
      "job_title",
      "work_email",
      "attendance_state",
    ].filter((field) => employeeFieldNames.has(field));

    const [employeeRecords, todayAttendanceRecords, monthAttendanceRecords, allAttendanceRecords] =
      await Promise.all([
        executeKw<OdooAttendanceEmployeeRecord[]>(
          auth,
          "hr.employee",
          "search_read",
          [[["active", "=", true]]],
          {
            fields: employeeFields,
            order: "name asc",
            limit: 500,
          },
        ),
        executeKw<OdooAttendanceRecord[]>(
          auth,
          "hr.attendance",
          "search_read",
          [[["check_in", ">=", todayStart]]],
          {
            fields: attendanceFields,
            order: "check_in desc, id desc",
            limit: 1000,
          },
        ),
        executeKw<OdooAttendanceRecord[]>(
          auth,
          "hr.attendance",
          "search_read",
          [[["check_in", ">=", monthStartDateTime]]],
          {
            fields: attendanceFields,
            order: "check_in desc, id desc",
            limit: 5000,
          },
        ),
        executeKw<OdooAttendanceRecord[]>(
          auth,
          "hr.attendance",
          "search_read",
          [[]],
          {
            fields: attendanceFields,
            order: "check_in desc, id desc",
            limit: 10000,
          },
        ),
      ]);

    const latestTodayAttendanceByEmployee = new Map<number, OdooAttendanceRecord>();
    todayAttendanceRecords.forEach((record) => {
      const employeeId = getRelationId(record.employee_id);

      if (!employeeId || latestTodayAttendanceByEmployee.has(employeeId)) {
        return;
      }

      latestTodayAttendanceByEmployee.set(employeeId, record);
    });

    const monthlyAttendanceByEmployee = new Map<
      number,
      { attendances: number; workedHours: number }
    >();

    monthAttendanceRecords.forEach((record) => {
      const employeeId = getRelationId(record.employee_id);

      if (!employeeId) {
        return;
      }

      const current =
        monthlyAttendanceByEmployee.get(employeeId) ??
        ({ attendances: 0, workedHours: 0 } as const);

      monthlyAttendanceByEmployee.set(employeeId, {
        attendances: current.attendances + 1,
        workedHours:
          current.workedHours +
          (typeof record.worked_hours === "number" ? record.worked_hours : 0),
      });
    });

    const allAttendanceByEmployee = new Map<
      number,
      {
        attendances: number;
        workedHours: number;
        records: Array<{
          id: string;
          checkIn: string | null;
          checkOut: string | null;
          workedHours: number;
        }>;
      }
    >();

    allAttendanceRecords.forEach((record) => {
      const employeeId = getRelationId(record.employee_id);

      if (!employeeId) {
        return;
      }

      const current = allAttendanceByEmployee.get(employeeId) ?? {
        attendances: 0,
        workedHours: 0,
        records: [],
      };

      allAttendanceByEmployee.set(employeeId, {
        attendances: current.attendances + 1,
        workedHours:
          current.workedHours +
          (typeof record.worked_hours === "number" ? record.worked_hours : 0),
        records: [
          ...current.records,
          {
            id: String(record.id),
            checkIn:
              typeof record.check_in === "string" ? record.check_in : null,
            checkOut:
              typeof record.check_out === "string" ? record.check_out : null,
            workedHours:
              typeof record.worked_hours === "number" ? record.worked_hours : 0,
          },
        ],
      });
    });

    const employees = employeeRecords.map((record) => {
      const latestAttendance = latestTodayAttendanceByEmployee.get(record.id);
      const monthlySummary = monthlyAttendanceByEmployee.get(record.id);
      const totalSummary = allAttendanceByEmployee.get(record.id);
      const checkIn =
        typeof latestAttendance?.check_in === "string"
          ? latestAttendance.check_in
          : null;
      const checkOut =
        typeof latestAttendance?.check_out === "string"
          ? latestAttendance.check_out
          : null;
      const workedHours =
        typeof latestAttendance?.worked_hours === "number"
          ? latestAttendance.worked_hours
          : null;
      const status = latestAttendance
        ? checkOut
          ? "checked_out"
          : "checked_in"
        : "no_record";

      return {
        id: String(record.id),
        odooId: record.id,
        name: record.name?.trim() || `Employee #${record.id}`,
        avatar: getInitials(record.name?.trim() || `Employee ${record.id}`),
        department: getRelationName(record.department_id) ?? "Tanpa Departemen",
        jobTitle:
          typeof record.job_title === "string" && record.job_title.trim()
            ? record.job_title.trim()
            : "Tanpa Jabatan",
        email:
          typeof record.work_email === "string" && record.work_email.trim()
            ? record.work_email.trim()
            : "-",
        attendanceState:
          typeof record.attendance_state === "string"
            ? record.attendance_state
            : null,
        checkIn,
        checkOut,
        workedHours,
        status,
        totalAttendances: totalSummary?.attendances ?? 0,
        totalWorkedHours: Number((totalSummary?.workedHours ?? 0).toFixed(2)),
        monthlyAttendances: monthlySummary?.attendances ?? 0,
        monthlyWorkedHours: Number((monthlySummary?.workedHours ?? 0).toFixed(2)),
        records: totalSummary?.records ?? [],
      };
    });

    return {
      employees,
      generatedOn: new Date().toISOString(),
      monthLabel: today.toLocaleDateString("id-ID", {
        month: "long",
        year: "numeric",
      }),
    };
  };
