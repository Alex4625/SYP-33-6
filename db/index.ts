import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/d1";

import * as schema from "@/db/schema";

export function getDb(d1: D1Database) {
  return drizzle(d1, { schema });
}

export async function getCloudflareDb() {
  const { env } = await getCloudflareContext({ async: true });

  if (!env.DB) {
    throw new Error("Binding D1 DB belum tersedia.");
  }

  return getDb(env.DB);
}

export async function getCloudflareEnv() {
  const { env } = await getCloudflareContext({ async: true });
  return env;
}

export type Database = ReturnType<typeof getDb>;
