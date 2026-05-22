"use client";

import { useState } from "react";

// ── Types ──────────────────────────────────────────────────────────────────
type ViewMode = "calendar" | "list";
type TrainingStatus = "upcoming" | "ongoing" | "completed" | "cancelled";
type FilterStatus = "all" | TrainingStatus;

interface Participant {
  id: number;
  name: string;
  division: string;
  avatar: string;
  attended: boolean | null; // null = belum tercatat
}

interface Training {
  id: number;
  title: string;
  category: string;
  date: string; // "YYYY-MM-DD"
  timeStart: string;
  timeEnd: string;
  location: string;
  trainer: string;
  status: TrainingStatus;
  maxParticipants: number;
  participants: Participant[];
  color: string; // tailwind accent
  description: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────
const MOCK_TRAININGS: Training[] = [
  {
    id: 1,
    title: "Onboarding & Kultur Organisasi",
    category: "Onboarding",
    date: "2025-06-03",
    timeStart: "09:00",
    timeEnd: "11:00",
    location: "Ruang Rapat Utama",
    trainer: "Dinda Aulia (CEO)",
    status: "upcoming",
    maxParticipants: 20,
    color: "violet",
    description:
      "Pengenalan budaya, nilai, dan struktur organisasi KodingYuk untuk intern baru.",
    participants: [
      {
        id: 1,
        name: "Andi Pratama",
        division: "Tech",
        avatar: "AP",
        attended: null,
      },
      {
        id: 2,
        name: "Budi Santoso",
        division: "Creative",
        avatar: "BS",
        attended: null,
      },
      {
        id: 3,
        name: "Citra Dewi",
        division: "Marketing",
        avatar: "CD",
        attended: null,
      },
      {
        id: 4,
        name: "Dani Rahman",
        division: "Finance",
        avatar: "DR",
        attended: null,
      },
      {
        id: 5,
        name: "Eka Putri",
        division: "HR",
        avatar: "EP",
        attended: null,
      },
    ],
  },
  {
    id: 2,
    title: "Technical Writing & Dokumentasi",
    category: "Hard Skill",
    date: "2025-06-05",
    timeStart: "13:00",
    timeEnd: "15:30",
    location: "Lab Komputer B2",
    trainer: "Khalda Sari (CTO)",
    status: "upcoming",
    maxParticipants: 15,
    color: "sky",
    description:
      "Workshop membuat dokumentasi teknis yang baik, termasuk API docs, README, dan user guide.",
    participants: [
      {
        id: 1,
        name: "Fajar Nugroho",
        division: "Tech",
        avatar: "FN",
        attended: null,
      },
      {
        id: 2,
        name: "Gita Lestari",
        division: "Tech",
        avatar: "GL",
        attended: null,
      },
      {
        id: 3,
        name: "Hana Wijaya",
        division: "Operations",
        avatar: "HW",
        attended: null,
      },
    ],
  },
  {
    id: 3,
    title: "Public Speaking & Presentasi",
    category: "Soft Skill",
    date: "2025-05-28",
    timeStart: "10:00",
    timeEnd: "12:00",
    location: "Aula Lantai 3",
    trainer: "Siti Rahayu (COO)",
    status: "completed",
    maxParticipants: 25,
    color: "emerald",
    description:
      "Pelatihan teknik berbicara di depan umum, penyusunan slide, dan manajemen audiens.",
    participants: [
      {
        id: 1,
        name: "Irvan Maulana",
        division: "Marketing",
        avatar: "IM",
        attended: true,
      },
      {
        id: 2,
        name: "Jasmine Aulia",
        division: "Creative",
        avatar: "JA",
        attended: true,
      },
      {
        id: 3,
        name: "Kevin Herdiansyah",
        division: "Tech",
        avatar: "KH",
        attended: false,
      },
      {
        id: 4,
        name: "Lina Mariani",
        division: "HR",
        avatar: "LM",
        attended: true,
      },
      {
        id: 5,
        name: "Mario Santosa",
        division: "Finance",
        avatar: "MS",
        attended: true,
      },
      {
        id: 6,
        name: "Nadya Pratiwi",
        division: "Operations",
        avatar: "NP",
        attended: false,
      },
    ],
  },
  {
    id: 4,
    title: "Design Thinking & Ideasi Produk",
    category: "Hard Skill",
    date: "2025-06-10",
    timeStart: "09:00",
    timeEnd: "16:00",
    location: "Co-working Space Lt.1",
    trainer: "Mentor Eksternal – Pak Reza",
    status: "upcoming",
    maxParticipants: 12,
    color: "amber",
    description:
      "Full-day workshop memahami metodologi Design Thinking dari empati hingga prototyping.",
    participants: [
      {
        id: 1,
        name: "Olivia Damayanti",
        division: "Creative",
        avatar: "OD",
        attended: null,
      },
      {
        id: 2,
        name: "Pandu Wicaksono",
        division: "Tech",
        avatar: "PW",
        attended: null,
      },
      {
        id: 3,
        name: "Qori Amelia",
        division: "Marketing",
        avatar: "QA",
        attended: null,
      },
    ],
  },
  {
    id: 5,
    title: "Manajemen Waktu & Produktivitas",
    category: "Soft Skill",
    date: "2025-05-20",
    timeStart: "14:00",
    timeEnd: "15:30",
    location: "Online – Google Meet",
    trainer: "Dinda Aulia (CEO)",
    status: "completed",
    maxParticipants: 30,
    color: "rose",
    description:
      "Strategi GTD, time blocking, dan alat bantu produktivitas yang digunakan di KodingYuk.",
    participants: [
      {
        id: 1,
        name: "Rio Prasetyo",
        division: "Tech",
        avatar: "RP",
        attended: true,
      },
      {
        id: 2,
        name: "Sari Indah",
        division: "HR",
        avatar: "SI",
        attended: true,
      },
      {
        id: 3,
        name: "Tono Basuki",
        division: "Finance",
        avatar: "TB",
        attended: true,
      },
      {
        id: 4,
        name: "Umi Kalsum",
        division: "Operations",
        avatar: "UK",
        attended: false,
      },
    ],
  },
  {
    id: 6,
    title: "Git & Kolaborasi Developer",
    category: "Hard Skill",
    date: "2025-06-17",
    timeStart: "13:00",
    timeEnd: "15:00",
    location: "Lab Komputer B2",
    trainer: "Khalda Sari (CTO)",
    status: "upcoming",
    maxParticipants: 10,
    color: "teal",
    description:
      "Pengenalan Git workflow, branching strategy, dan code review untuk tim developer intern.",
    participants: [
      {
        id: 1,
        name: "Vino Ardiansyah",
        division: "Tech",
        avatar: "VA",
        attended: null,
      },
      {
        id: 2,
        name: "Wulan Sari",
        division: "Tech",
        avatar: "WS",
        attended: null,
      },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────
const STATUS_META: Record<
  TrainingStatus,
  { label: string; dot: string; badge: string }
> = {
  upcoming: {
    label: "Akan Datang",
    dot: "bg-violet-400",
    badge: "bg-violet-50 text-violet-700 ring-violet-200",
  },
  ongoing: {
    label: "Sedang Berlangsung",
    dot: "bg-emerald-400 animate-pulse",
    badge: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  },
  completed: {
    label: "Selesai",
    badge: "bg-slate-100 text-slate-600 ring-slate-200",
    dot: "bg-slate-400",
  },
  cancelled: {
    label: "Dibatalkan",
    badge: "bg-red-50 text-red-600 ring-red-200",
    dot: "bg-red-400",
  },
};

const COLOR_MAP: Record<
  string,
  { bg: string; light: string; text: string; border: string; dot: string }
> = {
  violet: {
    bg: "bg-violet-500",
    light: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    dot: "bg-violet-400",
  },
  sky: {
    bg: "bg-sky-500",
    light: "bg-sky-50",
    text: "text-sky-700",
    border: "border-sky-200",
    dot: "bg-sky-400",
  },
  emerald: {
    bg: "bg-emerald-500",
    light: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-400",
  },
  amber: {
    bg: "bg-amber-500",
    light: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  rose: {
    bg: "bg-rose-500",
    light: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-400",
  },
  teal: {
    bg: "bg-teal-500",
    light: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
    dot: "bg-teal-400",
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  Onboarding: "bg-purple-100 text-purple-700",
  "Hard Skill": "bg-blue-100 text-blue-700",
  "Soft Skill": "bg-green-100 text-green-700",
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDateShort(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

function buildCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const offset = (firstDay + 6) % 7; // Monday-start
  const cells: (number | null)[] = Array(offset).fill(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

const MONTHS_ID = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];
const DAYS_ID = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];

// ── Sub-components ─────────────────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: string;
  label: string;
  value: string | number;
  sub: string;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex gap-4 items-start hover:shadow-md transition-shadow">
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${accent}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">
          {label}
        </p>
        <p className="text-2xl font-bold text-slate-800 mt-0.5">{value}</p>
        <p className="text-xs text-slate-400 mt-0.5">{sub}</p>
      </div>
    </div>
  );
}

function ParticipantRow({
  p,
  onToggle,
  canEdit,
}: {
  p: Participant;
  onToggle: () => void;
  canEdit: boolean;
}) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-xs font-bold text-slate-600 shrink-0">
        {p.avatar}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-slate-700 truncate">{p.name}</p>
        <p className="text-xs text-slate-400">{p.division}</p>
      </div>
      {canEdit ? (
        <button
          onClick={onToggle}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all text-sm ${
            p.attended === true
              ? "bg-emerald-100 text-emerald-600 hover:bg-emerald-200"
              : p.attended === false
                ? "bg-red-100 text-red-500 hover:bg-red-200"
                : "bg-slate-100 text-slate-400 hover:bg-slate-200"
          }`}
          title={
            p.attended === true
              ? "Hadir"
              : p.attended === false
                ? "Tidak hadir"
                : "Belum tercatat"
          }
        >
          {p.attended === true ? "✓" : p.attended === false ? "✗" : "·"}
        </button>
      ) : (
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            p.attended === true
              ? "bg-emerald-50 text-emerald-600"
              : p.attended === false
                ? "bg-red-50 text-red-500"
                : "bg-slate-100 text-slate-400"
          }`}
        >
          {p.attended === true ? "Hadir" : p.attended === false ? "Absen" : "—"}
        </span>
      )}
    </div>
  );
}

// ── Training Card (List View) ──────────────────────────────────────────────
function TrainingCard({
  training,
  onClick,
}: {
  training: Training;
  onClick: () => void;
}) {
  const c = COLOR_MAP[training.color] ?? COLOR_MAP.violet;
  const s = STATUS_META[training.status];
  const attendedCount = training.participants.filter(
    (p) => p.attended === true,
  ).length;
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all p-5 flex gap-4 items-start group"
    >
      <div className={`w-1.5 self-stretch rounded-full ${c.bg} shrink-0`} />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap gap-2 items-center mb-2">
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[training.category] ?? "bg-slate-100 text-slate-600"}`}
          >
            {training.category}
          </span>
          <span
            className={`text-xs px-2 py-0.5 rounded-full font-medium ring-1 ${s.badge}`}
          >
            <span
              className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${s.dot}`}
            />
            {s.label}
          </span>
        </div>
        <h3 className="font-semibold text-slate-800 text-base leading-snug group-hover:text-violet-700 transition-colors">
          {training.title}
        </h3>
        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
          {training.description}
        </p>
        <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-500">
          <span>📅 {formatDateShort(training.date)}</span>
          <span>
            ⏰ {training.timeStart}–{training.timeEnd}
          </span>
          <span>📍 {training.location}</span>
          <span>🎓 {training.trainer}</span>
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-2xl font-bold text-slate-800">
          {training.participants.length}
        </p>
        <p className="text-xs text-slate-400">
          / {training.maxParticipants} peserta
        </p>
        {training.status === "completed" && (
          <p className="text-xs text-emerald-600 font-medium mt-1">
            {attendedCount} hadir
          </p>
        )}
      </div>
    </button>
  );
}

// ── Add Training Modal ─────────────────────────────────────────────────────
function AddTrainingModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (t: Training) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    category: "Hard Skill",
    date: "",
    timeStart: "",
    timeEnd: "",
    location: "",
    trainer: "",
    maxParticipants: 15,
    description: "",
    color: "violet",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title || !form.date || !form.timeStart || !form.timeEnd) return;
    onAdd({
      id: Date.now(),
      ...form,
      status: "upcoming",
      participants: [],
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4">
        <div className="bg-gradient-to-r from-violet-600 to-violet-500 px-6 py-5 flex items-center justify-between">
          <h2 className="text-white font-bold text-lg">Jadwal Training Baru</h2>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 max-h-[70vh] overflow-y-auto"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Judul Training *
            </label>
            <input
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              placeholder="cth. Workshop Figma untuk UI/UX"
              value={form.title}
              onChange={(e) =>
                setForm((f) => ({ ...f, title: e.target.value }))
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Kategori
              </label>
              <select
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                value={form.category}
                onChange={(e) =>
                  setForm((f) => ({ ...f, category: e.target.value }))
                }
              >
                <option>Hard Skill</option>
                <option>Soft Skill</option>
                <option>Onboarding</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Warna Label
              </label>
              <div className="flex gap-2 mt-1">
                {Object.entries(COLOR_MAP).map(([k, v]) => (
                  <button
                    type="button"
                    key={k}
                    onClick={() => setForm((f) => ({ ...f, color: k }))}
                    className={`w-6 h-6 rounded-full ${v.bg} ${form.color === k ? "ring-2 ring-offset-1 ring-slate-400" : ""}`}
                  />
                ))}
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Tanggal *
            </label>
            <input
              type="date"
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              value={form.date}
              onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Mulai *
              </label>
              <input
                type="time"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                value={form.timeStart}
                onChange={(e) =>
                  setForm((f) => ({ ...f, timeStart: e.target.value }))
                }
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Selesai *
              </label>
              <input
                type="time"
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                value={form.timeEnd}
                onChange={(e) =>
                  setForm((f) => ({ ...f, timeEnd: e.target.value }))
                }
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Lokasi
            </label>
            <input
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
              placeholder="cth. Ruang Rapat / Online – Google Meet"
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Trainer
              </label>
              <input
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                placeholder="Nama trainer"
                value={form.trainer}
                onChange={(e) =>
                  setForm((f) => ({ ...f, trainer: e.target.value }))
                }
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
                Kapasitas
              </label>
              <input
                type="number"
                min={1}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400"
                value={form.maxParticipants}
                onChange={(e) =>
                  setForm((f) => ({ ...f, maxParticipants: +e.target.value }))
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">
              Deskripsi
            </label>
            <textarea
              rows={2}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 resize-none"
              placeholder="Tujuan dan materi training..."
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors shadow-sm"
            >
              Simpan Jadwal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Detail Drawer ──────────────────────────────────────────────────────────
function TrainingDetail({
  training,
  onClose,
  onUpdateParticipant,
}: {
  training: Training;
  onClose: () => void;
  onUpdateParticipant: (trainingId: number, participantId: number) => void;
}) {
  const c = COLOR_MAP[training.color] ?? COLOR_MAP.violet;
  const s = STATUS_META[training.status];
  const total = training.participants.length;
  const attended = training.participants.filter(
    (p) => p.attended === true,
  ).length;
  const absent = training.participants.filter(
    (p) => p.attended === false,
  ).length;
  const canEdit =
    training.status === "completed" || training.status === "ongoing";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full sm:w-[420px] h-full sm:h-screen overflow-y-auto shadow-2xl animate-in slide-in-from-right-4 sm:slide-in-from-right-8">
        {/* Header */}
        <div className={`${c.bg} px-6 py-6 text-white relative`}>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-sm transition-colors"
          >
            ✕
          </button>
          <span
            className={`text-xs px-2 py-1 rounded-full bg-white/20 font-medium`}
          >
            {training.category}
          </span>
          <h2 className="text-xl font-bold mt-3 leading-snug">
            {training.title}
          </h2>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`text-xs px-2 py-0.5 rounded-full bg-white/20 font-medium ring-1 ring-white/30`}
            >
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full mr-1 bg-white`}
              />
              {s.label}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="p-6 space-y-5 border-b border-slate-100">
          <p className="text-sm text-slate-600 leading-relaxed">
            {training.description}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: "📅", label: "Tanggal", val: formatDate(training.date) },
              {
                icon: "⏰",
                label: "Waktu",
                val: `${training.timeStart} – ${training.timeEnd}`,
              },
              { icon: "📍", label: "Lokasi", val: training.location },
              { icon: "🎓", label: "Trainer", val: training.trainer },
            ].map((item) => (
              <div key={item.label} className={`${c.light} rounded-xl p-3`}>
                <p className="text-xs text-slate-500">
                  {item.icon} {item.label}
                </p>
                <p className={`text-sm font-semibold ${c.text} mt-0.5`}>
                  {item.val}
                </p>
              </div>
            ))}
          </div>

          {/* Capacity bar */}
          <div>
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Kapasitas</span>
              <span>
                {total} / {training.maxParticipants} peserta
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${c.bg} rounded-full transition-all`}
                style={{
                  width: `${Math.min(100, (total / training.maxParticipants) * 100)}%`,
                }}
              />
            </div>
          </div>
        </div>

        {/* Attendance summary (only for completed) */}
        {training.status === "completed" && (
          <div className="px-6 py-4 border-b border-slate-100">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">
              Rekap Kehadiran
            </p>
            <div className="flex gap-3">
              <div className="flex-1 bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-emerald-600">
                  {attended}
                </p>
                <p className="text-xs text-emerald-500">Hadir</p>
              </div>
              <div className="flex-1 bg-red-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-red-500">{absent}</p>
                <p className="text-xs text-red-400">Absen</p>
              </div>
              <div className="flex-1 bg-slate-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-slate-600">
                  {total - attended - absent}
                </p>
                <p className="text-xs text-slate-400">Belum</p>
              </div>
            </div>
          </div>
        )}

        {/* Participants */}
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Daftar Peserta
            </p>
            {canEdit && (
              <p className="text-xs text-slate-400">
                Ketuk ikon untuk ubah status
              </p>
            )}
          </div>
          {training.participants.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">
              Belum ada peserta terdaftar.
            </p>
          ) : (
            training.participants.map((p) => (
              <ParticipantRow
                key={p.id}
                p={p}
                canEdit={canEdit}
                onToggle={() => onUpdateParticipant(training.id, p.id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ── Calendar View ──────────────────────────────────────────────────────────
function CalendarView({
  trainings,
  onSelect,
}: {
  trainings: Training[];
  onSelect: (t: Training) => void;
}) {
  const today = new Date();
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const cells = buildCalendarDays(viewYear, viewMonth);

  function prev() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  }
  function next() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  }

  function trainingsOnDay(day: number) {
    const key = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return trainings.filter((t) => t.date === key);
  }

  const isToday = (day: number) =>
    today.getFullYear() === viewYear &&
    today.getMonth() === viewMonth &&
    today.getDate() === day;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Month nav */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
        <button
          onClick={prev}
          className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
        >
          ‹
        </button>
        <h3 className="font-semibold text-slate-800">
          {MONTHS_ID[viewMonth]} {viewYear}
        </h3>
        <button
          onClick={next}
          className="w-8 h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
        >
          ›
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 border-b border-slate-50">
        {DAYS_ID.map((d) => (
          <div
            key={d}
            className="py-2 text-center text-xs font-semibold text-slate-400 uppercase tracking-wide"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Cells */}
      <div className="grid grid-cols-7">
        {cells.map((day, i) => {
          if (!day)
            return (
              <div
                key={i}
                className="min-h-[72px] border-b border-r border-slate-50 bg-slate-50/30"
              />
            );
          const dayTrainings = trainingsOnDay(day);
          return (
            <div
              key={i}
              className={`min-h-[72px] border-b border-r border-slate-50 p-1 ${isToday(day) ? "bg-violet-50" : "hover:bg-slate-50"} transition-colors`}
            >
              <p
                className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center mx-auto mb-1 ${
                  isToday(day) ? "bg-violet-600 text-white" : "text-slate-600"
                }`}
              >
                {day}
              </p>
              <div className="space-y-0.5">
                {dayTrainings.slice(0, 2).map((t) => {
                  const c = COLOR_MAP[t.color] ?? COLOR_MAP.violet;
                  return (
                    <button
                      key={t.id}
                      onClick={() => onSelect(t)}
                      className={`w-full text-left px-1.5 py-0.5 rounded text-[10px] font-medium ${c.bg} text-white truncate hover:opacity-90 transition-opacity`}
                    >
                      {t.timeStart} {t.title}
                    </button>
                  );
                })}
                {dayTrainings.length > 2 && (
                  <p className="text-[9px] text-slate-400 text-center">
                    +{dayTrainings.length - 2} lagi
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────
export default function TrainingSchedulerPage() {
  const [trainings, setTrainings] = useState<Training[]>(MOCK_TRAININGS);
  const [view, setView] = useState<ViewMode>("list");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Training | null>(null);
  const [showAdd, setShowAdd] = useState(false);

  const categories = [
    "all",
    ...Array.from(new Set(MOCK_TRAININGS.map((t) => t.category))),
  ];

  const filtered = trainings.filter((t) => {
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (filterCategory !== "all" && t.category !== filterCategory) return false;
    if (
      search &&
      !t.title.toLowerCase().includes(search.toLowerCase()) &&
      !t.trainer.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  function handleAdd(t: Training) {
    setTrainings((prev) => [t, ...prev]);
  }

  function handleToggleParticipant(trainingId: number, participantId: number) {
    setTrainings((prev) =>
      prev.map((t) => {
        if (t.id !== trainingId) return t;
        return {
          ...t,
          participants: t.participants.map((p) => {
            if (p.id !== participantId) return p;
            const next =
              p.attended === null ? true : p.attended === true ? false : null;
            return { ...p, attended: next };
          }),
        };
      }),
    );
    // keep detail in sync
    if (selected?.id === trainingId) {
      setSelected((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          participants: prev.participants.map((p) => {
            if (p.id !== participantId) return p;
            const next =
              p.attended === null ? true : p.attended === true ? false : null;
            return { ...p, attended: next };
          }),
        };
      });
    }
  }

  const statUpcoming = trainings.filter((t) => t.status === "upcoming").length;
  const statCompleted = trainings.filter(
    (t) => t.status === "completed",
  ).length;
  const statOngoing = trainings.filter((t) => t.status === "ongoing").length;
  const totalPeserta = trainings.reduce((a, t) => a + t.participants.length, 0);

  return (
    <div className="min-h-screen bg-slate-50 font-sans">

      <main className="px-4 sm:px-6 py-6 space-y-6">
        {/* ── Page Title ── */}
        <div className="flex items-center justify-between">
          <div>

          <h1 className="text-2xl font-bold text-slate-800">Jadwal Training</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Kelola sesi pelatihan dan daftar hadir intern KodingYuk.
          </p>
          </div>

            <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex bg-slate-100 rounded-lg p-0.5">
              {(["list", "calendar"] as ViewMode[]).map((v) => (
                <button
                  key={v}
                  onClick={() => setView(v)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${view === v ? "bg-white text-slate-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {v === "list" ? "📋 List" : "📅 Kalender"}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-violet-600 text-white text-xs font-semibold rounded-lg hover:bg-violet-700 transition-colors shadow-sm"
            >
              <span className="text-base leading-none">+</span>
              <span className="hidden sm:inline">Jadwal Baru</span>
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            icon="📅"
            label="Akan Datang"
            value={statUpcoming}
            sub="sesi terjadwal"
            accent="bg-violet-100"
          />
          <StatCard
            icon="⚡"
            label="Berlangsung"
            value={statOngoing}
            sub="sesi aktif"
            accent="bg-emerald-100"
          />
          <StatCard
            icon="✅"
            label="Selesai"
            value={statCompleted}
            sub="sesi terlaksana"
            accent="bg-sky-100"
          />
          <StatCard
            icon="👥"
            label="Total Peserta"
            value={totalPeserta}
            sub="terdaftar keseluruhan"
            accent="bg-amber-100"
          />
        </div>

        {/* ── Filters ── */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              🔍
            </span>
            <input
              className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-400 bg-white"
              placeholder="Cari judul training atau trainer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {/* Status */}
          <div className="flex gap-1.5 bg-white border border-slate-200 rounded-xl p-1 overflow-x-auto">
            {(
              [
                "all",
                "upcoming",
                "ongoing",
                "completed",
                "cancelled",
              ] as FilterStatus[]
            ).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${filterStatus === s ? "bg-violet-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-100"}`}
              >
                {s === "all" ? "Semua" : STATUS_META[s].label}
              </button>
            ))}
          </div>
          {/* Category */}
          <select
            className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-600 bg-white focus:outline-none focus:ring-2 focus:ring-violet-400 cursor-pointer"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "Semua Kategori" : c}
              </option>
            ))}
          </select>
        </div>

        {/* ── Content ── */}
        {view === "calendar" ? (
          <CalendarView trainings={filtered} onSelect={setSelected} />
        ) : (
          <div className="space-y-3">
            {filtered.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-12 text-center">
                <p className="text-4xl mb-3">🗓️</p>
                <p className="text-slate-500 font-medium">
                  Tidak ada training yang sesuai filter.
                </p>
                <p className="text-sm text-slate-400 mt-1">
                  Coba ubah filter atau tambah jadwal baru.
                </p>
              </div>
            ) : (
              filtered.map((t) => (
                <TrainingCard
                  key={t.id}
                  training={t}
                  onClick={() => setSelected(t)}
                />
              ))
            )}
          </div>
        )}
      </main>

      {/* ── Detail Drawer ── */}
      {selected && (
        <TrainingDetail
          training={selected}
          onClose={() => setSelected(null)}
          onUpdateParticipant={handleToggleParticipant}
        />
      )}

      {/* ── Add Modal ── */}
      {showAdd && (
        <AddTrainingModal onClose={() => setShowAdd(false)} onAdd={handleAdd} />
      )}
    </div>
  );
}
