// db/index.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

// 1. Added ssl: 'require' to satisfy Supabase security
// 2. Kept prepare: false for the Supabase Transaction Pooler
const client = postgres(connectionString, { 
  prepare: false, 
  ssl: 'require' 
});

export const db = drizzle(client, { schema });