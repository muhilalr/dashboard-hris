import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { authOptions, getDashboardSections } from "@/lib/auth";
import { SignOutButton } from "@/app/dashboard/sign-out-button";
import { ROLE_LABELS } from "@/lib/roles";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const sections = getDashboardSections(session.user.role);

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="rounded-[2rem] bg-slate-950 p-8 text-white shadow-[0_24px_80px_rgba(15,23,42,0.25)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-3">
              <p className="text-sm uppercase tracking-[0.3em] text-sky-200">
                Dashboard HRIS
              </p>
              <h1 className="text-4xl font-semibold">{session.user.name}</h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-300">
                Anda masuk sebagai {ROLE_LABELS[session.user.role]} dengan metode{" "}
                {session.user.authMethod === "google"
                  ? "Google SSO"
                  : "Odoo Credentials"}
                .
              </p>
            </div>
            <SignOutButton />
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Role</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {session.user.roleLabel}
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Divisi</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {session.user.department ?? "Belum terset"}
            </p>
          </div>
          <div className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">Jabatan</p>
            <p className="mt-2 text-2xl font-semibold text-slate-950">
              {session.user.jobTitle ?? "Belum terset"}
            </p>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-3">
          {sections.map((section) => (
            <article
              key={section.href}
              className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm"
            >
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
                {section.allowed ? "Tersedia" : "Dibatasi"}
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-slate-950">
                {section.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {section.description}
              </p>
              <div className="mt-6">
                {section.allowed ? (
                  <Link
                    href={section.href}
                    className="inline-flex rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                  >
                    Buka area
                  </Link>
                ) : (
                  <span className="inline-flex rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-400">
                    Butuh role lebih tinggi
                  </span>
                )}
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-[1.75rem] border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
            Hak Akses Aktif
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            {session.user.permissions.map((permission) => (
              <span
                key={permission}
                className="rounded-full bg-sky-50 px-4 py-2 text-sm font-medium text-sky-700"
              >
                {permission}
              </span>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
