import postgres from 'postgres';
import bcrypt from 'bcryptjs';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
	console.error('❌ DATABASE_URL is not set!');
	process.exit(1);
}

const sql = postgres(connectionString, { max: 1 });

async function main() {
	const username = process.env.SEED_ADMIN_USERNAME || 'admin';
	const password = process.env.SEED_ADMIN_PASSWORD || 'admin123';

	const salt = await bcrypt.genSalt(10);
	const passwordHash = await bcrypt.hash(password, salt);

	// Periksa apakah user sudah ada
	const existing = await sql`SELECT id FROM users WHERE username = ${username} LIMIT 1`;
	if (existing.length > 0) {
		console.log(`ℹ️  User admin '${username}' sudah ada.`);
		await sql.end();
		process.exit(0);
	}

	await sql`
		INSERT INTO users (username, password_hash, role)
		VALUES (${username}, ${passwordHash}, 'admin_rt')
	`;

	console.log(`✅ Admin berhasil dibuat!`);
	console.log(`   Username : ${username}`);
	console.log(`   Password : ${password}`);
	console.log(`   Role     : admin_rt`);
	await sql.end();
	process.exit(0);
}

main().catch(async (err) => {
	console.error('❌ Gagal seed admin:', err.message);
	await sql.end();
	process.exit(1);
});
