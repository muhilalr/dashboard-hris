"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";

import { LOGIN_ERROR_COOKIE, getLoginErrorMessage } from "@/lib/auth-errors";

type LoginFormProps = {
  devRoleLoginEnabled: boolean;
  googleEnabled: boolean;
  initialError?: string;
  initialErrorCode?: string | null;
};

export function LoginForm({
  devRoleLoginEnabled,
  googleEnabled,
  initialError = "",
  initialErrorCode = null,
}: LoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);
  const [error, setError] = useState("");

  const derivedError = useMemo(() => {
    const key = searchParams.get("error");
    return key ? getLoginErrorMessage(key) : "";
  }, [searchParams]);

  useEffect(() => {
    if (!initialErrorCode) return;

    document.cookie = `${LOGIN_ERROR_COOKIE}=; Max-Age=0; Path=/; SameSite=Lax`;
  }, [initialErrorCode]);

  const handleCredentialsLogin = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const result = await signIn("odoo-credentials", {
      login,
      password,
      redirect: false,
      callbackUrl,
    });

    setSubmitting(false);

    if (result?.error) {
      setError(getLoginErrorMessage(result.error));
      return;
    }

    router.push(result?.url ?? callbackUrl);
    router.refresh();
  };

  const handleDevRoleLogin = async (role: "staff" | "head" | "manager") => {
    setError("");
    setSubmitting(true);

    const result = await signIn("dev-role", {
      role,
      redirect: false,
      callbackUrl,
    });

    setSubmitting(false);

    if (result?.error) {
      setError(getLoginErrorMessage(result.error));
      return;
    }

    router.push(result?.url ?? callbackUrl);
    router.refresh();
  };

  const handleGoogleLogin = async () => {
    setGoogleSubmitting(true);
    setError("");
    await signIn("google", { callbackUrl });
    setGoogleSubmitting(false);
  };

  return (
    <section className="flex items-center justify-center bg-slate-50m px-6 h-screen">
      <div className="w-full max-w-md rounded-[2rem] border border-slate-200 bg-white/90 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur">
        <div className="space-y-3">
          <Image
            src="/logo/logo_kodingyuk.png"
            alt="KodingYuk"
            width={96}
            height={96}
            className="mx-auto w-24 object-contain"
          />
          <h2 className="text-3xl text-center font-semibold text-slate-950">
            Dashboard HRIS
          </h2>
        </div>

        <form className="mt-8 space-y-5" onSubmit={handleCredentialsLogin}>
          <div className="space-y-2">
            <label
              htmlFor="login"
              className="text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="login"
              type="text"
              value={login}
              onChange={(event) => setLogin(event.target.value)}
              placeholder="nama@kodingyuk.com"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
              required
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="password"
              className="text-sm font-medium text-slate-700"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Masukkan password Odoo"
              className="w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-slate-900 outline-none transition focus:border-sky-500 focus:bg-white"
              required
            />
          </div>

          {(error || initialError || derivedError) && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error || initialError || derivedError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting || googleSubmitting}
            className="w-full rounded-2xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {submitting ? "Memproses login..." : "Masuk"}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs font-medium uppercase tracking-[0.3em] text-slate-400">
            atau
          </span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button
          type="button"
          disabled={!googleEnabled || submitting || googleSubmitting}
          onClick={handleGoogleLogin}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg viewBox="0 0 48 48" className="h-5 w-5" aria-hidden="true">
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.3-.4-3.5Z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7 12.9 19C14.7 14.3 18.9 11 24 11c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.4 4 24 4 16.3 4 9.7 8.3 6.3 14.7Z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2c-2 1.5-4.5 2.4-7.2 2.4-5.2 0-9.6-3.3-11.3-8l-6.5 5C9.5 39.5 16.1 44 24 44Z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-1.1 3-3.2 5.5-6.1 7.2l.1-.1 6.2 5.2C35 40.7 44 34 44 24c0-1.3-.1-2.3-.4-3.5Z"
            />
          </svg>
          {googleSubmitting
            ? "Mengalihkan ke Google..."
            : "Masuk dengan Google"}
        </button>

        {!googleEnabled && (
          <p className="mt-3 text-sm leading-6 text-amber-700">
            Google SSO akan aktif setelah `GOOGLE_CLIENT_ID` dan
            `GOOGLE_CLIENT_SECRET` diisi.
          </p>
        )}

        {devRoleLoginEnabled && (
          <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-900">
              Development Role Access
            </p>
            <p className="mt-1 text-sm leading-6 text-emerald-800">
              Gunakan akun demo sementara untuk menguji semua hak akses tanpa
              meminta akun ke tiap role.
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              <button
                type="button"
                onClick={() => handleDevRoleLogin("staff")}
                disabled={submitting || googleSubmitting}
                className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Masuk sebagai Staff
              </button>
              <button
                type="button"
                onClick={() => handleDevRoleLogin("head")}
                disabled={submitting || googleSubmitting}
                className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Masuk sebagai Head
              </button>
              <button
                type="button"
                onClick={() => handleDevRoleLogin("manager")}
                disabled={submitting || googleSubmitting}
                className="rounded-xl border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-emerald-900 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Masuk sebagai Manager
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
