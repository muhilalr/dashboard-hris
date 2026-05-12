import Link from "next/link";

export default function ManagerDashboardPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="mx-auto max-w-4xl rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-700">
          Area Manager
        </p>
        <h1 className="mt-3 text-4xl font-semibold text-slate-950">
          Panel Manajemen Strategis
        </h1>
        <p className="mt-4 text-sm leading-7 text-slate-600">
          Halaman ini disiapkan untuk visibilitas lintas divisi, keputusan
          strategis, dan kontrol organisasi untuk C-Level atau co-founders.
        </p>
        <Link
          href="/dashboard"
          className="mt-8 inline-flex rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white"
        >
          Kembali ke dashboard
        </Link>
      </div>
    </main>
  );
}
