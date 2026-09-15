import { error } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

type Role = 'admin_rt' | 'pengurus' | 'warga';

/** Lempar 401/403 kalau user belum login / rolenya tidak diizinkan. Pakai di load() atau actions. */
export function requireRole(event: Pick<RequestEvent, 'locals'>, ...roles: Role[]) {
	const user = event.locals.user;
	if (!user) {
		throw error(401, 'Belum login');
	}
	if (!roles.includes(user.role)) {
		throw error(403, 'Kamu tidak punya akses ke halaman ini');
	}
	return user;
}
