"use client";

import { useState, useMemo } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type LeaveType =
  | "Cuti Tahunan"
  | "Cuti Sakit"
  | "Cuti Khusus"
  | "Izin Mendadak";
type LeaveStatus =
  | "Menunggu"
  | "Disetujui Head"
  | "Disetujui"
  | "Ditolak"
  | "Dibatalkan";
type Division =
  | "Tech"
  | "Creative"
  | "Marketing"
  | "Operations"
  | "HR"
  | "Finance";
type ViewMode = "all" | "pending" | "approved" | "rejected";

interface LeaveRequest {
  id: string;
  staffId: number;
  staffName: string;
  staffAvatar: string;
  division: Division;
  role: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  submittedAt: string;
  approvedBy?: string;
  rejectedReason?: string;
  notes?: string;
}

interface LeaveBalance {
  staffId: number;
  annual: { total: number; used: number; pending: number };
  sick: { total: number; used: number; pending: number };
  special: { total: number; used: number; pending: number };
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const LEAVE_REQUESTS: LeaveRequest[] = [
  {
    id: "LV-2025-041",
    staffId: 1,
    staffName: "Aqila Sari Dewi",
    staffAvatar: "AS",
    division: "Tech",
    role: "Frontend Dev Intern",
    leaveType: "Cuti Tahunan",
    startDate: "2025-05-19",
    endDate: "2025-05-21",
    totalDays: 3,
    reason: "Acara keluarga di Yogyakarta",
    status: "Menunggu",
    submittedAt: "2025-05-14",
  },
  {
    id: "LV-2025-040",
    staffId: 3,
    staffName: "Citra Nanda",
    staffAvatar: "CN",
    division: "Creative",
    role: "UI/UX Designer Intern",
    leaveType: "Cuti Sakit",
    startDate: "2025-05-14",
    endDate: "2025-05-15",
    totalDays: 2,
    reason: "Demam dan perlu istirahat",
    status: "Disetujui Head",
    submittedAt: "2025-05-13",
    notes: "Mohon kirim surat dokter",
  },
  {
    id: "LV-2025-039",
    staffId: 7,
    staffName: "Gita Wulandari",
    staffAvatar: "GW",
    division: "Finance",
    role: "Finance Admin Intern",
    leaveType: "Cuti Tahunan",
    startDate: "2025-05-26",
    endDate: "2025-05-30",
    totalDays: 5,
    reason: "Liburan ke Bali bersama keluarga",
    status: "Disetujui",
    submittedAt: "2025-05-10",
    approvedBy: "Dinda Kusuma",
  },
  {
    id: "LV-2025-038",
    staffId: 6,
    staffName: "Farhan Malik",
    staffAvatar: "FM",
    division: "Operations",
    role: "Ops Intern",
    leaveType: "Izin Mendadak",
    startDate: "2025-05-13",
    endDate: "2025-05-13",
    totalDays: 1,
    reason: "Urusan administrasi penting",
    status: "Ditolak",
    submittedAt: "2025-05-13",
    rejectedReason: "Tim sedang dalam periode sibuk, harap reschedule",
  },
  {
    id: "LV-2025-037",
    staffId: 11,
    staffName: "Kartika Sari",
    staffAvatar: "KS",
    division: "HR",
    role: "Training Staff Intern",
    leaveType: "Cuti Khusus",
    startDate: "2025-05-20",
    endDate: "2025-05-20",
    totalDays: 1,
    reason: "Wisuda S1",
    status: "Disetujui",
    submittedAt: "2025-05-08",
    approvedBy: "Khalda Mirza",
  },
  {
    id: "LV-2025-036",
    staffId: 2,
    staffName: "Bima Eka Putra",
    staffAvatar: "BE",
    division: "Tech",
    role: "Backend Dev Intern",
    leaveType: "Cuti Tahunan",
    startDate: "2025-05-22",
    endDate: "2025-05-23",
    totalDays: 2,
    reason: "Pernikahan saudara",
    status: "Menunggu",
    submittedAt: "2025-05-12",
  },
  {
    id: "LV-2025-035",
    staffId: 10,
    staffName: "Joko Widodo",
    staffAvatar: "JW",
    division: "Marketing",
    role: "Social Media Intern",
    leaveType: "Cuti Sakit",
    startDate: "2025-05-14",
    endDate: "2025-05-16",
    totalDays: 3,
    reason: "Sakit maag dan perlu rawat inap",
    status: "Disetujui Head",
    submittedAt: "2025-05-13",
  },
  {
    id: "LV-2025-034",
    staffId: 5,
    staffName: "Elsa Fatimah",
    staffAvatar: "EF",
    division: "HR",
    role: "Recruitment Staff Intern",
    leaveType: "Izin Mendadak",
    startDate: "2025-05-09",
    endDate: "2025-05-09",
    totalDays: 1,
    reason: "Keperluan mendadak keluarga",
    status: "Disetujui",
    submittedAt: "2025-05-09",
    approvedBy: "Siti Rahayu",
  },
  {
    id: "LV-2025-033",
    staffId: 14,
    staffName: "Naufal Rizki",
    staffAvatar: "NR",
    division: "Tech",
    role: "QA Intern",
    leaveType: "Cuti Tahunan",
    startDate: "2025-06-02",
    endDate: "2025-06-06",
    totalDays: 5,
    reason: "Pulang kampung Lebaran",
    status: "Menunggu",
    submittedAt: "2025-05-11",
  },
  {
    id: "LV-2025-032",
    staffId: 9,
    staffName: "Ira Kusuma",
    staffAvatar: "IK",
    division: "Creative",
    role: "Graphic Design Intern",
    leaveType: "Cuti Khusus",
    startDate: "2025-05-17",
    endDate: "2025-05-17",
    totalDays: 1,
    reason: "Akad nikah",
    status: "Disetujui",
    submittedAt: "2025-05-05",
    approvedBy: "Dinda Kusuma",
  },
];

const LEAVE_BALANCES: LeaveBalance[] = [
  {
    staffId: 1,
    annual: { total: 12, used: 3, pending: 3 },
    sick: { total: 6, used: 1, pending: 0 },
    special: { total: 3, used: 0, pending: 0 },
  },
];

// ─── Config ───────────────────────────────────────────────────────────────────

const LEAVE_TYPE_CONFIG: Record<
  LeaveType,
  { color: string; bg: string; border: string; icon: string }
> = {
  "Cuti Tahunan": {
    color: "text-indigo-700",
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    icon: "🏖️",
  },
  "Cuti Sakit": {
    color: "text-rose-700",
    bg: "bg-rose-50",
    border: "border-rose-200",
    icon: "🏥",
  },
  "Cuti Khusus": {
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    icon: "⭐",
  },
  "Izin Mendadak": {
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    icon: "⚡",
  },
};

const STATUS_CONFIG: Record<
  LeaveStatus,
  { label: string; color: string; bg: string; dot: string; step: number }
> = {
  Menunggu: {
    label: "Menunggu",
    color: "text-slate-600",
    bg: "bg-slate-100",
    dot: "bg-slate-400",
    step: 1,
  },
  "Disetujui Head": {
    label: "Disetujui Head",
    color: "text-blue-700",
    bg: "bg-blue-50",
    dot: "bg-blue-500",
    step: 2,
  },
  Disetujui: {
    label: "Disetujui",
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    dot: "bg-emerald-500",
    step: 3,
  },
  Ditolak: {
    label: "Ditolak",
    color: "text-red-700",
    bg: "bg-red-50",
    dot: "bg-red-500",
    step: 0,
  },
  Dibatalkan: {
    label: "Dibatalkan",
    color: "text-slate-500",
    bg: "bg-slate-50",
    dot: "bg-slate-300",
    step: 0,
  },
};

const DIVISION_COLOR: Record<Division, { bg: string; text: string }> = {
  Tech: { bg: "bg-blue-500", text: "text-white" },
  Creative: { bg: "bg-pink-500", text: "text-white" },
  Marketing: { bg: "bg-orange-500", text: "text-white" },
  Operations: { bg: "bg-teal-500", text: "text-white" },
  HR: { bg: "bg-purple-500", text: "text-white" },
  Finance: { bg: "bg-green-600", text: "text-white" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function diffDays(start: string, end: string) {
  const s = new Date(start),
    e = new Date(end);
  return Math.round((e.getTime() - s.getTime()) / 86400000) + 1;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({
  initials,
  division,
  size = "md",
}: {
  initials: string;
  division: Division;
  size?: "sm" | "md" | "lg";
}) {
  const sz =
    size === "sm"
      ? "w-8 h-8 text-xs"
      : size === "lg"
        ? "w-12 h-12 text-base"
        : "w-10 h-10 text-sm";
  const dc = DIVISION_COLOR[division];
  return (
    <div
      className={`${sz} ${dc.bg} ${dc.text} rounded-xl flex items-center justify-center font-semibold shrink-0`}
    >
      {initials}
    </div>
  );
}

function LeaveTypePill({ type }: { type: LeaveType }) {
  const cfg = LEAVE_TYPE_CONFIG[type];
  return (
    <span
      className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-md border font-medium ${cfg.color} ${cfg.bg} ${cfg.border}`}
    >
      <span>{cfg.icon}</span>
      {type}
    </span>
  );
}

function StatusBadge({ status }: { status: LeaveStatus }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${cfg.color} ${cfg.bg}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

function ApprovalStepper({ status }: { status: LeaveStatus }) {
  const step = STATUS_CONFIG[status].step;
  const rejected = status === "Ditolak";
  const steps = ["Diajukan", "Head", "Manager"];

  if (rejected) {
    return (
      <div className="flex items-center gap-1 mt-2">
        <span className="text-xs text-red-500 font-medium">✕ Ditolak</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 mt-2">
      {steps.map((s, i) => (
        <div key={i} className="flex items-center gap-1">
          <div
            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold
            ${i < step ? "bg-emerald-500 text-white" : i === step ? "bg-indigo-500 text-white ring-2 ring-indigo-200" : "bg-slate-100 text-slate-400"}`}
          >
            {i < step ? "✓" : i + 1}
          </div>
          <span
            className={`text-[10px] ${i < step ? "text-emerald-600" : i === step ? "text-indigo-600 font-medium" : "text-slate-400"}`}
          >
            {s}
          </span>
          {i < steps.length - 1 && (
            <div
              className={`w-6 h-px ${i < step - 1 ? "bg-emerald-400" : "bg-slate-200"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function BalanceRing({
  used,
  total,
  label,
  color,
}: {
  used: number;
  total: number;
  label: string;
  color: string;
}) {
  const pct = total > 0 ? (used / total) * 100 : 0;
  const r = 26,
    circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-16 h-16">
        <svg viewBox="0 0 60 60" className="w-full h-full -rotate-90">
          <circle
            cx="30"
            cy="30"
            r={r}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth="5"
          />
          <circle
            cx="30"
            cy="30"
            r={r}
            fill="none"
            stroke={color}
            strokeWidth="5"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-sm font-bold text-slate-800">
            {total - used}
          </span>
        </div>
      </div>
      <p className="text-xs text-slate-500 text-center leading-tight">
        {label}
      </p>
      <p className="text-[10px] text-slate-400">
        {used}/{total} terpakai
      </p>
    </div>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function DetailDrawer({
  req,
  onClose,
  onApprove,
  onReject,
}: {
  req: LeaveRequest;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [rejectNote, setRejectNote] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const ltc = LEAVE_TYPE_CONFIG[req.leaveType];

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full max-w-md bg-white h-full flex flex-col shadow-2xl overflow-y-auto">
        {/* Drawer header */}
        <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div>
            <p className="text-xs text-slate-400 font-mono mb-1">{req.id}</p>
            <h3 className="text-base font-semibold text-slate-900">
              {req.staffName}
            </h3>
            <p className="text-xs text-slate-500">
              {req.role} · {req.division}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center transition-colors text-slate-400"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Drawer body */}
        <div className="flex-1 px-6 py-5 space-y-5">
          {/* Leave info */}
          <div className={`rounded-2xl p-4 border ${ltc.border} ${ltc.bg}`}>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">{ltc.icon}</span>
              <div>
                <p className={`text-sm font-semibold ${ltc.color}`}>
                  {req.leaveType}
                </p>
                <p className={`text-xs ${ltc.color} opacity-70`}>
                  {req.totalDays} hari kerja
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Mulai</p>
                <p className="text-sm font-medium text-slate-800">
                  {formatDate(req.startDate)}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Selesai</p>
                <p className="text-sm font-medium text-slate-800">
                  {formatDate(req.endDate)}
                </p>
              </div>
            </div>
          </div>

          {/* Reason */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
              Alasan
            </p>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-3">
              {req.reason}
            </p>
          </div>

          {/* Notes if any */}
          {req.notes && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs text-amber-700 font-medium mb-1">
                📎 Catatan
              </p>
              <p className="text-xs text-amber-700">{req.notes}</p>
            </div>
          )}

          {/* Rejected reason */}
          {req.rejectedReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3">
              <p className="text-xs text-red-700 font-medium mb-1">
                ✕ Alasan Penolakan
              </p>
              <p className="text-xs text-red-700">{req.rejectedReason}</p>
            </div>
          )}

          {/* Approval info */}
          {req.approvedBy && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
              <p className="text-xs text-emerald-700 font-medium mb-1">
                ✓ Disetujui oleh
              </p>
              <p className="text-xs text-emerald-700">{req.approvedBy}</p>
            </div>
          )}

          {/* Status + stepper */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
              Progress Approval
            </p>
            <div className="bg-slate-50 rounded-xl p-3">
              <StatusBadge status={req.status} />
              <ApprovalStepper status={req.status} />
            </div>
          </div>

          {/* Meta */}
          <div className="text-xs text-slate-400">
            Diajukan pada {formatDate(req.submittedAt)}
          </div>

          {/* Reject form */}
          {showRejectForm && (
            <div className="space-y-2">
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Alasan penolakan..."
                rows={3}
                className="w-full text-xs border border-red-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-red-300 resize-none bg-red-50 placeholder-red-300 text-red-800"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onReject(req.id);
                    setShowRejectForm(false);
                  }}
                  className="flex-1 text-xs bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Konfirmasi Tolak
                </button>
                <button
                  onClick={() => setShowRejectForm(false)}
                  className="flex-1 text-xs border border-slate-200 text-slate-600 py-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Action buttons */}
        {(req.status === "Menunggu" || req.status === "Disetujui Head") &&
          !showRejectForm && (
            <div className="px-6 py-4 border-t border-slate-100 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowRejectForm(true)}
                className="text-sm border border-red-200 text-red-600 py-2.5 rounded-xl hover:bg-red-50 transition-colors font-medium"
              >
                Tolak
              </button>
              <button
                onClick={() => onApprove(req.id)}
                className="text-sm bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
              >
                {req.status === "Menunggu" ? "Setujui (Head)" : "Setujui Final"}
              </button>
            </div>
          )}
      </div>
    </div>
  );
}

// ─── New Leave Form Modal ─────────────────────────────────────────────────────

function NewLeaveModal({
  onClose,
  onSubmit,
}: {
  onClose: () => void;
  onSubmit: (data: Partial<LeaveRequest>) => void;
}) {
  const [form, setForm] = useState({
    leaveType: "Cuti Tahunan" as LeaveType,
    startDate: "",
    endDate: "",
    reason: "",
  });

  const days =
    form.startDate && form.endDate ? diffDays(form.startDate, form.endDate) : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg">
        <div className="px-7 pt-7 pb-5 border-b border-slate-100">
          <h3 className="text-lg font-semibold text-slate-900">Ajukan Cuti</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Pengajuan akan dikirim ke Head Divisi untuk persetujuan
          </p>
        </div>
        <div className="px-7 py-5 space-y-4">
          {/* Leave type */}
          <div>
            <label className="text-xs text-slate-500 font-medium mb-1.5 block">
              Jenis Cuti
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(
                [
                  "Cuti Tahunan",
                  "Cuti Sakit",
                  "Cuti Khusus",
                  "Izin Mendadak",
                ] as LeaveType[]
              ).map((t) => {
                const cfg = LEAVE_TYPE_CONFIG[t];
                const active = form.leaveType === t;
                return (
                  <button
                    key={t}
                    onClick={() => setForm((f) => ({ ...f, leaveType: t }))}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-left text-xs font-medium transition-all
                      ${active ? `${cfg.border} ${cfg.bg} ${cfg.color} border-2` : "border-slate-200 text-slate-600 hover:border-slate-300"}`}
                  >
                    <span>{cfg.icon}</span> {t}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-500 font-medium mb-1.5 block">
                Tanggal Mulai
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, startDate: e.target.value }))
                }
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-slate-50"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 font-medium mb-1.5 block">
                Tanggal Selesai
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) =>
                  setForm((f) => ({ ...f, endDate: e.target.value }))
                }
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-slate-50"
              />
            </div>
          </div>

          {/* Day counter */}
          {days > 0 && (
            <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-200 rounded-xl px-4 py-2.5">
              <span className="text-2xl font-bold text-indigo-700">{days}</span>
              <div>
                <p className="text-xs font-medium text-indigo-700">
                  hari kerja
                </p>
                <p className="text-xs text-indigo-500">
                  Akan dikurangi dari saldo cuti
                </p>
              </div>
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="text-xs text-slate-500 font-medium mb-1.5 block">
              Alasan / Keterangan
            </label>
            <textarea
              value={form.reason}
              onChange={(e) =>
                setForm((f) => ({ ...f, reason: e.target.value }))
              }
              rows={3}
              placeholder="Jelaskan keperluan cuti Anda..."
              className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none bg-slate-50 placeholder-slate-400"
            />
          </div>
        </div>

        <div className="px-7 py-5 border-t border-slate-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 text-sm border border-slate-200 text-slate-600 py-3 rounded-xl hover:bg-slate-50 transition-colors font-medium"
          >
            Batal
          </button>
          <button
            onClick={() => {
              if (form.startDate && form.endDate && form.reason) {
                onSubmit(form);
                onClose();
              }
            }}
            disabled={!form.startDate || !form.endDate || !form.reason}
            className="flex-1 text-sm bg-indigo-600 text-white py-3 rounded-xl hover:bg-indigo-700 transition-colors font-medium disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Ajukan Cuti
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Leave Card ───────────────────────────────────────────────────────────────

function LeaveCard({
  req,
  onClick,
}: {
  req: LeaveRequest;
  onClick: () => void;
}) {
  const isPending =
    req.status === "Menunggu" || req.status === "Disetujui Head";

  return (
    <div
      onClick={onClick}
      className={`group bg-white rounded-2xl border cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 overflow-hidden
        ${isPending ? "border-l-4 border-l-indigo-400 border-slate-200" : "border-slate-200"}`}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <Avatar initials={req.staffAvatar} division={req.division} />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-700 transition-colors">
                  {req.staffName}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{req.role}</p>
              </div>
              <StatusBadge status={req.status} />
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          <LeaveTypePill type={req.leaveType} />
          <span className="text-xs text-slate-400">·</span>
          <span className="text-xs text-slate-600 font-medium">
            {req.totalDays} hari
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <div className="flex-1 bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">
              Mulai
            </p>
            <p className="text-xs font-medium text-slate-700">
              {formatDate(req.startDate)}
            </p>
          </div>
          <svg
            className="w-4 h-4 text-slate-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
          <div className="flex-1 bg-slate-50 rounded-lg px-3 py-2">
            <p className="text-[10px] text-slate-400 uppercase tracking-wide">
              Selesai
            </p>
            <p className="text-xs font-medium text-slate-700">
              {formatDate(req.endDate)}
            </p>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-400 truncate flex-1 mr-2">
            {req.reason}
          </p>
          <p className="text-[10px] font-mono text-slate-300 shrink-0">
            {req.id}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CutiPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("all");
  const [selectedReq, setSelectedReq] = useState<LeaveRequest | null>(null);
  const [showNewModal, setShowNewModal] = useState(false);
  const [requests, setRequests] = useState(LEAVE_REQUESTS);
  const [search, setSearch] = useState("");

  const myBalance = LEAVE_BALANCES[0];

  const filtered = useMemo(() => {
    let data = requests;
    if (viewMode === "pending")
      data = data.filter(
        (r) => r.status === "Menunggu" || r.status === "Disetujui Head",
      );
    else if (viewMode === "approved")
      data = data.filter((r) => r.status === "Disetujui");
    else if (viewMode === "rejected")
      data = data.filter((r) => r.status === "Ditolak");
    if (search)
      data = data.filter(
        (r) =>
          r.staffName.toLowerCase().includes(search.toLowerCase()) ||
          r.leaveType.toLowerCase().includes(search.toLowerCase()),
      );
    return data;
  }, [requests, viewMode, search]);

  const stats = useMemo(
    () => ({
      total: requests.length,
      pending: requests.filter(
        (r) => r.status === "Menunggu" || r.status === "Disetujui Head",
      ).length,
      approved: requests.filter((r) => r.status === "Disetujui").length,
      rejected: requests.filter((r) => r.status === "Ditolak").length,
    }),
    [requests],
  );

  function handleApprove(id: string) {
    setRequests((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        if (r.status === "Menunggu")
          return { ...r, status: "Disetujui Head" as LeaveStatus };
        if (r.status === "Disetujui Head")
          return {
            ...r,
            status: "Disetujui" as LeaveStatus,
            approvedBy: "Manager",
          };
        return r;
      }),
    );
    setSelectedReq(null);
  }

  function handleReject(id: string) {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === id ? { ...r, status: "Ditolak" as LeaveStatus } : r,
      ),
    );
    setSelectedReq(null);
  }

  function handleNewLeave(data: Partial<LeaveRequest>) {
    const newReq: LeaveRequest = {
      id: `LV-2025-0${requests.length + 42}`,
      staffId: 99,
      staffName: "Anda",
      staffAvatar: "ME",
      division: "Tech",
      role: "Staff",
      leaveType: data.leaveType ?? "Cuti Tahunan",
      startDate: data.startDate ?? "",
      endDate: data.endDate ?? "",
      totalDays:
        data.startDate && data.endDate
          ? diffDays(data.startDate, data.endDate)
          : 1,
      reason: data.reason ?? "",
      status: "Menunggu",
      submittedAt: new Date().toISOString().split("T")[0],
    };
    setRequests((prev) => [newReq, ...prev]);
  }

  const VIEW_TABS: { key: ViewMode; label: string; count: number }[] = [
    { key: "all", label: "Semua", count: stats.total },
    { key: "pending", label: "Menunggu", count: stats.pending },
    { key: "approved", label: "Disetujui", count: stats.approved },
    { key: "rejected", label: "Ditolak", count: stats.rejected },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* ── Header ── */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
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
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900 leading-none">
                KodingYuk HRIS
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Manajemen Cuti</p>
            </div>
          </div>
          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
            Ajukan Cuti
          </button>
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-6 py-8">
        <div className="flex gap-8">
          {/* ── Left sidebar ── */}
          <aside className="w-72 shrink-0 space-y-5">
            {/* My balance */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center text-sm">
                  🏖️
                </div>
                <div>
                  <p className="text-xs font-medium text-white">
                    Saldo Cuti Saya
                  </p>
                  <p className="text-[10px] text-white/50">
                    Aqila Sari Dewi · Tech
                  </p>
                </div>
              </div>
              <div className="flex justify-around">
                <BalanceRing
                  used={myBalance.annual.used + myBalance.annual.pending}
                  total={myBalance.annual.total}
                  label="Tahunan"
                  color="#6366f1"
                />
                <BalanceRing
                  used={myBalance.sick.used}
                  total={myBalance.sick.total}
                  label="Sakit"
                  color="#f43f5e"
                />
                <BalanceRing
                  used={myBalance.special.used}
                  total={myBalance.special.total}
                  label="Khusus"
                  color="#f59e0b"
                />
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-white/60">Pending approval</span>
                  <span className="text-amber-400 font-medium">
                    {myBalance.annual.pending} hari
                  </span>
                </div>
              </div>
            </div>

            {/* Quick stats */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 space-y-3">
              <p className="text-xs font-semibold text-slate-700">
                Ringkasan Pengajuan
              </p>
              {[
                {
                  label: "Total Pengajuan",
                  value: stats.total,
                  color: "text-slate-800",
                },
                {
                  label: "Menunggu Approval",
                  value: stats.pending,
                  color: "text-indigo-600",
                },
                {
                  label: "Disetujui",
                  value: stats.approved,
                  color: "text-emerald-600",
                },
                {
                  label: "Ditolak",
                  value: stats.rejected,
                  color: "text-red-600",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between"
                >
                  <span className="text-xs text-slate-500">{s.label}</span>
                  <span className={`text-sm font-bold ${s.color}`}>
                    {s.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Upcoming leaves */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-700 mb-3">
                Cuti Mendatang
              </p>
              <div className="space-y-2.5">
                {requests
                  .filter(
                    (r) =>
                      r.status === "Disetujui" &&
                      new Date(r.startDate) > new Date(),
                  )
                  .slice(0, 3)
                  .map((r) => (
                    <div key={r.id} className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-slate-50 rounded-lg flex flex-col items-center justify-center border border-slate-200">
                        <p className="text-[10px] text-slate-400 leading-none">
                          {new Date(r.startDate)
                            .toLocaleDateString("id-ID", { month: "short" })
                            .toUpperCase()}
                        </p>
                        <p className="text-xs font-bold text-slate-700 leading-none">
                          {new Date(r.startDate).getDate()}
                        </p>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-700 truncate">
                          {r.staffName}
                        </p>
                        <p className="text-[10px] text-slate-400">
                          {r.totalDays} hari · {r.leaveType}
                        </p>
                      </div>
                    </div>
                  ))}
                {requests.filter(
                  (r) =>
                    r.status === "Disetujui" &&
                    new Date(r.startDate) > new Date(),
                ).length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-2">
                    Tidak ada cuti mendatang
                  </p>
                )}
              </div>
            </div>

            {/* Leave type legend */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4">
              <p className="text-xs font-semibold text-slate-700 mb-3">
                Jenis Cuti
              </p>
              <div className="space-y-2">
                {(
                  Object.entries(LEAVE_TYPE_CONFIG) as [
                    LeaveType,
                    (typeof LEAVE_TYPE_CONFIG)[LeaveType],
                  ][]
                ).map(([type, cfg]) => (
                  <div key={type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span>{cfg.icon}</span>
                      <span className="text-xs text-slate-600">{type}</span>
                    </div>
                    <span className="text-xs font-medium text-slate-700">
                      {requests.filter((r) => r.leaveType === type).length}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* ── Main content ── */}
          <div className="flex-1 min-w-0">
            {/* Page title */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  Manajemen Cuti
                </h1>
                <p className="text-sm text-slate-500 mt-0.5">
                  Kelola pengajuan dan persetujuan cuti seluruh staff
                </p>
              </div>
              {stats.pending > 0 && (
                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-700 rounded-xl px-3 py-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-xs font-medium">
                    {stats.pending} menunggu persetujuan
                  </span>
                </div>
              )}
            </div>

            {/* Tabs + Search */}
            <div className="flex items-center gap-4 mb-5">
              <div className="flex bg-white border border-slate-200 rounded-xl p-1 gap-1">
                {VIEW_TABS.map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setViewMode(tab.key)}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all
                      ${viewMode === tab.key ? "bg-indigo-600 text-white shadow-sm" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
                  >
                    {tab.label}
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold
                      ${viewMode === tab.key ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex-1 relative">
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
                  placeholder="Cari nama atau jenis cuti..."
                  className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-indigo-300"
                />
              </div>
            </div>

            {/* Cards grid */}
            {filtered.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {filtered.map((req) => (
                  <LeaveCard
                    key={req.id}
                    req={req}
                    onClick={() => setSelectedReq(req)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-5xl mb-4">🗓️</div>
                <p className="text-base font-medium text-slate-700">
                  Tidak ada pengajuan cuti
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Coba ubah filter atau tambah pengajuan baru
                </p>
                <button
                  onClick={() => setShowNewModal(true)}
                  className="mt-4 text-sm bg-indigo-600 text-white px-5 py-2 rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  + Ajukan Cuti
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {selectedReq && (
        <DetailDrawer
          req={selectedReq}
          onClose={() => setSelectedReq(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
      {showNewModal && (
        <NewLeaveModal
          onClose={() => setShowNewModal(false)}
          onSubmit={handleNewLeave}
        />
      )}
    </div>
  );
}
