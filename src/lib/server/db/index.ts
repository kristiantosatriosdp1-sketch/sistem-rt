import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '$env/dynamic/private';
import * as schema from './schema';

if (!env.DATABASE_URL) {
	throw new Error('DATABASE_URL belum diset di file .env');
}

// Koneksi pooled ke Postgres. Untuk serverless (misal Vercel), sesuaikan
// { prepare: false } atau pakai driver khusus provider (Neon/Supabase).
const client = postgres(env.DATABASE_URL);

export const db = drizzle(client, { schema });
