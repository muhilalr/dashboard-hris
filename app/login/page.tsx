import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";

import { LoginForm } from "@/app/login/login-form";
import { LOGIN_ERROR_COOKIE, getLoginErrorMessage } from "@/lib/auth-errors";
import { isDevRoleAuthEnabled, isGoogleProviderEnabled } from "@/lib/auth";
import { authOptions } from "@/lib/auth";

type LoginPageProps = {
  searchParams?: {
    callbackUrl?: string;
    error?: string;
  };
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await getServerSession(authOptions);

  if (session) {
    redirect(
      searchParams?.callbackUrl && searchParams.callbackUrl.startsWith("/")
        ? searchParams.callbackUrl
        : "/dashboard",
    );
  }

  const cookieStore = cookies();
  const errorCode = cookieStore.get(LOGIN_ERROR_COOKIE)?.value ?? null;
  const initialError = getLoginErrorMessage(errorCode);

  return (
    <LoginForm
      devRoleLoginEnabled={isDevRoleAuthEnabled()}
      googleEnabled={isGoogleProviderEnabled()}
      initialError={initialError}
      initialErrorCode={errorCode}
    />
  );
}
