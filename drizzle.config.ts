import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

const databaseUrl = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/sistem_rt';

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'postgresql',
	dbCredentials: {
		url: databaseUrl
	},
	verbose: true,
	strict: true
});
