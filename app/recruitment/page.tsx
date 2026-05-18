"use client";

import { useState, useMemo, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

type Stage =
  | "Baru Masuk"
  | "Screening CV"
  | "Interview HR"
  | "Interview User"
  | "Offering"
  | "Diterima"
  | "Ditolak";

type Position =
  | "Frontend Dev Intern"
  | "Backend Dev Intern"
  | "UI/UX Designer Intern"
  | "Content Creator Intern"
  | "Social Media Intern"
  | "Finance Admin Intern"
  | "HR Recruitment Intern"
  | "QA Engineer Intern"
  | "Graphic Designer Intern"
  | "Marketing Analyst Intern";

type Division =
  | "Tech"
  | "Creative"
  | "Marketing"
  | "Finance"
  | "HR"
  | "Operations";

type Source =
  | "LinkedIn"
  | "Jobstreet"
  | "Referral"
  | "Instagram"
  | "Website"
  | "Campus";

interface Applicant {
  id: string;
  name: string;
  avatar: string;
  position: Position;
  division: Division;
  stage: Stage;
  source: Source;
  gpa?: string;
  university: string;
  major: string;
  appliedAt: string;
  lastUpdated: string;
  tags: string[];
  rating: number; // 1–5
  notes?: string;
  phone: string;
  email: string;
  interviewDate?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const APPLICANTS: Applicant[] = [
  {
    id: "AP-001",
    name: "Rizky Aditya",
    avatar: "RA",
    position: "Frontend Dev Intern",
    division: "Tech",
    stage: "Baru Masuk",
    source: "LinkedIn",
    gpa: "3.72",
    university: "Universitas Indonesia",
    major: "Ilmu Komputer",
    appliedAt: "2025-05-16",
    lastUpdated: "2025-05-16",
    tags: ["React", "TypeScript"],
    rating: 4,
    phone: "0812-xxxx-1234",
    email: "rizky@email.com",
  },
  {
    id: "AP-002",
    name: "Salma Khairunnisa",
    avatar: "SK",
    position: "UI/UX Designer Intern",
    division: "Creative",
    stage: "Baru Masuk",
    source: "Instagram",
    gpa: "3.85",
    university: "Universitas Telkom",
    major: "Desain Komunikasi Visual",
    appliedAt: "2025-05-15",
    lastUpdated: "2025-05-15",
    tags: ["Figma", "Prototyping"],
    rating: 5,
    phone: "0813-xxxx-2345",
    email: "salma@email.com",
  },
  {
    id: "AP-003",
    name: "Teguh Prasetyo",
    avatar: "TP",
    position: "Backend Dev Intern",
    division: "Tech",
    stage: "Baru Masuk",
    source: "Jobstreet",
    gpa: "3.51",
    university: "ITS Surabaya",
    major: "Teknik Informatika",
    appliedAt: "2025-05-14",
    lastUpdated: "2025-05-14",
    tags: ["Node.js", "PostgreSQL"],
    rating: 3,
    phone: "0814-xxxx-3456",
    email: "teguh@email.com",
  },
  {
    id: "AP-004",
    name: "Dina Maharani",
    avatar: "DM",
    position: "Content Creator Intern",
    division: "Marketing",
    stage: "Screening CV",
    source: "Referral",
    gpa: "3.60",
    university: "Universitas Padjadjaran",
    major: "Ilmu Komunikasi",
    appliedAt: "2025-05-12",
    lastUpdated: "2025-05-16",
    tags: ["Copywriting", "SEO"],
    rating: 4,
    phone: "0815-xxxx-4567",
    email: "dina@email.com",
    notes: "Portfolio konten sangat menarik",
  },
  {
    id: "AP-005",
    name: "Fadhil Ramadhan",
    avatar: "FR",
    position: "QA Engineer Intern",
    division: "Tech",
    stage: "Screening CV",
    source: "Campus",
    gpa: "3.44",
    university: "Universitas Brawijaya",
    major: "Sistem Informasi",
    appliedAt: "2025-05-11",
    lastUpdated: "2025-05-15",
    tags: ["Testing", "Selenium"],
    rating: 3,
    phone: "0816-xxxx-5678",
    email: "fadhil@email.com",
  },
  {
    id: "AP-006",
    name: "Hana Pertiwi",
    avatar: "HP",
    position: "HR Recruitment Intern",
    division: "HR",
    stage: "Screening CV",
    source: "LinkedIn",
    gpa: "3.78",
    university: "Universitas Gadjah Mada",
    major: "Psikologi",
    appliedAt: "2025-05-10",
    lastUpdated: "2025-05-14",
    tags: ["Recruitment", "Assessment"],
    rating: 4,
    phone: "0817-xxxx-6789",
    email: "hana@email.com",
  },
  {
    id: "AP-007",
    name: "Ilham Zulkifli",
    avatar: "IZ",
    position: "Social Media Intern",
    division: "Marketing",
    stage: "Interview HR",
    source: "Instagram",
    gpa: "3.30",
    university: "Universitas Diponegoro",
    major: "Ilmu Komunikasi",
    appliedAt: "2025-05-08",
    lastUpdated: "2025-05-16",
    tags: ["Instagram", "TikTok", "Canva"],
    rating: 4,
    phone: "0818-xxxx-7890",
    email: "ilham@email.com",
    interviewDate: "2025-05-19",
  },
  {
    id: "AP-008",
    name: "Jasmine Aulia",
    avatar: "JA",
    position: "Graphic Designer Intern",
    division: "Creative",
    stage: "Interview HR",
    source: "Website",
    gpa: "3.90",
    university: "Institut Teknologi Bandung",
    major: "Desain Produk",
    appliedAt: "2025-05-07",
    lastUpdated: "2025-05-15",
    tags: ["Illustrator", "Photoshop", "Figma"],
    rating: 5,
    phone: "0819-xxxx-8901",
    email: "jasmine@email.com",
    interviewDate: "2025-05-20",
    notes: "Portfolio sangat kuat, rekomendasi prioritas",
  },
  {
    id: "AP-009",
    name: "Kevin Santoso",
    avatar: "KV",
    position: "Finance Admin Intern",
    division: "Finance",
    stage: "Interview HR",
    source: "Jobstreet",
    gpa: "3.65",
    university: "Universitas Indonesia",
    major: "Akuntansi",
    appliedAt: "2025-05-06",
    lastUpdated: "2025-05-14",
    tags: ["Excel", "SAP", "Akuntansi"],
    rating: 3,
    phone: "0820-xxxx-9012",
    email: "kevin@email.com",
    interviewDate: "2025-05-18",
  },
  {
    id: "AP-010",
    name: "Luthfi Hamdani",
    avatar: "LH",
    position: "Frontend Dev Intern",
    division: "Tech",
    stage: "Interview User",
    source: "Referral",
    gpa: "3.81",
    university: "Universitas Bina Nusantara",
    major: "Teknik Informatika",
    appliedAt: "2025-05-03",
    lastUpdated: "2025-05-16",
    tags: ["Next.js", "React", "Tailwind"],
    rating: 5,
    phone: "0821-xxxx-0123",
    email: "luthfi@email.com",
    interviewDate: "2025-05-19",
    notes: "Referral dari Bima (Tech Intern)",
  },
  {
    id: "AP-011",
    name: "Mira Salsabila",
    avatar: "MS",
    position: "Marketing Analyst Intern",
    division: "Marketing",
    stage: "Interview User",
    source: "Campus",
    gpa: "3.70",
    university: "Universitas Airlangga",
    major: "Manajemen",
    appliedAt: "2025-05-02",
    lastUpdated: "2025-05-15",
    tags: ["Google Analytics", "Meta Ads"],
    rating: 4,
    phone: "0822-xxxx-1234",
    email: "mira@email.com",
    interviewDate: "2025-05-20",
  },
  {
    id: "AP-012",
    name: "Nanda Kurniawan",
    avatar: "NK",
    position: "Backend Dev Intern",
    division: "Tech",
    stage: "Offering",
    source: "LinkedIn",
    gpa: "3.88",
    university: "Universitas Telkom",
    major: "Teknik Informatika",
    appliedAt: "2025-04-28",
    lastUpdated: "2025-05-16",
    tags: ["Python", "Django", "Redis"],
    rating: 5,
    phone: "0823-xxxx-2345",
    email: "nanda@email.com",
    notes: "Offering sudah dikirim, menunggu konfirmasi",
  },
  {
    id: "AP-013",
    name: "Olivia Rahayu",
    avatar: "OR",
    position: "UI/UX Designer Intern",
    division: "Creative",
    stage: "Diterima",
    source: "Instagram",
    gpa: "3.92",
    university: "Institut Seni Indonesia",
    major: "Desain Komunikasi Visual",
    appliedAt: "2025-04-25",
    lastUpdated: "2025-05-14",
    tags: ["Figma", "After Effects"],
    rating: 5,
    phone: "0824-xxxx-3456",
    email: "olivia@email.com",
    notes: "Mulai onboarding 2 Juni 2025",
  },
  {
    id: "AP-014",
    name: "Pandu Aryawan",
    avatar: "PA",
    position: "QA Engineer Intern",
    division: "Tech",
    stage: "Ditolak",
    source: "Jobstreet",
    gpa: "3.10",
    university: "Universitas Mercu Buana",
    major: "Teknik Elektro",
    appliedAt: "2025-05-05",
    lastUpdated: "2025-05-13",
    tags: ["Manual Testing"],
    rating: 2,
    phone: "0825-xxxx-4567",
    email: "pandu@email.com",
    notes: "Kurang pengalaman di bidang QA",
  },
  {
    id: "AP-015",
    name: "Qori Indah",
    avatar: "QI",
    position: "Content Creator Intern",
    division: "Marketing",
    stage: "Ditolak",
    source: "Website",
    gpa: "3.25",
    university: "Universitas Sebelas Maret",
    major: "Sastra Indonesia",
    appliedAt: "2025-05-04",
    lastUpdated: "2025-05-12",
    tags: ["Writing"],
    rating: 2,
    phone: "0826-xxxx-5678",
    email: "qori@email.com",
  },
];

// ─── Stage Config ─────────────────────────────────────────────────────────────

const STAGES: Stage[] = [
  "Baru Masuk",
  "Screening CV",
  "Interview HR",
  "Interview User",
  "Offering",
  "Diterima",
  "Ditolak",
];

const STAGE_CONFIG: Record<
  Stage,
  {
    color: string;
    bg: string;
    border: string;
    dot: string;
    icon: string;
    accent: string;
    headerBg: string;
  }
> = {
  "Baru Masuk": {
    color: "text-slate-700",
    bg: "bg-slate-50",
    border: "border-slate-200",
    dot: "bg-slate-400",
    icon: "📥",
    accent: "#94a3b8",
    headerBg: "bg-slate-100",
  },
  "Screening CV": {
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-500",
    icon: "📋",
    accent: "#3b82f6",
    headerBg: "bg-blue-100",
  },
  "Interview HR": {
    color: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    dot: "bg-violet-500",
    icon: "🎙️",
    accent: "#8b5cf6",
    headerBg: "bg-violet-100",
  },
  "Interview User": {
    color: "text-orange-700",
    bg: "bg-orange-50",
    border: "border-orange-200",
    dot: "bg-orange-500",
    icon: "👥",
    accent: "#f97316",
    headerBg: "bg-orange-100",
  },
  Offering: {
    color: "text-amber-700",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-500",
    icon: "📨",
    accent: "#f59e0b",
    headerBg: "bg-amber-100",
  },
  Diterima: {
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
    icon: "✅",
    accent: "#10b981",
    headerBg: "bg-emerald-100",
  },
  Ditolak: {
    color: "text-red-700",
    bg: "bg-red-50",
    border: "border-red-200",
    dot: "bg-red-500",
    icon: "❌",
    accent: "#ef4444",
    headerBg: "bg-red-100",
  },
};

const DIVISION_CONFIG: Record<
  Division,
  { bg: string; text: string; light: string }
> = {
  Tech: {
    bg: "bg-blue-500",
    text: "text-white",
    light: "bg-blue-100 text-blue-800",
  },
  Creative: {
    bg: "bg-pink-500",
    text: "text-white",
    light: "bg-pink-100 text-pink-800",
  },
  Marketing: {
    bg: "bg-orange-500",
    text: "text-white",
    light: "bg-orange-100 text-orange-800",
  },
  Finance: {
    bg: "bg-green-600",
    text: "text-white",
    light: "bg-green-100 text-green-800",
  },
  HR: {
    bg: "bg-purple-500",
    text: "text-white",
    light: "bg-purple-100 text-purple-800",
  },
  Operations: {
    bg: "bg-teal-500",
    text: "text-white",
    light: "bg-teal-100 text-teal-800",
  },
};

const SOURCE_CONFIG: Record<Source, { icon: string; color: string }> = {
  LinkedIn: { icon: "in", color: "bg-blue-600 text-white" },
  Jobstreet: { icon: "JS", color: "bg-orange-500 text-white" },
  Referral: { icon: "🤝", color: "bg-emerald-500 text-white" },
  Instagram: { icon: "IG", color: "bg-pink-500 text-white" },
  Website: { icon: "🌐", color: "bg-slate-600 text-white" },
  Campus: { icon: "🎓", color: "bg-indigo-500 text-white" },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
  });
}

function daysSince(iso: string) {
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={`w-3 h-3 ${i <= rating ? "text-amber-400" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function Avatar({
  initials,
  division,
}: {
  initials: string;
  division: Division;
}) {
  const dc = DIVISION_CONFIG[division];
  return (
    <div
      className={`w-9 h-9 rounded-xl ${dc.bg} ${dc.text} flex items-center justify-center text-xs font-bold shrink-0`}
    >
      {initials}
    </div>
  );
}

// ─── Applicant Card ───────────────────────────────────────────────────────────

function ApplicantCard({
  ap,
  onClick,
  onMove,
}: {
  ap: Applicant;
  onClick: () => void;
  onMove: (id: string, dir: "forward" | "back") => void;
}) {
  const stageIdx = STAGES.indexOf(ap.stage);
  const canForward = stageIdx < STAGES.length - 2; // can't go beyond Diterima via forward from Ditolak
  const canBack = stageIdx > 0;
  const age = daysSince(ap.appliedAt);

  return (
    <div
      onClick={onClick}
      className="group bg-white rounded-2xl border border-slate-200 active:scale-[0.99] hover:border-indigo-300 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden"
    >
      {/* Top accent bar */}
      <div
        className="h-0.5 w-full"
        style={{ background: STAGE_CONFIG[ap.stage].accent }}
      />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start gap-2.5">
          <Avatar initials={ap.avatar} division={ap.division} />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-800 truncate group-hover:text-indigo-700 transition-colors leading-tight">
              {ap.name}
            </p>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {ap.position}
            </p>
          </div>
          {/* Source badge */}
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0 ${SOURCE_CONFIG[ap.source].color}`}
          >
            {SOURCE_CONFIG[ap.source].icon}
          </span>
        </div>

        {/* University */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-slate-400">🎓</span>
          <p className="text-xs text-slate-500 truncate">{ap.university}</p>
          {ap.gpa && (
            <span className="text-[10px] bg-slate-100 text-slate-600 font-semibold px-1.5 py-0.5 rounded ml-auto shrink-0">
              GPA {ap.gpa}
            </span>
          )}
        </div>

        {/* Tags */}
        {ap.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {ap.tags.slice(0, 3).map((tag) => (
              <span
                key={tag}
                className="text-[10px] bg-indigo-50 text-indigo-600 border border-indigo-100 px-1.5 py-0.5 rounded-md font-medium"
              >
                {tag}
              </span>
            ))}
            {ap.tags.length > 3 && (
              <span className="text-[10px] text-slate-400">
                +{ap.tags.length - 3}
              </span>
            )}
          </div>
        )}

        {/* Interview date */}
        {ap.interviewDate && (
          <div className="flex items-center gap-1.5 bg-violet-50 border border-violet-200 rounded-lg px-2.5 py-1.5">
            <svg
              className="w-3 h-3 text-violet-500 shrink-0"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-[10px] text-violet-700 font-medium">
              Interview{" "}
              {new Date(ap.interviewDate).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
              })}
            </span>
          </div>
        )}

        {/* Notes snippet */}
        {ap.notes && (
          <p className="text-[10px] text-slate-400 italic leading-relaxed line-clamp-2 border-l-2 border-slate-200 pl-2">
            {ap.notes}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
          <StarRating rating={ap.rating} />
          <span
            className={`text-[10px] font-medium ${age > 14 ? "text-red-500" : age > 7 ? "text-amber-500" : "text-slate-400"}`}
          >
            {age === 0 ? "Hari ini" : `${age}h lalu`}
          </span>
        </div>

        {/* Move actions */}
        <div
          className="flex gap-1.5 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          {canBack && (
            <button
              onClick={() => onMove(ap.id, "back")}
              className="flex-1 text-[10px] border border-slate-200 text-slate-500 py-1.5 rounded-lg hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
            >
              ← Mundur
            </button>
          )}
          {canForward && (
            <button
              onClick={() => onMove(ap.id, "forward")}
              className="flex-1 text-[10px] bg-indigo-600 text-white py-1.5 rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1 font-medium"
            >
              Lanjut →
            </button>
          )}
          {stageIdx === STAGES.indexOf("Interview User") && (
            <button
              onClick={() => onMove(ap.id, "forward")}
              className="flex-1 text-[10px] bg-amber-500 text-white py-1.5 rounded-lg hover:bg-amber-600 transition-colors flex items-center justify-center gap-1 font-medium"
            >
              Offering →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Detail Drawer ────────────────────────────────────────────────────────────

function DetailDrawer({
  ap,
  onClose,
  onMove,
}: {
  ap: Applicant;
  onClose: () => void;
  onMove: (id: string, dir: "forward" | "back") => void;
}) {
  const sc = STAGE_CONFIG[ap.stage];
  const dc = DIVISION_CONFIG[ap.division];
  const stageIdx = STAGES.indexOf(ap.stage);

  return (
    <div className="fixed inset-0 z-50 flex">
      <div className="flex-1 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="w-full sm:max-w-md bg-white h-full flex flex-col shadow-2xl overflow-y-auto">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100">
          <div className="flex items-start justify-between mb-4">
            <span className="text-xs font-mono text-slate-400">{ap.id}</span>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
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
          <div className="flex items-center gap-3">
            <div
              className={`w-14 h-14 rounded-2xl ${dc.bg} ${dc.text} flex items-center justify-center text-lg font-bold`}
            >
              {ap.avatar}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">{ap.name}</h3>
              <p className="text-sm text-slate-500">{ap.position}</p>
              <div className="flex items-center gap-2 mt-1">
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${dc.light}`}
                >
                  {ap.division}
                </span>
                <span
                  className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${sc.bg} ${sc.color}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                  {ap.stage}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 p-4 sm:p-6 space-y-5 overflow-y-auto">
          {/* Contact */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
              Kontak
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                {ap.phone}
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-700">
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                {ap.email}
              </div>
            </div>
          </div>

          {/* Education */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
              Pendidikan
            </p>
            <div className="bg-slate-50 rounded-xl p-3 space-y-1">
              <p className="text-sm font-medium text-slate-800">
                {ap.university}
              </p>
              <p className="text-xs text-slate-500">{ap.major}</p>
              {ap.gpa && (
                <p className="text-xs text-emerald-600 font-semibold">
                  IPK: {ap.gpa}
                </p>
              )}
            </div>
          </div>

          {/* Skills */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
              Keahlian
            </p>
            <div className="flex flex-wrap gap-1.5">
              {ap.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs bg-indigo-50 border border-indigo-200 text-indigo-700 px-2.5 py-1 rounded-lg font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Rating */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
              Penilaian HR
            </p>
            <div className="flex items-center gap-3">
              <StarRating rating={ap.rating} />
              <span className="text-sm font-medium text-slate-700">
                {ap.rating}/5
              </span>
              <span className="text-xs text-slate-400">
                {ap.rating >= 4
                  ? "🔥 Rekomendasi Kuat"
                  : ap.rating >= 3
                    ? "👍 Potensial"
                    : "⚠️ Perlu Evaluasi"}
              </span>
            </div>
          </div>

          {/* Source */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
              Sumber Lamaran
            </p>
            <span
              className={`text-xs px-2.5 py-1 rounded-lg font-medium ${SOURCE_CONFIG[ap.source].color}`}
            >
              {ap.source}
            </span>
          </div>

          {/* Interview date */}
          {ap.interviewDate && (
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-3">
              <p className="text-xs text-violet-600 font-medium mb-0.5">
                📅 Jadwal Interview
              </p>
              <p className="text-sm text-violet-800 font-semibold">
                {new Date(ap.interviewDate).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          )}

          {/* Notes */}
          {ap.notes && (
            <div>
              <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
                Catatan
              </p>
              <p className="text-sm text-slate-700 bg-amber-50 border border-amber-200 rounded-xl p-3 leading-relaxed">
                {ap.notes}
              </p>
            </div>
          )}

          {/* Timeline */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
              Timeline
            </p>
            <div className="space-y-1 text-xs text-slate-500">
              <div className="flex justify-between">
                <span>Tanggal Melamar</span>
                <span className="font-medium text-slate-700">
                  {formatDate(ap.appliedAt)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Terakhir Diperbarui</span>
                <span className="font-medium text-slate-700">
                  {formatDate(ap.lastUpdated)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Lama dalam Pipeline</span>
                <span
                  className={`font-medium ${daysSince(ap.appliedAt) > 14 ? "text-red-600" : "text-slate-700"}`}
                >
                  {daysSince(ap.appliedAt)} hari
                </span>
              </div>
            </div>
          </div>

          {/* Stage progress */}
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">
              Progress Pipeline
            </p>
            <div className="flex gap-1">
              {STAGES.filter((s) => s !== "Ditolak").map((s, i) => {
                const idx = STAGES.indexOf(ap.stage);
                const thisIdx = STAGES.indexOf(s);
                const done = idx >= thisIdx && ap.stage !== "Ditolak";
                const active = s === ap.stage;
                return (
                  <div
                    key={s}
                    className={`flex-1 h-1.5 rounded-full transition-all
                    ${ap.stage === "Ditolak" ? "bg-red-200" : done ? "bg-indigo-500" : "bg-slate-100"}
                    ${active ? "ring-2 ring-indigo-300 ring-offset-1" : ""}`}
                  />
                );
              })}
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              {ap.stage === "Ditolak"
                ? "Tidak lolos seleksi"
                : ap.stage === "Diterima"
                  ? "Selesai — diterima!"
                  : `Tahap ${STAGES.indexOf(ap.stage) + 1} dari ${STAGES.length - 1}`}
            </p>
          </div>
        </div>

        {/* Actions */}
        {ap.stage !== "Diterima" && ap.stage !== "Ditolak" && (
          <div className="p-4 border-t border-slate-100 grid grid-cols-2 gap-2">
            <button
              onClick={() => {
                onMove(ap.id, "back");
                onClose();
              }}
              disabled={stageIdx === 0}
              className="text-xs border border-slate-200 text-slate-600 py-2.5 rounded-xl hover:bg-slate-50 transition-colors disabled:opacity-30 font-medium"
            >
              ← Mundurkan Stage
            </button>
            <button
              onClick={() => {
                onMove(ap.id, "forward");
                onClose();
              }}
              className="text-xs bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition-colors font-medium"
            >
              Majukan Stage →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Kanban Column ────────────────────────────────────────────────────────────

function KanbanColumn({
  stage,
  applicants,
  onCardClick,
  onMove,
  isHidden,
}: {
  stage: Stage;
  applicants: Applicant[];
  onCardClick: (ap: Applicant) => void;
  onMove: (id: string, dir: "forward" | "back") => void;
  isHidden: boolean;
}) {
  const cfg = STAGE_CONFIG[stage];
  if (isHidden) return null;

  return (
    <div
      className="
    kanban-column
    flex flex-col
    w-[92vw]
    sm:w-[340px]
    lg:w-[320px]
    shrink-0
    snap-start
  "
    >
      {/* Column header */}
      <div
        className={`rounded-2xl px-3 py-2.5 mb-3 flex items-center justify-between ${cfg.headerBg}`}
      >
        <div className="flex items-center gap-2">
          <span className="text-base">{cfg.icon}</span>
          <span className={`text-xs font-semibold ${cfg.color}`}>{stage}</span>
        </div>
        <span
          className={`text-xs font-bold w-5 h-5 rounded-full ${cfg.dot} text-white flex items-center justify-center`}
        >
          {applicants.length}
        </span>
      </div>

      {/* Cards */}
      <div className="flex-1 space-y-3">
        {applicants.map((ap) => (
          <ApplicantCard
            key={ap.id}
            ap={ap}
            onClick={() => onCardClick(ap)}
            onMove={onMove}
          />
        ))}
        {applicants.length === 0 && (
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center">
            <p className="text-xs text-slate-400">Tidak ada pelamar</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function RecruitmentPage() {
  const [applicants, setApplicants] = useState(APPLICANTS);
  const [selected, setSelected] = useState<Applicant | null>(null);
  const [search, setSearch] = useState("");
  const [divFilter, setDivFilter] = useState<Division | "Semua">("Semua");
  const [hiddenStages, setHiddenStages] = useState<Set<Stage>>(new Set());
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");

  const boardRef = useRef<HTMLDivElement>(null);

  function scrollBoard(direction: "left" | "right") {
    if (!boardRef.current) return;

    const container = boardRef.current;

    // Ambil seluruh elemen kolom yang sedang aktif/tidak di-hide
    const columns = Array.from(
      container.querySelectorAll(".kanban-column"),
    ) as HTMLElement[];
    if (columns.length === 0) return;

    // Tentukan jumlah target perpindahan stage (carousel step) berdasarkan screen size
    let perPage = 1; // Mobile
    if (window.innerWidth >= 1024)
      perPage = 3; // Desktop
    else if (window.innerWidth >= 640) perPage = 2; // Tablet

    // Ambil padding offset container (px-4 = 16px di mobile, sm:px-6 = 24px di tablet/desktop)
    const containerPadding = window.innerWidth >= 640 ? 24 : 16;

    // Cari kolom mana yang saat ini posisinya paling mendekati sisi kiri viewport
    let currentIndex = 0;
    let minDiff = Infinity;

    columns.forEach((col, index) => {
      const colScrollPos =
        container.scrollLeft +
        col.getBoundingClientRect().left -
        container.getBoundingClientRect().left -
        containerPadding;
      const diff = Math.abs(container.scrollLeft - colScrollPos);
      if (diff < minDiff) {
        minDiff = diff;
        currentIndex = index;
      }
    });

    // Hitung index target berikutnya (maju 3 langkah di desktop, 2 di tablet, 1 di mobile)
    let targetIndex =
      direction === "right" ? currentIndex + perPage : currentIndex - perPage;

    // Kunci rentang index agar tidak melebihi batas element kolom yang tersedia
    targetIndex = Math.max(0, Math.min(targetIndex, columns.length - 1));

    // Ambil posisi scroll absolut dari element target
    const targetCol = columns[targetIndex];
    const targetLeft =
      container.scrollLeft +
      targetCol.getBoundingClientRect().left -
      container.getBoundingClientRect().left -
      containerPadding;

    // Lakukan scroll smooth secara presisi ke target kolom baru
    container.scrollTo({
      left: targetLeft,
      behavior: "smooth",
    });
  }

  function handleMove(id: string, dir: "forward" | "back") {
    setApplicants((prev) =>
      prev.map((ap) => {
        if (ap.id !== id) return ap;
        const idx = STAGES.indexOf(ap.stage);
        const next = dir === "forward" ? STAGES[idx + 1] : STAGES[idx - 1];
        if (!next) return ap;
        return {
          ...ap,
          stage: next,
          lastUpdated: new Date().toISOString().split("T")[0],
        };
      }),
    );
    // Update selected if drawer is open
    setSelected((prev) => {
      if (!prev || prev.id !== id) return prev;
      const idx = STAGES.indexOf(prev.stage);
      const next = dir === "forward" ? STAGES[idx + 1] : STAGES[idx - 1];
      if (!next) return prev;
      return { ...prev, stage: next };
    });
  }

  const filtered = useMemo(() => {
    return applicants.filter((ap) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        ap.name.toLowerCase().includes(q) ||
        ap.position.toLowerCase().includes(q) ||
        ap.university.toLowerCase().includes(q);
      const matchDiv = divFilter === "Semua" || ap.division === divFilter;
      return matchSearch && matchDiv;
    });
  }, [applicants, search, divFilter]);

  const stats = useMemo(
    () => ({
      total: applicants.length,
      active: applicants.filter(
        (a) => a.stage !== "Diterima" && a.stage !== "Ditolak",
      ).length,
      diterima: applicants.filter((a) => a.stage === "Diterima").length,
      offering: applicants.filter((a) => a.stage === "Offering").length,
      convRate: Math.round(
        (applicants.filter((a) => a.stage === "Diterima").length /
          applicants.length) *
          100,
      ),
    }),
    [applicants],
  );

  function toggleStage(s: Stage) {
    setHiddenStages((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
  }

  const DIVISIONS: Division[] = [
    "Tech",
    "Creative",
    "Marketing",
    "Finance",
    "HR",
    "Operations",
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col overflow-hidden">
      {/* ── Top Header ── */}
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="px-4 sm:px-6 min-h-16 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 max-w-screen-2xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center">
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
                Recruitment Pipeline
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* View toggle */}
            <div className="flex bg-slate-100 border border-slate-200 rounded-lg p-0.5">
              <button
                onClick={() => setViewMode("kanban")}
                className={`text-xs px-3 py-1.5 rounded-md transition-all font-medium ${
                  viewMode === "kanban"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`text-xs px-3 py-1.5 rounded-md transition-all font-medium ${viewMode === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                List
              </button>
            </div>

            <button className="text-xs bg-emerald-500 hover:bg-emerald-400 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5">
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
              Tambah Pelamar
            </button>
          </div>
        </div>
      </header>

      {/* ── Sub-header: filters + stats ── */}
      <div className="border-b border-slate-200 bg-white">
        <div className="px-4 sm:px-6 py-4 max-w-screen-2xl mx-auto space-y-4">
          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
            {[
              {
                label: "Total Pelamar",
                value: stats.total,
                sub: "bulan ini",
                color: "text-slate-500",
              },
              {
                label: "Aktif di Pipeline",
                value: stats.active,
                sub: "sedang diproses",
                color: "text-blue-400",
              },
              {
                label: "Menunggu Offering",
                value: stats.offering,
                sub: "siap ditawari",
                color: "text-amber-400",
              },
              {
                label: "Diterima",
                value: stats.diterima,
                sub: "berhasil masuk",
                color: "text-emerald-400",
              },
              {
                label: "Conversion Rate",
                value: `${stats.convRate}%`,
                sub: "pelamar → diterima",
                color: "text-violet-400",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm"
              >
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
                <p className="text-[10px] text-slate-400">{s.sub}</p>
              </div>
            ))}
          </div>

          {/* Filters row */}
          <div className="flex flex-col xl:flex-row xl:items-center gap-3">
            {/* Search */}
            <div className="relative w-full xl:flex-1 xl:max-w-xs">
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
                placeholder="Cari nama, posisi, universitas..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-400"
              />
            </div>

            {/* Division filter */}
            <div className="flex gap-1.5 flex-wrap overflow-x-auto scrollbar-hide pb-1">
              {(["Semua", ...DIVISIONS] as (Division | "Semua")[]).map((d) => (
                <button
                  key={d}
                  onClick={() => setDivFilter(d)}
                  className={`text-xs px-3 py-1.5 rounded-lg border font-medium transition-all
                    ${
                      divFilter === d
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : "bg-white border-slate-200 text-slate-500 hover:text-slate-800 hover:border-slate-300"
                    }`}
                >
                  {d}
                </button>
              ))}
            </div>

            {/* Stage toggles */}
            <div className="flex items-center gap-1 flex-wrap xl:ml-auto">
              <span className="text-[10px] text-slate-400 mr-1">
                Tampilkan:
              </span>
              {STAGES.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleStage(s)}
                  title={s}
                  className={`text-base px-1 rounded transition-all ${hiddenStages.has(s) ? "opacity-20 grayscale" : "opacity-100"}`}
                >
                  {STAGE_CONFIG[s].icon}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Kanban Board ── */}
      {viewMode === "kanban" ? (
        <div className="relative mx-5 flex-1">
          {/* Left Button */}
          <button
            onClick={() => scrollBoard("left")}
            className="flex absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 z-20
  w-9 h-9 sm:w-10 sm:h-10 rounded-full
  bg-white/95 backdrop-blur border border-slate-200 shadow-lg
  items-center justify-center
  active:scale-95 transition"
          >
            <svg
              className="w-5 h-5 text-slate-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Right Button */}
          <button
            onClick={() => scrollBoard("right")}
            className="flex absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 z-20
  w-9 h-9 sm:w-10 sm:h-10 rounded-full
  bg-white/95 backdrop-blur border border-slate-200 shadow-lg
  items-center justify-center
  active:scale-95 transition"
          >
            <svg
              className="w-5 h-5 text-slate-700"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>

          {/* Scroll Area */}
          <div
            ref={boardRef}
            className="
    flex-1
    overflow-x-auto
    overflow-y-hidden
    px-6
    py-6
    scroll-smooth
    scrollbar-hide
    snap-x
    snap-mandatory
  "
          >
            <div className="flex gap-4 w-max">
              {STAGES.map((stage) => (
                <KanbanColumn
                  key={stage}
                  stage={stage}
                  applicants={filtered.filter((a) => a.stage === stage)}
                  onCardClick={setSelected}
                  onMove={handleMove}
                  isHidden={hiddenStages.has(stage)}
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        /* ── List View ── */
        <div className="flex-1 px-4 sm:px-6 py-4 sm:py-6 max-w-screen-2xl mx-auto w-full">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500 font-medium bg-slate-50">
                  <th className="text-left px-5 py-3">Pelamar</th>
                  <th className="text-left px-4 py-3">Posisi</th>
                  <th className="text-left px-4 py-3">Divisi</th>
                  <th className="text-left px-4 py-3">Stage</th>
                  <th className="text-left px-4 py-3">Sumber</th>
                  <th className="text-left px-4 py-3">Rating</th>
                  <th className="text-left px-4 py-3">Daftar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((ap) => {
                  const sc = STAGE_CONFIG[ap.stage];
                  const dc = DIVISION_CONFIG[ap.division];
                  return (
                    <tr
                      key={ap.id}
                      onClick={() => setSelected(ap)}
                      className="hover:bg-slate-50 cursor-pointer transition-colors group"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-8 h-8 rounded-xl ${dc.bg} ${dc.text} flex items-center justify-center text-xs font-bold`}
                          >
                            {ap.avatar}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 group-hover:text-emerald-400 transition-colors">
                              {ap.name}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {ap.university}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {ap.position}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md font-medium ${dc.light}`}
                        >
                          {ap.division}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium ${sc.bg} ${sc.color}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${sc.dot}`}
                          />
                          {ap.stage}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${SOURCE_CONFIG[ap.source].color}`}
                        >
                          {ap.source}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <StarRating rating={ap.rating} />
                      </td>
                      <td className="px-4 py-3 text-xs text-white/40">
                        {formatDate(ap.appliedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16 text-slate-400">
                <p className="text-4xl mb-3">🔍</p>
                <p className="text-sm">Tidak ada pelamar yang sesuai filter</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Detail Drawer ── */}
      {selected && (
        <DetailDrawer
          ap={selected}
          onClose={() => setSelected(null)}
          onMove={handleMove}
        />
      )}
    </div>
  );
}
