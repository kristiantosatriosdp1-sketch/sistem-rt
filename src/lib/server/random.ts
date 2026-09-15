// Karakter sengaja hindari yang gampang tertukar (0/O, 1/l/I) supaya gampang diketik ulang di HP
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';

export function generateRandomPassword(length = 10): string {
	const bytes = new Uint8Array(length);
	crypto.getRandomValues(bytes);
	return Array.from(bytes, (b) => CHARS[b % CHARS.length]).join('');
}
