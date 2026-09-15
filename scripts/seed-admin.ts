import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/lib/server/db/schema';
import { hashPassword } from '../src/lib/server/password';

if (!process.env.DATABASE_URL) {
	throw new Error('DATABASE_URL belum diset di file .env');
}

const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client, { schema });

async function main() {
	const username = process.env.SEED_ADMIN_USERNAME || 'admin';
	const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';

	if (password === 'admin123') {
		console.warn(
			'⚠️  Pakai password default. Set SEED_ADMIN_USERNAME & SEED_ADMIN_PASSWORD di .env untuk keamanan.'
		);
	}

	const passwordHash = await hashPassword(password);

	await db.insert(schema.users).values({
		username,
		passwordHash,
		role: 'admin_rt'
	});

	console.log(`✅ Admin dibuat — username: ${username} | password: ${password}`);
	console.log('   Segera login dan ganti password setelah fitur ganti-password dibuat.');
	process.exit(0);
}

main().catch((err) => {
	console.error('❌ Gagal membuat admin:', err.message);
	process.exit(1);
});
