const formatter = new Intl.NumberFormat('id-ID', {
	style: 'currency',
	currency: 'IDR',
	maximumFractionDigits: 0
});

export function formatRupiah(n: number | string): string {
	const num = typeof n === 'string' ? Number(n) : n;
	return formatter.format(Number.isFinite(num) ? num : 0);
}
