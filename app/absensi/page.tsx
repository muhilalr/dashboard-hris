"use client";

import { useState, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Division =
  | "Tech"
  | "Creative"
  | "Marketing"
  | "Operations"
  | "HR"
  | "Finance";
type Status = "Hadir" | "Terlambat" | "Izin" | "Alfa" | "WFH";

interface StaffAttendance {
  id: number;
  name: string;
  division: Division;
  role: string;
  avatar: string;
  clockIn: string | null;
  clockOut: string | null;
  status: Status;
  totalHours: number | null;
  lateMinutes: number;
  attendanceRate: number;
  daysPresent: number;
  daysAbsent: number;
  daysLeave: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_DATA: StaffAttendance[] = [
  {
    id: 1,
    name: "Aqila Sari Dewi",
    division: "Tech",
    role: "Frontend Dev Intern",
    avatar: "AS",
    clockIn: "08:52",
    clockOut: "17:30",
    status: "Hadir",
    totalHours: 8.6,
    lateMinutes: 0,
    attendanceRate: 96,
    daysPresent: 22,
    daysAbsent: 0,
    daysLeave: 1,
  },
  {
    id: 2,
    name: "Bima Eka Putra",
    division: "Tech",
    role: "Backend Dev Intern",
    avatar: "BE",
    clockIn: "09:18",
    clockOut: "17:45",
    status: "Terlambat",
    totalHours: 8.4,
    lateMinutes: 18,
    attendanceRate: 91,
    daysPresent: 20,
    daysAbsent: 1,
    daysLeave: 2,
  },
  {
    id: 3,
    name: "Citra Nanda",
    division: "Creative",
    role: "UI/UX Designer Intern",
    avatar: "CN",
    clockIn: null,
    clockOut: null,
    status: "Izin",
    totalHours: null,
    lateMinutes: 0,
    attendanceRate: 88,
    daysPresent: 19,
    daysAbsent: 0,
    daysLeave: 4,
  },
  {
    id: 4,
    name: "Dani Rahmat",
    division: "Marketing",
    role: "Content Creator Intern",
    avatar: "DR",
    clockIn: "08:45",
    clockOut: "17:00",
    status: "Hadir",
    totalHours: 8.25,
    lateMinutes: 0,
    attendanceRate: 95,
    daysPresent: 21,
    daysAbsent: 1,
    daysLeave: 1,
  },
  {
    id: 5,
    name: "Elsa Fatimah",
    division: "HR",
    role: "Recruitment Staff Intern",
    avatar: "EF",
    clockIn: "09:35",
    clockOut: null,
    status: "Terlambat",
    totalHours: null,
    lateMinutes: 35,
    attendanceRate: 83,
    daysPresent: 18,
    daysAbsent: 3,
    daysLeave: 2,
  },
  {
    id: 6,
    name: "Farhan Malik",
    division: "Operations",
    role: "Ops Intern",
    avatar: "FM",
    clockIn: null,
    clockOut: null,
    status: "Alfa",
    totalHours: null,
    lateMinutes: 0,
    attendanceRate: 79,
    daysPresent: 17,
    daysAbsent: 5,
    daysLeave: 1,
  },
  {
    id: 7,
    name: "Gita Wulandari",
    division: "Finance",
    role: "Finance Admin Intern",
    avatar: "GW",
    clockIn: "08:30",
    clockOut: "17:30",
    status: "Hadir",
    totalHours: 9.0,
    lateMinutes: 0,
    attendanceRate: 100,
    daysPresent: 23,
    daysAbsent: 0,
    daysLeave: 0,
  },
  {
    id: 8,
    name: "Hendra Saputra",
    division: "Tech",
    role: "Mobile Dev Intern",
    avatar: "HS",
    clockIn: "08:00",
    clockOut: "17:00",
    status: "WFH",
    totalHours: 9.0,
    lateMinutes: 0,
    attendanceRate: 93,
    daysPresent: 21,
    daysAbsent: 0,
    daysLeave: 2,
  },
  {
    id: 9,
    name: "Ira Kusuma",
    division: "Creative",
    role: "Graphic Design Intern",
    avatar: "IK",
    clockIn: "09:05",
    clockOut: "17:15",
    status: "Hadir",
    totalHours: 8.1,
    lateMinutes: 5,
    attendanceRate: 90,
    daysPresent: 20,
    daysAbsent: 2,
    daysLeave: 1,
  },
  {
    id: 10,
    name: "Joko Widodo",
    division: "Marketing",
    role: "Social Media Intern",
    avatar: "JW",
    clockIn: null,
    clockOut: null,
    status: "Izin",
    totalHours: null,
    lateMinutes: 0,
    attendanceRate: 86,
    daysPresent: 19,
    daysAbsent: 1,
    daysLeave: 3,
  },
  {
    id: 11,
    name: "Kartika Sari",
    division: "HR",
    role: "Training Staff Intern",
    avatar: "KS",
    clockIn: "08:58",
    clockOut: "17:30",
    status: "Hadir",
    totalHours: 8.5,
    lateMinutes: 0,
    attendanceRate: 98,
    daysPresent: 22,
    daysAbsent: 0,
    daysLeave: 1,
  },
  {
    id: 12,
    name: "Lukman Hakim",
    division: "Operations",
    role: "Logistics Intern",
    avatar: "LH",
    clockIn: "09:00",
    clockOut: "17:00",
    status: "Hadir",
    totalHours: 8.0,
    lateMinutes: 0,
    attendanceRate: 94,
    daysPresent: 21,
    daysAbsent: 1,
    daysLeave: 1,
  },
  {
    id: 13,
    name: "Maya Indri",
    division: "Finance",
    role: "Accounting Intern",
    avatar: "MI",
    clockIn: "08:47",
    clockOut: "17:45",
    status: "Hadir",
    totalHours: 8.9,
    lateMinutes: 0,
    attendanceRate: 97,
    daysPresent: 22,
    daysAbsent: 0,
    daysLeave: 1,
  },
  {
    id: 14,
    name: "Naufal Rizki",
    division: "Tech",
    role: "QA Intern",
    avatar: "NR",
    clockIn: "10:05",
    clockOut: null,
    status: "Terlambat",
    totalHours: null,
    lateMinutes: 65,
    attendanceRate: 80,
    daysPresent: 18,
    daysAbsent: 2,
    daysLeave: 3,
  },
  {
    id: 15,
    name: "Olivia Putri",
    division: "Creative",
    role: "Video Editor Intern",
    avatar: "OP",
    clockIn: "08:55",
    clockOut: "18:00",
    status: "Hadir",
    totalHours: 9.1,
    lateMinutes: 0,
    attendanceRate: 92,
    daysPresent: 21,
    daysAbsent: 1,
    daysLeave: 1,
  },
];

// ─── Constants ────────────────────────────────────────────────────────────────

const DIVISIONS: Division[] = [
  "Tech",
  "Creative",
  "Marketing",
  "Operations",
  "HR",
  "Finance",
];

const STATUS_CONFIG: Record<
  Status,
  { label: string; bg: string; text: string; dot: string }
> = {
  Hadir: {
    label: "Hadir",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  Terlambat: {
    label: "Terlambat",
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
  Izin: {
    label: "Izin",
    bg: "bg-blue-50",
    text: "text-blue-700",
    dot: "bg-blue-500",
  },
  Alfa: {
    label: "Alfa",
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-500",
  },
  WFH: {
    label: "WFH",
    bg: "bg-violet-50",
    text: "text-violet-700",
    dot: "bg-violet-500",
  },
};

const DIVISION_COLOR: Record<Division, string> = {
  Tech: "bg-blue-500",
  Creative: "bg-pink-500",
  Marketing: "bg-orange-500",
  Operations: "bg-teal-500",
  HR: "bg-purple-500",
  Finance: "bg-green-600",
};

const DIVISION_LIGHT: Record<Division, string> = {
  Tech: "bg-blue-100 text-blue-800",
  Creative: "bg-pink-100 text-pink-800",
  Marketing: "bg-orange-100 text-orange-800",
  Operations: "bg-teal-100 text-teal-800",
  HR: "bg-purple-100 text-purple-800",
  Finance: "bg-green-100 text-green-800",
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({
  initials,
  division,
}: {
  initials: string;
  division: Division;
}) {
  return (
    <div
      className={`w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-semibold shrink-0 ${DIVISION_COLOR[division]}`}
    >
      {initials}
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function RateBar({ value }: { value: number }) {
  const color =
    value >= 95
      ? "bg-emerald-500"
      : value >= 85
        ? "bg-amber-500"
        : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-xs text-slate-600 font-medium w-8 text-right">
        {value}%
      </span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AbsensiRekapPage() {
  const [search, setSearch] = useState("");
  const [divisionFilter, setDivisionFilter] = useState<Division | "Semua">(
    "Semua",
  );
  const [statusFilter, setStatusFilter] = useState<Status | "Semua">("Semua");
  const [sortBy, setSortBy] = useState<"name" | "rate" | "division">(
    "division",
  );
  const [today] = useState(
    new Date().toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }),
  );

  const filtered = useMemo(() => {
    let data = [...MOCK_DATA];
    if (search)
      data = data.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.role.toLowerCase().includes(search.toLowerCase()),
      );
    if (divisionFilter !== "Semua")
      data = data.filter((s) => s.division === divisionFilter);
    if (statusFilter !== "Semua")
      data = data.filter((s) => s.status === statusFilter);
    if (sortBy === "name") data.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "rate")
      data.sort((a, b) => b.attendanceRate - a.attendanceRate);
    else data.sort((a, b) => a.division.localeCompare(b.division));
    return data;
  }, [search, divisionFilter, statusFilter, sortBy]);

  const stats = useMemo(() => {
    const total = MOCK_DATA.length;
    const hadir = MOCK_DATA.filter((s) => s.status === "Hadir").length;
    const terlambat = MOCK_DATA.filter((s) => s.status === "Terlambat").length;
    const izin = MOCK_DATA.filter((s) => s.status === "Izin").length;
    const alfa = MOCK_DATA.filter((s) => s.status === "Alfa").length;
    const wfh = MOCK_DATA.filter((s) => s.status === "WFH").length;
    const avgRate = Math.round(
      MOCK_DATA.reduce((s, d) => s + d.attendanceRate, 0) / total,
    );
    return { total, hadir, terlambat, izin, alfa, wfh, avgRate };
  }, []);

  const divisionStats = useMemo(() => {
    return DIVISIONS.map((div) => {
      const staff = MOCK_DATA.filter((s) => s.division === div);
      const hadir = staff.filter(
        (s) => s.status === "Hadir" || s.status === "WFH",
      ).length;
      return {
        div,
        total: staff.length,
        hadir,
        rate: staff.length ? Math.round((hadir / staff.length) * 100) : 0,
      };
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Top Header ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 leading-none">
                KodingYuk HRIS
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Human Resource Information System
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-xs text-slate-600 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-50 transition-colors flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                />
              </svg>
              Export
            </button>
            <button className="text-xs text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg px-3 py-1.5 transition-colors flex items-center gap-1.5">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Refresh
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-xl mx-auto px-6 py-8 space-y-8">
        {/* ── Page Title ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Rekap Absensi
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              {today} · Data diperbarui real-time
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl px-3 py-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Tracking
          </div>
        </div>

        {/* ── Summary Cards ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            {
              label: "Total Staff",
              value: stats.total,
              icon: "👥",
              bg: "bg-white",
              accent: "text-slate-900",
            },
            {
              label: "Hadir / WFH",
              value: `${stats.hadir + stats.wfh}`,
              icon: "✅",
              bg: "bg-emerald-600",
              accent: "text-white",
              sub: `dari ${stats.total} staff`,
            },
            {
              label: "Terlambat",
              value: stats.terlambat,
              icon: "⏰",
              bg: "bg-amber-50",
              accent: "text-amber-800",
            },
            {
              label: "Rata-rata Kehadiran",
              value: `${stats.avgRate}%`,
              icon: "📊",
              bg: "bg-indigo-600",
              accent: "text-white",
              sub: "bulan ini",
            },
          ].map((card, i) => (
            <div
              key={i}
              className={`rounded-2xl p-5 ${card.bg} ${card.bg === "bg-white" ? "border border-slate-200" : ""} shadow-sm`}
            >
              <p className={`text-3xl mb-1 opacity-80`}>{card.icon}</p>
              <p className={`text-2xl font-bold ${card.accent}`}>
                {card.value}
              </p>
              <p
                className={`text-xs mt-0.5 ${card.accent === "text-white" ? "text-white/70" : "text-slate-500"}`}
              >
                {card.label}
              </p>
              {card.sub && (
                <p
                  className={`text-xs mt-0.5 ${card.accent === "text-white" ? "text-white/60" : "text-slate-400"}`}
                >
                  {card.sub}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* ── Status Breakdown + Division Stats ── */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Status Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-800 mb-5">
              Status Kehadiran Hari Ini
            </h2>
            <div className="space-y-3">
              {(["Hadir", "Terlambat", "WFH", "Izin", "Alfa"] as Status[]).map(
                (status) => {
                  const count = MOCK_DATA.filter(
                    (s) => s.status === status,
                  ).length;
                  const pct = Math.round((count / stats.total) * 100);
                  const cfg = STATUS_CONFIG[status];
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <span
                        className={`text-xs font-medium w-20 shrink-0 ${cfg.text}`}
                      >
                        {status}
                      </span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cfg.dot} transition-all`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-500 w-8 text-right">
                        {count}
                      </span>
                    </div>
                  );
                },
              )}
            </div>
            {/* Legend chips */}
            <div className="flex flex-wrap gap-2 mt-5 pt-4 border-t border-slate-100">
              {(["Hadir", "Terlambat", "WFH", "Izin", "Alfa"] as Status[]).map(
                (s) => (
                  <span
                    key={s}
                    className={`text-xs px-2 py-0.5 rounded-md ${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].text}`}
                  >
                    {MOCK_DATA.filter((d) => d.status === s).length}× {s}
                  </span>
                ),
              )}
            </div>
          </div>

          {/* Division Stats */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6">
            <h2 className="text-sm font-semibold text-slate-800 mb-5">
              Kehadiran per Divisi
            </h2>
            <div className="space-y-4">
              {divisionStats.map(({ div, total, hadir, rate }) => (
                <div key={div} className="flex items-center gap-3">
                  <div
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${DIVISION_COLOR[div]}`}
                  />
                  <span className="text-xs text-slate-700 font-medium w-24 shrink-0">
                    {div}
                  </span>
                  <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${DIVISION_COLOR[div]} opacity-80`}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                  <span className="text-xs text-slate-500 shrink-0 w-16 text-right">
                    {hadir}/{total} staff
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Table Section ── */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          {/* Table Header */}
          <div className="px-6 py-4 border-b border-slate-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <h2 className="text-sm font-semibold text-slate-800 flex-1">
                Daftar Kehadiran Staff
              </h2>

              {/* Search */}
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari nama atau role..."
                  className="pl-8 pr-4 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-300 w-48"
                />
              </div>

              {/* Division Filter */}
              <select
                value={divisionFilter}
                onChange={(e) =>
                  setDivisionFilter(e.target.value as Division | "Semua")
                }
                className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="Semua">Semua Divisi</option>
                {DIVISIONS.map((d) => (
                  <option key={d}>{d}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(e.target.value as Status | "Semua")
                }
                className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="Semua">Semua Status</option>
                {(
                  ["Hadir", "Terlambat", "WFH", "Izin", "Alfa"] as Status[]
                ).map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>

              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "name" | "rate" | "division")
                }
                className="text-xs border border-slate-200 rounded-lg px-3 py-1.5 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                <option value="division">Urutkan: Divisi</option>
                <option value="name">Urutkan: Nama</option>
                <option value="rate">Urutkan: Kehadiran</option>
              </select>
            </div>
          </div>

          {/* Count */}
          <div className="px-6 py-2 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <p className="text-xs text-slate-500">
              Menampilkan{" "}
              <span className="font-semibold text-slate-700">
                {filtered.length}
              </span>{" "}
              dari {MOCK_DATA.length} staff
            </p>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-slate-500 font-medium border-b border-slate-100">
                  <th className="text-left px-6 py-3">Staff</th>
                  <th className="text-left px-4 py-3">Divisi</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-left px-4 py-3">Clock In</th>
                  <th className="text-left px-4 py-3">Clock Out</th>
                  <th className="text-left px-4 py-3">Jam Kerja</th>
                  <th className="text-left px-4 py-3 min-w-[140px]">
                    Kehadiran Bulan Ini
                  </th>
                  <th className="text-left px-4 py-3">Hadir / Alfa / Cuti</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((staff) => (
                  <tr
                    key={staff.id}
                    className="hover:bg-slate-50 transition-colors group"
                  >
                    {/* Name + Role */}
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar
                          initials={staff.avatar}
                          division={staff.division}
                        />
                        <div>
                          <p className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                            {staff.name}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">
                            {staff.role}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Division */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md font-medium ${DIVISION_LIGHT[staff.division]}`}
                      >
                        {staff.division}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3.5">
                      <StatusBadge status={staff.status} />
                    </td>

                    {/* Clock In */}
                    <td className="px-4 py-3.5">
                      {staff.clockIn ? (
                        <div>
                          <p className="text-xs font-medium text-slate-700">
                            {staff.clockIn}
                          </p>
                          {staff.lateMinutes > 0 && (
                            <p className="text-xs text-amber-600">
                              +{staff.lateMinutes}m terlambat
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>

                    {/* Clock Out */}
                    <td className="px-4 py-3.5">
                      <span className="text-xs font-medium text-slate-700">
                        {staff.clockOut || (
                          <span className="text-slate-300">—</span>
                        )}
                      </span>
                    </td>

                    {/* Hours */}
                    <td className="px-4 py-3.5">
                      {staff.totalHours != null ? (
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-slate-700">
                            {staff.totalHours.toFixed(1)}j
                          </span>
                          <span
                            className={`text-xs ${staff.totalHours >= 8 ? "text-emerald-600" : "text-amber-600"}`}
                          >
                            {staff.totalHours >= 8 ? "✓" : "⚡"}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-300">—</span>
                      )}
                    </td>

                    {/* Rate */}
                    <td className="px-4 py-3.5 min-w-[140px]">
                      <RateBar value={staff.attendanceRate} />
                    </td>

                    {/* Days */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                          {staff.daysPresent}h
                        </span>
                        <span className="text-xs bg-red-50 text-red-700 px-1.5 py-0.5 rounded font-medium">
                          {staff.daysAbsent}a
                        </span>
                        <span className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                          {staff.daysLeave}c
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="text-center py-16">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-sm text-slate-500">
                  Tidak ada staff yang sesuai filter.
                </p>
                <button
                  onClick={() => {
                    setSearch("");
                    setDivisionFilter("Semua");
                    setStatusFilter("Semua");
                  }}
                  className="text-xs text-indigo-600 mt-2 hover:underline"
                >
                  Reset filter
                </button>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
            <p className="text-xs text-slate-400">
              h = hadir · a = alfa/absent · c = cuti
            </p>
            <p className="text-xs text-slate-400">Data periode: Mei 2025</p>
          </div>
        </div>
      </main>

      {/* ── Footer ── */}
      <footer className="mt-10 border-t border-slate-200 bg-white">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-xs text-slate-400">KodingYuk HRIS · v1.0.0</p>
          <p className="text-xs text-slate-400">Powered by Next.js + Odoo 17</p>
        </div>
      </footer>
    </div>
  );
}
