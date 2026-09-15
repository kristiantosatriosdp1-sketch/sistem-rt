import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	console.error('❌ DATABASE_URL is not set!');
	process.exit(1);
}

console.log('⏳ Menjalankan migrasi database PostgreSQL...');

try {
	const sql = postgres(connectionString, { max: 1 });
	const db = drizzle(sql);
	await migrate(db, { migrationsFolder: './drizzle' });
	await sql.end();
	console.log('✅ Migrasi database berhasil diterapkan.');
} catch (error) {
	console.error('❌ Migrasi database gagal:', error);
	process.exit(1);
}
