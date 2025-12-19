// db/index.ts
import { sql } from "@vercel/postgres";
import { drizzle } from "drizzle-orm/vercel-postgres";

// Use the Vercel SQL connection
export const db = drizzle(sql);
