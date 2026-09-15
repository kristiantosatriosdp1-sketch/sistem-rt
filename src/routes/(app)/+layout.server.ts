import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	if (!locals.user) {
		const redirectTo = url.pathname === '/' ? '' : `?redirectTo=${encodeURIComponent(url.pathname)}`;
		throw redirect(302, `/login${redirectTo}`);
	}

	return {
		user: {
			id: locals.user.id,
			username: locals.user.username,
			role: locals.user.role,
			wargaId: locals.user.wargaId
		}
	};
};
