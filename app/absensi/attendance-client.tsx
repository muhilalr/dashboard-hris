"use client";

import { useMemo, useState } from "react";

import type { OdooAttendanceBoard, OdooAttendanceEmployee } from "@/lib/odoo";

type AttendanceClientPageProps = {
  initialBoard: OdooAttendanceBoard;
  initialError?: string;
};

type AttendanceStatusFilter =
  | "Semua"
  | "checked_in"
  | "checked_out"
  | "no_record";

const ATTENDANCE_TIME_ZONE = "Asia/Jakarta";

function parseOdooDateTime(value: string) {
  return new Date(value.replace(" ", "T") + "Z");
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "-";
  }

  return parseOdooDateTime(value).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: ATTENDANCE_TIME_ZONE,
  });
}

function formatGeneratedOn(value: string) {
  return parseOdooDateTime(value).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: ATTENDANCE_TIME_ZONE,
  });
}

function formatDateTimeFull(value: string | null) {
  if (!value) {
    return "-";
  }

  return parseOdooDateTime(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: ATTENDANCE_TIME_ZONE,
  });
}

function formatWorkedHours(value: number) {
  const totalMinutes = Math.max(0, Math.round(value * 60));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function getDivisionTone(name: string) {
  const key = name.toLowerCase();

  if (key.includes("tech") || key.includes("it")) {
    return "bg-blue-100 text-blue-700";
  }

  if (key.includes("human") || key.includes("hr")) {
    return "bg-purple-100 text-purple-700";
  }

  if (key.includes("finance")) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (key.includes("market")) {
    return "bg-orange-100 text-orange-700";
  }

  return "bg-slate-100 text-slate-700";
}

function getStatusBadge(status: OdooAttendanceEmployee["status"]) {
  switch (status) {
    case "checked_in":
      return {
        label: "Sedang Check In",
        className: "bg-blue-50 text-blue-700",
      };
    case "checked_out":
      return {
        label: "Sudah Check Out",
        className: "bg-emerald-50 text-emerald-700",
      };
    default:
      return {
        label: "Belum Ada Absensi",
        className: "bg-slate-100 text-slate-600",
      };
  }
}

function HoursBar({ value }: { value: number }) {
  const percentage = Math.max(0, Math.min(100, (value / 160) * 100));

  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-emerald-500"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-12 text-right text-xs font-medium text-slate-600">
        {formatWorkedHours(value)}
      </span>
    </div>
  );
}

function AttendanceDetailModal({
  employee,
  onClose,
}: {
  employee: OdooAttendanceEmployee;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        type="button"
        className="flex-1 bg-black/30"
        onClick={onClose}
        aria-label="Tutup detail absensi"
      />
      <div className="flex h-full w-full max-w-3xl flex-col overflow-y-auto bg-white shadow-2xl">
        <div className="border-b border-slate-100 p-5">
          <div className="mb-4 flex items-start justify-between">
            <div>
              <p className="text-xs text-slate-400">ODOO #{employee.odooId}</p>
              <h3 className="text-xl font-bold text-slate-900">
                {employee.name}
              </h3>
              <p className="text-sm text-slate-500">{employee.jobTitle}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
            >
              x
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-400">Total Record</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {employee.totalAttendances}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-400">Total Jam Kerja</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {formatWorkedHours(employee.totalWorkedHours)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-xs text-slate-400">Jam Bulan Ini</p>
              <p className="mt-1 text-lg font-semibold text-slate-900">
                {formatWorkedHours(employee.monthlyWorkedHours)}
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto p-5">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-medium text-slate-500">
                <th className="px-3 py-3">Absen Masuk</th>
                <th className="px-3 py-3">Absen Keluar</th>
                <th className="px-3 py-3">Jam Kerja</th>
                <th className="px-3 py-3">Record</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {employee.records.map((record, index) => (
                <tr key={record.id} className="hover:bg-slate-50">
                  <td className="px-3 py-3 text-sm text-slate-700">
                    {formatDateTimeFull(record.checkIn)}
                  </td>
                  <td className="px-3 py-3 text-sm text-slate-700">
                    {formatDateTimeFull(record.checkOut)}
                  </td>
                  <td className="px-3 py-3 text-sm font-medium text-slate-800">
                    {formatWorkedHours(record.workedHours)}
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-400">
                    #{index + 1}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {employee.records.length === 0 && (
            <div className="py-16 text-center text-slate-400">
              Belum ada record absensi untuk karyawan ini.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AttendanceClientPage({
  initialBoard,
  initialError,
}: AttendanceClientPageProps) {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] =
    useState<AttendanceStatusFilter>("Semua");
  const [selectedEmployee, setSelectedEmployee] =
    useState<OdooAttendanceEmployee | null>(null);
  const [sortBy, setSortBy] = useState<
    "name" | "department" | "total_hours" | "today_hours" | "monthly_hours"
  >("name");

  const departments = useMemo(
    () =>
      Array.from(
        new Set(initialBoard.employees.map((employee) => employee.department)),
      ).sort((left, right) => left.localeCompare(right)),
    [initialBoard.employees],
  );

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();
    let employees = initialBoard.employees.filter((employee) => {
      const matchSearch =
        !query ||
        employee.name.toLowerCase().includes(query) ||
        employee.jobTitle.toLowerCase().includes(query) ||
        employee.department.toLowerCase().includes(query);
      const matchDepartment =
        departmentFilter === "Semua" ||
        employee.department === departmentFilter;
      const matchStatus =
        statusFilter === "Semua" || employee.status === statusFilter;

      return matchSearch && matchDepartment && matchStatus;
    });

    employees = [...employees];

    if (sortBy === "name") {
      employees.sort((left, right) => left.name.localeCompare(right.name));
    } else if (sortBy === "total_hours") {
      employees.sort(
        (left, right) => right.totalWorkedHours - left.totalWorkedHours,
      );
    } else if (sortBy === "monthly_hours") {
      employees.sort(
        (left, right) => right.monthlyWorkedHours - left.monthlyWorkedHours,
      );
    } else if (sortBy === "today_hours") {
      employees.sort(
        (left, right) => (right.workedHours ?? 0) - (left.workedHours ?? 0),
      );
    } else {
      employees.sort((left, right) =>
        left.department.localeCompare(right.department),
      );
    }

    return employees;
  }, [departmentFilter, initialBoard.employees, search, sortBy, statusFilter]);

  const stats = useMemo(() => {
    const totalEmployees = initialBoard.employees.length;
    const checkedIn = initialBoard.employees.filter(
      (employee) => employee.status === "checked_in",
    ).length;
    const checkedOut = initialBoard.employees.filter(
      (employee) => employee.status === "checked_out",
    ).length;
    const noRecord = initialBoard.employees.filter(
      (employee) => employee.status === "no_record",
    ).length;
    const totalWorkedHoursToday = initialBoard.employees.reduce(
      (total, employee) => total + (employee.workedHours ?? 0),
      0,
    );
    const totalMonthlyHours = initialBoard.employees.reduce(
      (total, employee) => total + employee.monthlyWorkedHours,
      0,
    );
    const totalWorkedHours = initialBoard.employees.reduce(
      (total, employee) => total + employee.totalWorkedHours,
      0,
    );

    return {
      totalEmployees,
      checkedIn,
      checkedOut,
      noRecord,
      totalWorkedHoursToday: Number(totalWorkedHoursToday.toFixed(1)),
      totalWorkedHours: Number(totalWorkedHours.toFixed(1)),
      totalMonthlyHours: Number(totalMonthlyHours.toFixed(1)),
    };
  }, [initialBoard.employees]);

  const departmentStats = useMemo(
    () =>
      departments.map((department) => {
        const employees = initialBoard.employees.filter(
          (employee) => employee.department === department,
        );
        const presentToday = employees.filter(
          (employee) => employee.status !== "no_record",
        ).length;

        return {
          department,
          total: employees.length,
          presentToday,
          monthlyHours: employees.reduce(
            (total, employee) => total + employee.monthlyWorkedHours,
            0,
          ),
        };
      }),
    [departments, initialBoard.employees],
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-screen-2xl space-y-6 px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <h1 className="text-2xl font-bold text-slate-900">Absensi</h1>
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
          {[
            {
              label: "Total Karyawan",
              value: stats.totalEmployees,
              tone: "text-slate-800",
            },
            {
              label: "Sedang Check In",
              value: stats.checkedIn,
              tone: "text-blue-600",
            },
            {
              label: "Sudah Check Out",
              value: stats.checkedOut,
              tone: "text-emerald-600",
            },
            {
              label: "Belum Ada Absensi",
              value: stats.noRecord,
              tone: "text-slate-500",
            },
            {
              label: "Jam Hari Ini",
              value: formatWorkedHours(stats.totalWorkedHoursToday),
              tone: "text-violet-600",
            },
            {
              label: "Total Jam Kerja",
              value: formatWorkedHours(stats.totalWorkedHours),
              tone: "text-amber-600",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <p className={`text-2xl font-bold ${item.tone}`}>{item.value}</p>
              <p className="mt-1 text-xs text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-5 text-sm font-semibold text-slate-800">
              Rekap Departemen
            </h2>
            <div className="space-y-4">
              {departmentStats.map((item) => (
                <div key={item.department} className="flex items-center gap-3">
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-medium ${getDivisionTone(item.department)}`}
                  >
                    {item.department}
                  </span>
                  <div className="flex-1 text-xs text-slate-500">
                    {item.presentToday}/{item.total} hadir hari ini
                  </div>
                  <div className="w-20 text-right text-xs font-medium text-slate-700">
                    {formatWorkedHours(item.monthlyHours)}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <h2 className="mb-5 text-sm font-semibold text-slate-800">
              Status Hari Ini
            </h2>
            <div className="space-y-4">
              {(
                [
                  ["checked_in", stats.checkedIn],
                  ["checked_out", stats.checkedOut],
                  ["no_record", stats.noRecord],
                ] as const
              ).map(([status, count]) => {
                const badge = getStatusBadge(status);
                const width =
                  stats.totalEmployees === 0
                    ? 0
                    : Math.round((count / stats.totalEmployees) * 100);

                return (
                  <div key={status} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span
                        className={`rounded-md px-2 py-1 ${badge.className}`}
                      >
                        {badge.label}
                      </span>
                      <span className="text-slate-500">{count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-700"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <h2 className="flex-1 text-sm font-semibold text-slate-800">
                Daftar Absensi Karyawan
              </h2>

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari nama, jabatan, atau departemen..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-400 focus:outline-none xl:max-w-xs"
              />

              <select
                value={departmentFilter}
                onChange={(event) => setDepartmentFilter(event.target.value)}
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:border-indigo-400 focus:outline-none"
              >
                <option value="Semua">Semua Departemen</option>
                {departments.map((department) => (
                  <option key={department} value={department}>
                    {department}
                  </option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as AttendanceStatusFilter)
                }
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:border-indigo-400 focus:outline-none"
              >
                <option value="Semua">Semua Status</option>
                <option value="checked_in">Sedang Check In</option>
                <option value="checked_out">Sudah Check Out</option>
                <option value="no_record">Belum Ada Absensi</option>
              </select>

              <select
                value={sortBy}
                onChange={(event) =>
                  setSortBy(
                    event.target.value as
                      | "name"
                      | "department"
                      | "monthly_hours"
                      | "today_hours",
                  )
                }
                className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700 focus:border-indigo-400 focus:outline-none"
              >
                <option value="name">Urutkan: Nama</option>
                <option value="department">Urutkan: Departemen</option>
                <option value="total_hours">Urutkan: Total Jam Kerja</option>
                <option value="today_hours">Urutkan: Jam Hari Ini</option>
                <option value="monthly_hours">Urutkan: Jam Bulan Ini</option>
              </select>
            </div>
          </div>

          <div className="border-b border-slate-100 bg-slate-50 px-6 py-2 text-xs text-slate-500">
            Menampilkan {filteredEmployees.length} dari{" "}
            {initialBoard.employees.length} karyawan
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[980px] w-full">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs font-medium text-slate-500">
                  <th className="px-6 py-3">Karyawan</th>
                  <th className="px-4 py-3">Departemen</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Check In</th>
                  <th className="px-4 py-3">Check Out</th>
                  <th className="px-4 py-3">Jam Hari Ini</th>
                  <th className="px-4 py-3 min-w-[160px]">Total Jam Kerja</th>
                  <th className="px-4 py-3">Total Record</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredEmployees.map((employee) => {
                  const badge = getStatusBadge(employee.status);

                  return (
                    <tr
                      key={employee.id}
                      onClick={() => setSelectedEmployee(employee)}
                      className="hover:bg-slate-50 hover:cursor-pointer"
                    >
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-semibold text-white">
                            {employee.avatar}
                          </div>
                          <div>
                            <p className="text-left text-sm font-medium text-slate-900 hover:text-indigo-600">
                              {employee.name}
                            </p>
                            <p className="text-xs text-slate-400">
                              {employee.jobTitle}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-medium ${getDivisionTone(employee.department)}`}
                        >
                          {employee.department}
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`rounded-md px-2 py-1 text-xs font-medium ${badge.className}`}
                        >
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-xs font-medium text-slate-700">
                        {formatDateTime(employee.checkIn)}
                      </td>
                      <td className="px-4 py-3.5 text-xs font-medium text-slate-700">
                        {formatDateTime(employee.checkOut)}
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-700">
                        {employee.workedHours != null
                          ? formatWorkedHours(employee.workedHours)
                          : "-"}
                      </td>
                      <td className="px-4 py-3.5 min-w-[160px]">
                        <HoursBar value={employee.totalWorkedHours} />
                      </td>
                      <td className="px-4 py-3.5 text-xs text-slate-700">
                        {employee.totalAttendances} record
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {filteredEmployees.length === 0 && (
              <div className="py-16 text-center text-slate-400">
                Tidak ada data absensi yang cocok dengan filter saat ini.
              </div>
            )}
          </div>
        </section>

        {initialError && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {initialError}
          </div>
        )}
      </main>

      {selectedEmployee && (
        <AttendanceDetailModal
          employee={selectedEmployee}
          onClose={() => setSelectedEmployee(null)}
        />
      )}
    </div>
  );
}
