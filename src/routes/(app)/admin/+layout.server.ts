import type { LayoutServerLoad } from './$types';
import { requireRole } from '$lib/server/authz';

export const load: LayoutServerLoad = async (event) => {
	requireRole(event, 'admin_rt');
	return {};
};
