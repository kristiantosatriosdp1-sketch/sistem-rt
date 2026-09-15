import type { users, sessions } from '$lib/server/db/schema';

type UserRow = typeof users.$inferSelect;
type SessionRow = typeof sessions.$inferSelect;

// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		// interface Error {}
		interface Locals {
			user: UserRow | null;
			session: SessionRow | null;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
