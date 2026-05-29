import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

function redirectTo(path: string, request: Request) {
  return NextResponse.redirect(new URL(path, request.url));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const target = url.searchParams.get("target");
  const session = await auth();

  if (!session?.user) {
    return redirectTo("/login?error=session", request);
  }

  if (target === "admin" && session.user.role !== "ADMIN") {
    return redirectTo("/admin/login?error=not-admin", request);
  }

  if (session.user.role === "ADMIN") {
    return redirectTo("/admin", request);
  }

  if (session.user.status === "APPROVED") {
    return redirectTo("/dashboard", request);
  }

  if (session.user.status === "PENDING" || session.user.status === "REJECTED") {
    return redirectTo("/status-akun", request);
  }

  return redirectTo("/login?error=disabled", request);
}
