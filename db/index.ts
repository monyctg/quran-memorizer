// db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema'; // Optional: if you want schema intellisense

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// Disable prefetch/prepare because Supabase Transaction pooler doesn't support it
const client = postgres(connectionString, { prepare: false });

export const db = drizzle(client, { schema });