"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type {
  OdooRecruitmentApplicant,
  OdooRecruitmentBoard,
  OdooRecruitmentStage,
} from "@/lib/odoo";

type RecruitmentClientPageProps = {
  initialBoard: OdooRecruitmentBoard;
  initialError?: string;
};

const VIEW_MODE_STORAGE_KEY = "recruitment:viewMode";
const DIVISION_FILTER_STORAGE_KEY = "recruitment:divisionFilter";
const SELECTED_JOB_STORAGE_KEY = "recruitment:selectedJobId";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function daysSince(iso: string) {
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(iso).getTime()) / 86400000),
  );
}

function getStageTheme(index: number) {
  const themes = [
    {
      color: "text-slate-700",
      dot: "bg-slate-400",
      accent: "#94a3b8",
      headerBg: "bg-slate-100",
    },
    {
      color: "text-blue-700",
      dot: "bg-blue-500",
      accent: "#3b82f6",
      headerBg: "bg-blue-100",
    },
    {
      color: "text-violet-700",
      dot: "bg-violet-500",
      accent: "#8b5cf6",
      headerBg: "bg-violet-100",
    },
    {
      color: "text-orange-700",
      dot: "bg-orange-500",
      accent: "#f97316",
      headerBg: "bg-orange-100",
    },
    {
      color: "text-emerald-700",
      dot: "bg-emerald-500",
      accent: "#10b981",
      headerBg: "bg-emerald-100",
    },
    {
      color: "text-rose-700",
      dot: "bg-rose-500",
      accent: "#f43f5e",
      headerBg: "bg-rose-100",
    },
  ];

  return themes[index % themes.length];
}

function getDivisionTone(name: string) {
  const key = name.toLowerCase();

  if (key.includes("tech") || key.includes("it") || key.includes("develop")) {
    return "bg-blue-100 text-blue-700";
  }

  if (key.includes("market")) {
    return "bg-orange-100 text-orange-700";
  }

  if (key.includes("human") || key.includes("hr")) {
    return "bg-purple-100 text-purple-700";
  }

  if (key.includes("finance") || key.includes("account")) {
    return "bg-emerald-100 text-emerald-700";
  }

  if (key.includes("creative") || key.includes("design")) {
    return "bg-pink-100 text-pink-700";
  }

  return "bg-slate-100 text-slate-700";
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3].map((value) => (
        <svg
          key={value}
          className={`h-3 w-3 ${value <= rating ? "text-amber-400" : "text-slate-200"}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

type JobPositionSummary = {
  id: string;
  name: string;
  department: string;
  target: number;
  totalApplicants: number;
  newApplicants: number;
  hiredApplicants: number;
  applicants: OdooRecruitmentApplicant[];
};

function ApplicantCard({
  applicant,
  stageIndex,
  stageCount,
  onOpen,
  onMove,
  savingApplicantId,
}: {
  applicant: OdooRecruitmentApplicant;
  stageIndex: number;
  stageCount: number;
  onOpen: () => void;
  onMove: (direction: "back" | "forward") => void;
  savingApplicantId: string | null;
}) {
  const canBack = stageIndex > 0;
  const canForward = stageIndex < stageCount - 1;
  const age = daysSince(applicant.appliedAt);
  const tone = getDivisionTone(applicant.division);
  const isSaving = savingApplicantId === applicant.id;

  return (
    <div
      onClick={onOpen}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:border-emerald-300 hover:shadow-lg"
    >
      <div
        className="h-1 w-full"
        style={{ backgroundColor: getStageTheme(stageIndex).accent }}
      />
      <div className="space-y-3 p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
            {applicant.avatar}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-slate-900">
              {applicant.name}
            </p>
            <p className="truncate text-xs text-slate-500">
              {applicant.position}
            </p>
          </div>
          <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
            {applicant.source}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`rounded-md px-2 py-1 text-[10px] font-medium ${tone}`}
          >
            {applicant.division}
          </span>
          <span className="truncate text-[10px] text-slate-400">
            {applicant.major !== "Data belum tersedia"
              ? applicant.major
              : applicant.email}
          </span>
        </div>

        {applicant.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {applicant.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-100 pt-2">
          <StarRating rating={applicant.priority} />
          <span
            className={`text-[10px] font-medium ${age > 14 ? "text-red-500" : age > 7 ? "text-amber-500" : "text-slate-400"}`}
          >
            {age === 0 ? "Hari ini" : `${age} hari`}
          </span>
        </div>

        <div
          className="flex gap-2"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onMove("back")}
            disabled={!canBack || isSaving}
            className="flex-1 rounded-lg border border-slate-200 py-2 text-[11px] font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Mundur
          </button>
          <button
            type="button"
            onClick={() => onMove("forward")}
            disabled={!canForward || isSaving}
            className="flex-1 rounded-lg bg-emerald-500 py-2 text-[11px] font-medium text-white transition-colors hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isSaving ? "Menyimpan..." : "Lanjut"}
          </button>
        </div>
      </div>
    </div>
  );
}

function DetailDrawer({
  applicant,
  stages,
  onClose,
}: {
  applicant: OdooRecruitmentApplicant;
  stages: OdooRecruitmentStage[];
  onClose: () => void;
}) {
  const activeIndex = stages.findIndex(
    (stage) => stage.id === applicant.stageId,
  );

  return (
    <div className="fixed inset-0 z-50 flex">
      <button
        type="button"
        className="flex-1 bg-black/30"
        onClick={onClose}
        aria-label="Tutup detail"
      />
      <div className="flex h-full w-full max-w-md flex-col overflow-y-auto bg-white shadow-2xl">
        <div className="border-b border-slate-100 p-5">
          <div className="mb-4 flex items-start justify-between">
            <span className="font-mono text-xs text-slate-400">
              ODOO #{applicant.odooId}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100"
            >
              x
            </button>
          </div>
          <h3 className="text-lg font-bold text-slate-900">{applicant.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{applicant.position}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
              {applicant.stageName}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${getDivisionTone(applicant.division)}`}
            >
              {applicant.division}
            </span>
          </div>
        </div>

        <div className="flex-1 space-y-5 p-5">
          <section>
            <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">
              Kontak
            </p>
            <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
              <p>{applicant.phone}</p>
              <p>{applicant.email}</p>
            </div>
          </section>

          <section>
            <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">
              Data Pelamar
            </p>
            <div className="space-y-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
              <div className="flex justify-between gap-3">
                <span>Posisi</span>
                <span className="text-right font-medium">
                  {applicant.position}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Sumber</span>
                <span className="text-right font-medium">
                  {applicant.source}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Masuk</span>
                <span className="text-right font-medium">
                  {formatDate(applicant.appliedAt)}
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span>Update</span>
                <span className="text-right font-medium">
                  {formatDate(applicant.lastUpdated)}
                </span>
              </div>
            </div>
          </section>

          <section>
            <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">
              Profil Tambahan
            </p>
            <div className="rounded-xl bg-slate-50 p-3">
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex justify-between gap-3">
                  <span>Kategori</span>
                  <span className="text-right font-medium">
                    {applicant.university}
                  </span>
                </div>
                <div className="flex justify-between gap-3">
                  <span>Jenjang</span>
                  <span className="text-right font-medium">
                    {applicant.major}
                  </span>
                </div>
              </div>
              {applicant.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {applicant.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1 text-[10px] font-medium text-emerald-700"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {applicant.notes && (
            <section>
              <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">
                Catatan Odoo
              </p>
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-slate-700">
                {applicant.notes}
              </div>
            </section>
          )}

          <section>
            <p className="mb-2 text-xs uppercase tracking-wider text-slate-400">
              Progress Pipeline
            </p>
            <div className="flex gap-1">
              {stages.map((stage, index) => (
                <div
                  key={stage.id}
                  className={`h-2 flex-1 rounded-full ${
                    index <= activeIndex ? "bg-emerald-500" : "bg-slate-100"
                  }`}
                />
              ))}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Tahap {Math.max(activeIndex + 1, 1)} dari {stages.length || 1}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

function JobPositionCard({
  job,
  isActive,
  onSelectJob,
  onOpenApplicant,
}: {
  job: JobPositionSummary;
  isActive: boolean;
  onSelectJob: () => void;
  onOpenApplicant: (applicant: OdooRecruitmentApplicant) => void;
}) {
  const leadApplicant = job.applicants[0] ?? null;

  return (
    <button
      type="button"
      onClick={onSelectJob}
      className={`rounded-[28px] border bg-white p-6 text-left shadow-sm transition-all hover:shadow-lg ${
        isActive
          ? "border-emerald-400 ring-2 ring-emerald-100"
          : "border-slate-200 hover:border-emerald-300"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-2xl font-semibold text-slate-900">
            {job.name}
          </p>
          {leadApplicant && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpenApplicant(leadApplicant);
              }}
              className="mt-2 truncate text-left text-sm text-slate-500 transition-colors hover:text-emerald-600"
            >
              {leadApplicant.name}
            </button>
          )}
        </div>
        <div className="rounded-lg px-2 py-1 text-slate-400">...</div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-6">
        <div>
          <div className="inline-flex rounded-xl bg-violet-500 px-4 py-3 text-sm font-semibold text-white">
            {job.newApplicants} Lamaran Baru
          </div>
        </div>
        <div>
          <p className="text-2xl font-semibold text-violet-600">
            {job.target} Untuk Merekrut
          </p>
          <p className="mt-1 text-lg text-slate-600">
            {job.totalApplicants} Lamaran
          </p>
        </div>
      </div>

      {job.applicants.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {job.applicants.slice(0, 3).map((applicant) => (
            <button
              key={applicant.id}
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onOpenApplicant(applicant);
              }}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600 transition-colors hover:border-emerald-300 hover:text-emerald-700"
            >
              {applicant.name}
            </button>
          ))}
          {job.applicants.length > 3 && (
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">
              +{job.applicants.length - 3} lainnya
            </span>
          )}
        </div>
      )}
    </button>
  );
}

function KanbanColumn({
  stage,
  index,
  applicants,
  stageCount,
  onOpen,
  onMove,
  savingApplicantId,
}: {
  stage: OdooRecruitmentStage;
  index: number;
  applicants: OdooRecruitmentApplicant[];
  stageCount: number;
  onOpen: (applicant: OdooRecruitmentApplicant) => void;
  onMove: (
    applicant: OdooRecruitmentApplicant,
    direction: "back" | "forward",
  ) => void;
  savingApplicantId: string | null;
}) {
  const theme = getStageTheme(index);

  return (
    <div className="kanban-column flex w-[92vw] shrink-0 snap-start flex-col sm:w-[340px] lg:w-[320px]">
      <div
        className={`mb-3 flex items-center justify-between rounded-2xl px-3 py-2.5 ${theme.headerBg}`}
      >
        <div>
          <p className={`text-sm font-semibold ${theme.color}`}>{stage.name}</p>
          <p className="text-[10px] text-slate-400">Urutan {index + 1}</p>
        </div>
        <span
          className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white ${theme.dot}`}
        >
          {applicants.length}
        </span>
      </div>

      <div className="space-y-3">
        {applicants.map((applicant) => (
          <ApplicantCard
            key={applicant.id}
            applicant={applicant}
            stageIndex={index}
            stageCount={stageCount}
            onOpen={() => onOpen(applicant)}
            onMove={(direction) => onMove(applicant, direction)}
            savingApplicantId={savingApplicantId}
          />
        ))}

        {applicants.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center text-xs text-slate-400">
            Belum ada pelamar di tahap ini
          </div>
        )}
      </div>
    </div>
  );
}

export default function RecruitmentClientPage({
  initialBoard,
  initialError,
}: RecruitmentClientPageProps) {
  const [board, setBoard] = useState(initialBoard);
  const [search, setSearch] = useState("");
  const [divisionFilter, setDivisionFilter] = useState(() => {
    if (typeof window === "undefined") {
      return "Semua";
    }

    return localStorage.getItem(DIVISION_FILTER_STORAGE_KEY) || "Semua";
  });
  const [selectedJobId, setSelectedJobId] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    return localStorage.getItem(SELECTED_JOB_STORAGE_KEY);
  });
  const [selectedApplicant, setSelectedApplicant] =
    useState<OdooRecruitmentApplicant | null>(null);
  const [viewMode, setViewMode] = useState<"kanban" | "list">(() => {
    if (typeof window === "undefined") {
      return "kanban";
    }

    return localStorage.getItem(VIEW_MODE_STORAGE_KEY) === "list"
      ? "list"
      : "kanban";
  });
  const [savingApplicantId, setSavingApplicantId] = useState<string | null>(
    null,
  );
  const [errorMessage, setErrorMessage] = useState(initialError ?? "");
  const boardRef = useRef<HTMLDivElement>(null);

  const divisions = useMemo(
    () =>
      Array.from(new Set(board.jobs.map((item) => item.department))).sort(
        (left, right) => left.localeCompare(right),
      ),
    [board.jobs],
  );

  const filteredApplicants = useMemo(() => {
    const query = search.trim().toLowerCase();

    return board.applicants.filter((applicant) => {
      const matchDivision =
        divisionFilter === "Semua" || applicant.division === divisionFilter;
      const matchSearch =
        !query ||
        applicant.name.toLowerCase().includes(query) ||
        applicant.position.toLowerCase().includes(query) ||
        applicant.email.toLowerCase().includes(query) ||
        applicant.stageName.toLowerCase().includes(query);

      return matchDivision && matchSearch;
    });
  }, [board.applicants, divisionFilter, search]);

  const filteredJobs = useMemo<JobPositionSummary[]>(() => {
    const query = search.trim().toLowerCase();
    const applicantsByJobId = new Map<string, OdooRecruitmentApplicant[]>();

    filteredApplicants.forEach((applicant) => {
      const key = applicant.jobId;
      const currentApplicants = applicantsByJobId.get(key) ?? [];
      currentApplicants.push(applicant);
      applicantsByJobId.set(key, currentApplicants);
    });

    return board.jobs
      .filter(
        (job) =>
          divisionFilter === "Semua" || job.department === divisionFilter,
      )
      .filter((job) => {
        if (!query) {
          return true;
        }

        const jobApplicants = applicantsByJobId.get(job.id) ?? [];

        return (
          job.name.toLowerCase().includes(query) ||
          job.department.toLowerCase().includes(query) ||
          jobApplicants.some(
            (applicant) =>
              applicant.name.toLowerCase().includes(query) ||
              applicant.email.toLowerCase().includes(query),
          )
        );
      })
      .map((job) => {
        const jobApplicants = applicantsByJobId.get(job.id) ?? [];

        return {
          id: job.id,
          name: job.name,
          department: job.department,
          target: job.target,
          totalApplicants: jobApplicants.length || job.applications,
          newApplicants:
            jobApplicants.filter(
              (applicant) => daysSince(applicant.appliedAt) <= 7,
            ).length || job.newApplications,
          hiredApplicants: jobApplicants.filter(
            (applicant) => applicant.isHired,
          ).length,
          applicants: jobApplicants.sort((left, right) =>
            right.appliedAt.localeCompare(left.appliedAt),
          ),
        };
      })
      .sort((left, right) => left.name.localeCompare(right.name));
  }, [board.jobs, filteredApplicants, divisionFilter, search]);

  const selectedJob = useMemo(
    () => filteredJobs.find((job) => job.id === selectedJobId) ?? null,
    [filteredJobs, selectedJobId],
  );

  useEffect(() => {
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem(DIVISION_FILTER_STORAGE_KEY, divisionFilter);
  }, [divisionFilter]);

  useEffect(() => {
    if (selectedJobId) {
      localStorage.setItem(SELECTED_JOB_STORAGE_KEY, selectedJobId);
      return;
    }

    localStorage.removeItem(SELECTED_JOB_STORAGE_KEY);
  }, [selectedJobId]);

  useEffect(() => {
    if (
      selectedJobId &&
      !filteredJobs.some((job) => job.id === selectedJobId)
    ) {
      setSelectedJobId(null);
    }
  }, [filteredJobs, selectedJobId]);

  const stats = useMemo(() => {
    const hired = board.applicants.filter((item) => item.isHired).length;
    const rejected = board.applicants.filter((item) => item.isRejected).length;
    const active = board.applicants.length - hired - rejected;
    const averageAge =
      board.applicants.length === 0
        ? 0
        : Math.round(
            board.applicants.reduce(
              (total, item) => total + daysSince(item.appliedAt),
              0,
            ) / board.applicants.length,
          );

    return {
      totalApplicants: board.applicants.length,
      activeApplicants: active,
      hiredApplicants: hired,
      openJobs: board.jobs.filter((job) => job.target > 0).length,
      averageAge,
    };
  }, [board.applicants, board.jobs]);

  const stageIndexById = useMemo(
    () =>
      new Map(board.stages.map((stage, index) => [stage.id, index] as const)),
    [board.stages],
  );

  const isScrollingRef = useRef(false);

  function easeOutQuart(t: number) {
    return 1 - Math.pow(1 - t, 4);
  }

  function animateScroll(element: HTMLElement, to: number, duration: number) {
    if (isScrollingRef.current) return;

    isScrollingRef.current = true;

    const start = element.scrollLeft;
    const change = to - start;
    const startTime = performance.now();

    // disable snap sementara
    element.style.scrollSnapType = "none";

    function animate(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const eased = easeOutQuart(progress);

      element.scrollTo({
        left: start + change * eased,
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // aktifkan lagi snap
        element.style.scrollSnapType = "x proximity";

        isScrollingRef.current = false;
      }
    }

    requestAnimationFrame(animate);
  }

  function scrollBoard(direction: "left" | "right") {
    if (!boardRef.current) return;

    const container = boardRef.current;

    const firstColumn = container.querySelector(
      ".kanban-column",
    ) as HTMLElement | null;

    const columnWidth = firstColumn?.offsetWidth ?? 320;

    const gap = 16;

    // scroll 1 kolom aja biar lebih smooth
    const step = columnWidth + gap;

    const target =
      direction === "right"
        ? container.scrollLeft + step
        : container.scrollLeft - step;

    animateScroll(container, target, 650);
  }

  async function moveApplicant(
    applicant: OdooRecruitmentApplicant,
    direction: "back" | "forward",
  ) {
    const currentIndex = stageIndexById.get(applicant.stageId);

    if (currentIndex === undefined) {
      return;
    }

    const nextIndex =
      direction === "forward" ? currentIndex + 1 : currentIndex - 1;
    const nextStage = board.stages[nextIndex];

    if (!nextStage) {
      return;
    }

    setErrorMessage("");
    setSavingApplicantId(applicant.id);

    try {
      const response = await fetch("/api/recruitment", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          applicantId: applicant.odooId,
          stageId: nextStage.odooId,
        }),
      });

      const payload = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(payload.message || "Gagal update stage di Odoo.");
      }

      const updatedApplicant = {
        ...applicant,
        stageId: nextStage.id,
        stageName: nextStage.name,
        lastUpdated: new Date().toISOString().slice(0, 10),
        isHired: nextStage.hired,
        isRejected: /reject|refus|ditolak|gagal|declin|drop/i.test(
          nextStage.name,
        ),
      };

      setBoard((currentBoard) => ({
        ...currentBoard,
        applicants: currentBoard.applicants.map((item) =>
          item.id === applicant.id ? updatedApplicant : item,
        ),
      }));
      setSelectedApplicant((currentSelected) =>
        currentSelected?.id === applicant.id
          ? updatedApplicant
          : currentSelected,
      );
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "Gagal update stage di Odoo.",
      );
    } finally {
      setSavingApplicantId(null);
    }
  }

  return (
    <div className="flex min-h-screen flex-col overflow-hidden bg-slate-50 text-slate-900">

      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-screen-2xl space-y-4 px-4 py-4 sm:px-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[
              {
                label: "Total Pelamar",
                value: stats.totalApplicants,
                sub: "semua applicant Odoo",
                color: "text-slate-700",
              },
              {
                label: "Sedang Diproses",
                value: stats.activeApplicants,
                sub: "belum selesai",
                color: "text-blue-500",
              },
              {
                label: "Pelamar Diterima",
                value: stats.hiredApplicants,
                sub: "stage hired",
                color: "text-emerald-500",
              },
              {
                label: "Posisi Aktif",
                value: stats.openJobs,
                sub: "job recruitment",
                color: "text-violet-500",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
              >
                <p className={`text-2xl font-bold ${item.color}`}>
                  {item.value}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">{item.label}</p>
                <p className="text-[10px] text-slate-400">{item.sub}</p>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative w-full xl:max-w-sm">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari departemen, posisi, atau nama pelamar..."
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-800 placeholder-slate-400 focus:border-emerald-400 focus:outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 max-w-lg">
              {["Semua", ...divisions].map((division) => (
                <button
                  key={division}
                  type="button"
                  onClick={() => {
                    setDivisionFilter(division);
                    setSelectedJobId(null);
                  }}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                    divisionFilter === division
                      ? "border-emerald-500 bg-emerald-500 text-white"
                      : "border-slate-200 bg-white text-slate-500"
                  }`}
                >
                  {division}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === "kanban"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                Kanban
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  viewMode === "list"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-500"
                }`}
              >
                List
              </button>
            </div>

            <button
              type="button"
              className="rounded-lg bg-slate-200 px-4 py-2 text-xs font-medium text-slate-500"
              disabled
            >
              Tambah Pelamar via Odoo
            </button>
          </div>
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              {errorMessage}
            </div>
          )}
        </div>
      </div>

      {viewMode === "kanban" ? (
        <div className="mx-auto flex w-full max-w-screen-2xl flex-1 gap-6 px-4 py-6 sm:px-6">
          <div className="min-w-0 flex-1">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {selectedJob ? selectedJob.name : "Jabatan Kerja"}
                </p>
                <p className="text-sm text-slate-500">
                  {selectedJob
                    ? `Kanban pelamar untuk posisi ${selectedJob.name}`
                    : divisionFilter === "Semua"
                      ? `${filteredJobs.length} posisi aktif dari semua departemen`
                      : `${filteredJobs.length} posisi aktif di ${divisionFilter}`}
                </p>
              </div>
              {selectedJob && (
                <button
                  type="button"
                  onClick={() => setSelectedJobId(null)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50"
                >
                  Kembali ke Posisi
                </button>
              )}
            </div>

            {selectedJob ? (
              <div className="relative min-w-0">
                <button
                  type="button"
                  onClick={() => scrollBoard("left")}
                  className="absolute left-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 shadow-lg transition active:scale-95"
                >
                  {"<"}
                </button>
                <button
                  type="button"
                  onClick={() => scrollBoard("right")}
                  className="absolute right-2 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 shadow-lg transition active:scale-95"
                >
                  {">"}
                </button>

                <div
                  ref={boardRef}
                  className="
w-full
overflow-x-auto
overflow-y-hidden
px-6
py-2
overscroll-x-contain
snap-x
snap-proximity
"
                  style={{
                    WebkitOverflowScrolling: "touch",
                    willChange: "scroll-position",
                  }}
                >
                  <div className="flex w-max gap-4">
                    {board.stages.map((stage, index) => (
                      <KanbanColumn
                        key={stage.id}
                        stage={stage}
                        index={index}
                        applicants={selectedJob.applicants.filter(
                          (applicant) => applicant.stageId === stage.id,
                        )}
                        stageCount={board.stages.length}
                        onOpen={setSelectedApplicant}
                        onMove={moveApplicant}
                        savingApplicantId={savingApplicantId}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : filteredJobs.length > 0 ? (
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
                {filteredJobs.map((job) => (
                  <JobPositionCard
                    key={job.id}
                    job={job}
                    isActive={selectedJobId === job.id}
                    onSelectJob={() => setSelectedJobId(job.id)}
                    onOpenApplicant={setSelectedApplicant}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white p-10 text-center text-slate-400">
                {selectedJobId
                  ? "Posisi yang dipilih tidak cocok dengan filter saat ini."
                  : "Tidak ada posisi yang cocok dengan filter saat ini."}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="mx-auto w-full max-w-screen-2xl flex-1 px-4 py-6 sm:px-6">
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
            <table className="min-w-[960px] w-full">
              <thead>
                <tr className="bg-slate-50 text-left text-xs font-medium text-slate-500">
                  <th className="px-5 py-3">Pelamar</th>
                  <th className="px-4 py-3">Posisi</th>
                  <th className="px-4 py-3">Divisi</th>
                  <th className="px-4 py-3">Stage Odoo</th>
                  <th className="px-4 py-3">Sumber</th>
                  <th className="px-4 py-3">Rating</th>
                  <th className="px-4 py-3">Masuk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredApplicants.map((applicant) => (
                  <tr
                    key={applicant.id}
                    onClick={() => setSelectedApplicant(applicant)}
                    className="cursor-pointer transition-colors hover:bg-slate-50"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                          {applicant.avatar}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-900">
                            {applicant.name}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {applicant.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {applicant.position}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-md px-2 py-1 text-xs font-medium ${getDivisionTone(applicant.division)}`}
                      >
                        {applicant.division}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {applicant.stageName}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {applicant.source}
                    </td>
                    <td className="px-4 py-3">
                      <StarRating rating={applicant.priority} />
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {formatDate(applicant.appliedAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredApplicants.length === 0 && (
              <div className="py-16 text-center text-slate-400">
                Tidak ada pelamar yang cocok dengan filter saat ini.
              </div>
            )}
          </div>
        </div>
      )}

      {selectedApplicant && (
        <DetailDrawer
          applicant={selectedApplicant}
          stages={board.stages}
          onClose={() => setSelectedApplicant(null)}
        />
      )}
    </div>
  );
}
