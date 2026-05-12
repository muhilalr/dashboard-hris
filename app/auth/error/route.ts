import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { LOGIN_ERROR_COOKIE } from "@/lib/auth-errors";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code") ?? "AccessDenied";
  const callbackUrl = request.nextUrl.searchParams.get("callbackUrl");
  const loginUrl = new URL("/login", request.url);

  if (callbackUrl && callbackUrl.startsWith("/")) {
    loginUrl.searchParams.set("callbackUrl", callbackUrl);
  }

  const response = NextResponse.redirect(loginUrl);

  response.cookies.set({
    name: LOGIN_ERROR_COOKIE,
    value: code,
    path: "/",
    httpOnly: false,
    sameSite: "lax",
    maxAge: 60,
  });

  return response;
}
