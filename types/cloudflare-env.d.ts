/// <reference types="@cloudflare/workers-types" />

interface CloudflareEnv {
  DB: D1Database;
  R2: R2Bucket;
  NEXTAUTH_SECRET?: string;
  NEXTAUTH_URL?: string;
  R2_PUBLIC_URL?: string;
  RESEND_API_KEY?: string;
  NEXT_PUBLIC_APP_NAME?: string;
  NEXT_PUBLIC_APP_URL?: string;
}
