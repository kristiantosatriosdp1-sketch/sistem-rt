import {
	pgTable,
	pgEnum,
	uuid,
	varchar,
	text,
	date,
	timestamp,
	boolean,
	decimal,
	integer,
	unique
} from 'drizzle-orm/pg-core';

// =========================================================
// ENUMS
// =========================================================

export const jenisKelaminEnum = pgEnum('jenis_kelamin_t', ['L', 'P']);
export const statusPernikahanEnum = pgEnum('status_pernikahan_t', [
	'belum_menikah',
	'menikah',
	'cerai_hidup',
	'cerai_mati'
]);
export const kepemilikanRumahEnum = pgEnum('kepemilikan_rumah_t', [
	'milik_sendiri',
	'sewa',
	'kos',
	'dinas',
	'lainnya'
]);
export const statusPenghuniEnum = pgEnum('status_penghuni_t', [
	'aktif',
	'pindah',
	'kerja_luar_kota',
	'meninggal'
]);
export const roleEnum = pgEnum('role_t', ['admin_rt', 'pengurus', 'warga']);
export const tipeOrganisasiEnum = pgEnum('tipe_organisasi_t', [
	'rt',
	'dawis',
	'koperasi',
	'pemuda',
	'remaja',
	'keagamaan',
	'lainnya'
]);
export const tipeKeanggotaanEnum = pgEnum('tipe_keanggotaan_t', ['per_orang', 'per_rumah']);
export const jenisOrganisasiEnum = pgEnum('jenis_organisasi_t', ['bisnis', 'sosial']);
export const statusAnggotaEnum = pgEnum('status_anggota_t', ['aktif', 'nonaktif']);
export const tipeKasEnum = pgEnum('tipe_kas_t', [
	'wajib_bulanan',
	'jimpitan',
	'kas_organisasi',
	'sosial',
	'sampah',
	'keamanan',
	'lainnya'
]);
export const jenisTransaksiEnum = pgEnum('jenis_transaksi_t', ['masuk', 'keluar']);
export const tingkatBeritaEnum = pgEnum('tingkat_berita_t', [
	'rw',
	'kelurahan',
	'kecamatan',
	'kota',
	'provinsi',
	'nasional'
]);
export const kategoriKontakEnum = pgEnum('kategori_kontak_t', [
	'ambulan',
	'damkar',
	'polisi',
	'pln',
	'pdam',
	'lainnya'
]);

// =========================================================
// 1. MASTER KEPENDUDUKAN
// =========================================================

export const warga = pgTable('warga', {
	id: uuid('id').defaultRandom().primaryKey(),
	namaLengkap: varchar('nama_lengkap', { length: 150 }).notNull(),
	nik: varchar('nik', { length: 16 }).notNull().unique(),
	noKk: varchar('no_kk', { length: 16 }).notNull(),
	jenisKelamin: jenisKelaminEnum('jenis_kelamin').notNull(),
	tanggalLahir: date('tanggal_lahir').notNull(),
	namaPanggilan: varchar('nama_panggilan', { length: 50 }),
	pekerjaan: varchar('pekerjaan', { length: 100 }),
	alamatKtp: text('alamat_ktp').notNull(),
	noHp: varchar('no_hp', { length: 20 }),
	statusPernikahan: statusPernikahanEnum('status_pernikahan').notNull().default('belum_menikah'),
	fotoUrl: text('foto_url'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});

// =========================================================
// 2. MASTER ALAMAT
// =========================================================

export const rumah = pgTable('rumah', {
	id: uuid('id').defaultRandom().primaryKey(),
	alamat: text('alamat').notNull(),
	blokRt: varchar('blok_rt', { length: 20 }),
	kepemilikan: kepemilikanRumahEnum('kepemilikan').notNull().default('milik_sendiri'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const penghuni = pgTable('penghuni', {
	id: uuid('id').defaultRandom().primaryKey(),
	wargaId: uuid('warga_id')
		.notNull()
		.references(() => warga.id, { onDelete: 'cascade' }),
	rumahId: uuid('rumah_id')
		.notNull()
		.references(() => rumah.id, { onDelete: 'cascade' }),
	jangkaWaktuMenempati: varchar('jangka_waktu_menempati', { length: 50 }),
	tanggalMulaiMenempati: date('tanggal_mulai_menempati'),
	status: statusPenghuniEnum('status').notNull().default('aktif'),
	tanggalStatusBerubah: date('tanggal_status_berubah'),
	keterangan: text('keterangan'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// =========================================================
// USERS (akun login)
// =========================================================

export const users = pgTable('users', {
	id: uuid('id').defaultRandom().primaryKey(),
	wargaId: uuid('warga_id').references(() => warga.id, { onDelete: 'set null' }),
	username: varchar('username', { length: 50 }).notNull().unique(),
	passwordHash: text('password_hash').notNull(),
	role: roleEnum('role').notNull().default('warga'),
	isActive: boolean('is_active').notNull().default(true),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// =========================================================
// 3. ORGANISASI
// =========================================================

export const organisasi = pgTable('organisasi', {
	id: uuid('id').defaultRandom().primaryKey(),
	nama: varchar('nama', { length: 100 }).notNull(),
	tipe: tipeOrganisasiEnum('tipe').notNull(),
	tipeKeanggotaan: tipeKeanggotaanEnum('tipe_keanggotaan').notNull().default('per_rumah'),
	jenis: jenisOrganisasiEnum('jenis').notNull().default('sosial'),
	deskripsi: text('deskripsi'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const anggotaOrganisasi = pgTable('anggota_organisasi', {
	id: uuid('id').defaultRandom().primaryKey(),
	organisasiId: uuid('organisasi_id')
		.notNull()
		.references(() => organisasi.id, { onDelete: 'cascade' }),
	// salah satu dari wargaId / rumahId wajib diisi tergantung tipeKeanggotaan organisasi
	// (divalidasi di application layer / CHECK constraint di migrasi SQL)
	wargaId: uuid('warga_id').references(() => warga.id, { onDelete: 'cascade' }),
	rumahId: uuid('rumah_id').references(() => rumah.id, { onDelete: 'cascade' }),
	jabatan: varchar('jabatan', { length: 100 }),
	tanggalBergabung: date('tanggal_bergabung').notNull().defaultNow(),
	status: statusAnggotaEnum('status').notNull().default('aktif')
});

// =========================================================
// 4. KAS & IURAN
// =========================================================

export const kategoriKas = pgTable('kategori_kas', {
	id: uuid('id').defaultRandom().primaryKey(),
	organisasiId: uuid('organisasi_id').references(() => organisasi.id, { onDelete: 'cascade' }),
	nama: varchar('nama', { length: 100 }).notNull(),
	tipe: tipeKasEnum('tipe').notNull(),
	nominalDefault: decimal('nominal_default', { precision: 12, scale: 2 }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const transaksiKas = pgTable('transaksi_kas', {
	id: uuid('id').defaultRandom().primaryKey(),
	kategoriKasId: uuid('kategori_kas_id')
		.notNull()
		.references(() => kategoriKas.id),
	wargaId: uuid('warga_id').references(() => warga.id, { onDelete: 'set null' }),
	rumahId: uuid('rumah_id').references(() => rumah.id, { onDelete: 'set null' }),
	jenis: jenisTransaksiEnum('jenis').notNull(),
	jumlah: decimal('jumlah', { precision: 12, scale: 2 }).notNull(),
	tanggal: date('tanggal').notNull().defaultNow(),
	keterangan: text('keterangan'),
	buktiUrl: text('bukti_url'),
	dicatatOleh: uuid('dicatat_oleh').references(() => users.id, { onDelete: 'set null' }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// =========================================================
// 5. INFORMASI
// =========================================================

export const aset = pgTable('aset', {
	id: uuid('id').defaultRandom().primaryKey(),
	organisasiId: uuid('organisasi_id')
		.notNull()
		.references(() => organisasi.id, { onDelete: 'cascade' }),
	nama: varchar('nama', { length: 150 }).notNull(),
	deskripsi: text('deskripsi'),
	nilai: decimal('nilai', { precision: 12, scale: 2 }),
	kondisi: varchar('kondisi', { length: 50 }),
	fotoUrl: text('foto_url'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const agenda = pgTable('agenda', {
	id: uuid('id').defaultRandom().primaryKey(),
	organisasiId: uuid('organisasi_id')
		.notNull()
		.references(() => organisasi.id, { onDelete: 'cascade' }),
	judul: varchar('judul', { length: 150 }).notNull(),
	deskripsi: text('deskripsi'),
	tanggalMulai: timestamp('tanggal_mulai', { withTimezone: true }).notNull(),
	tanggalSelesai: timestamp('tanggal_selesai', { withTimezone: true }),
	lokasi: varchar('lokasi', { length: 150 }),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const berita = pgTable('berita', {
	id: uuid('id').defaultRandom().primaryKey(),
	tingkat: tingkatBeritaEnum('tingkat').notNull(),
	judul: varchar('judul', { length: 200 }).notNull(),
	isi: text('isi').notNull(),
	sumberUrl: text('sumber_url'),
	tanggal: date('tanggal').notNull().defaultNow(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const pengumuman = pgTable('pengumuman', {
	id: uuid('id').defaultRandom().primaryKey(),
	organisasiId: uuid('organisasi_id').references(() => organisasi.id, { onDelete: 'cascade' }),
	judul: varchar('judul', { length: 200 }).notNull(),
	isi: text('isi').notNull(),
	tanggalMulai: date('tanggal_mulai').notNull().defaultNow(),
	tanggalBerakhir: date('tanggal_berakhir'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const usahaWarga = pgTable('usaha_warga', {
	id: uuid('id').defaultRandom().primaryKey(),
	rumahId: uuid('rumah_id')
		.notNull()
		.references(() => rumah.id, { onDelete: 'cascade' }),
	namaUsaha: varchar('nama_usaha', { length: 150 }).notNull(),
	kategori: varchar('kategori', { length: 100 }),
	deskripsi: text('deskripsi'),
	kontak: varchar('kontak', { length: 50 }),
	fotoUrl: text('foto_url'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

export const hewanPeliharaan = pgTable('hewan_peliharaan', {
	id: uuid('id').defaultRandom().primaryKey(),
	rumahId: uuid('rumah_id')
		.notNull()
		.references(() => rumah.id, { onDelete: 'cascade' }),
	nama: varchar('nama', { length: 100 }),
	jenis: varchar('jenis', { length: 100 }),
	keterangan: text('keterangan')
});

export const kontakDarurat = pgTable('kontak_darurat', {
	id: uuid('id').defaultRandom().primaryKey(),
	nama: varchar('nama', { length: 150 }).notNull(),
	kategori: kategoriKontakEnum('kategori').notNull(),
	nomor: varchar('nomor', { length: 20 }).notNull(),
	keterangan: text('keterangan')
});

export const sop = pgTable('sop', {
	id: uuid('id').defaultRandom().primaryKey(),
	judul: varchar('judul', { length: 150 }).notNull(),
	kategori: varchar('kategori', { length: 100 }),
	konten: text('konten').notNull(),
	urutan: integer('urutan').default(0),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});

// =========================================================
// NOTIFIKASI & PUSH SUBSCRIPTION
// =========================================================

export const notifikasi = pgTable('notifikasi', {
	id: uuid('id').defaultRandom().primaryKey(),
	targetUserId: uuid('target_user_id').references(() => users.id, { onDelete: 'cascade' }),
	targetOrganisasiId: uuid('target_organisasi_id').references(() => organisasi.id, {
		onDelete: 'cascade'
	}),
	judul: varchar('judul', { length: 150 }).notNull(),
	isi: text('isi').notNull(),
	tipe: varchar('tipe', { length: 50 }),
	refId: uuid('ref_id'),
	dibaca: boolean('dibaca').notNull().default(false),
	dikirimAt: timestamp('dikirim_at', { withTimezone: true }).notNull().defaultNow()
});

// =========================================================
// SESSIONS (auth)
// =========================================================

export const sessions = pgTable('sessions', {
	id: text('id').primaryKey(), // sha256(token) dalam hex - token asli hanya ada di cookie klien
	userId: uuid('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull()
});

export const pushSubscription = pgTable(
	'push_subscription',
	{
		id: uuid('id').defaultRandom().primaryKey(),
		userId: uuid('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		endpoint: text('endpoint').notNull(),
		keysP256dh: text('keys_p256dh').notNull(),
		keysAuth: text('keys_auth').notNull(),
		createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
	},
	(t) => [unique().on(t.userId, t.endpoint)]
);
