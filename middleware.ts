import { NextResponse, type NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const rateLimitStore = new Map<string, number[]>();
const RATE_LIMIT_WINDOW_MS = 10_000;
const RATE_LIMIT_MAX = 5;

function getClientIp(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimited(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  if (!["/login", "/daftar"].includes(pathname)) return false;

  const key = `${getClientIp(request)}:${pathname}`;
  const now = Date.now();
  const attempts = (rateLimitStore.get(key) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );

  if (attempts.length >= RATE_LIMIT_MAX) {
    rateLimitStore.set(key, attempts);
    return true;
  }

  attempts.push(now);
  rateLimitStore.set(key, attempts);
  return false;
}

export async function middleware(request: NextRequest) {
  if (isRateLimited(request)) {
    return new NextResponse("Terlalu banyak percobaan. Silakan tunggu beberapa saat.", {
      status: 429,
    });
  }

  const { pathname } = request.nextUrl;
  const token = await getToken({
    req: request,
    secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  });

  const redirect = (path: string) =>
    NextResponse.redirect(new URL(path, request.url));

  if ((pathname === "/login" || pathname === "/daftar") && token) {
    if (token.role === "ADMIN") return redirect("/admin");
    if (token.status === "APPROVED") return redirect("/dashboard");
    if (token.status === "PENDING" || token.status === "REJECTED")
      return redirect("/status-akun");
    return redirect("/login?error=disabled");
  }

  if (pathname === "/admin/login") {
    if (token?.role === "ADMIN") return redirect("/admin");
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!token || token.role !== "ADMIN") return redirect("/admin/login");
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard")) {
    if (!token || token.role !== "ALUMNI") return redirect("/login");
    if (token.status === "DISABLED") return redirect("/login?error=disabled");
    if (token.status === "PENDING" || token.status === "REJECTED")
      return redirect("/status-akun");
    if (token.status !== "APPROVED") return redirect("/login");
    return NextResponse.next();
  }

  if (pathname === "/status-akun") {
    if (!token || token.role !== "ALUMNI") return redirect("/login");
    if (token.status === "APPROVED") return redirect("/dashboard");
    if (token.status === "DISABLED") return redirect("/login?error=disabled");
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
