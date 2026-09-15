CREATE EXTENSION IF NOT EXISTS "pgcrypto";--> statement-breakpoint
CREATE TYPE "public"."jenis_kelamin_t" AS ENUM('L', 'P');--> statement-breakpoint
CREATE TYPE "public"."jenis_organisasi_t" AS ENUM('bisnis', 'sosial');--> statement-breakpoint
CREATE TYPE "public"."jenis_transaksi_t" AS ENUM('masuk', 'keluar');--> statement-breakpoint
CREATE TYPE "public"."kategori_kontak_t" AS ENUM('ambulan', 'damkar', 'polisi', 'pln', 'pdam', 'lainnya');--> statement-breakpoint
CREATE TYPE "public"."kepemilikan_rumah_t" AS ENUM('milik_sendiri', 'sewa', 'kos', 'dinas', 'lainnya');--> statement-breakpoint
CREATE TYPE "public"."role_t" AS ENUM('admin_rt', 'pengurus', 'warga');--> statement-breakpoint
CREATE TYPE "public"."status_anggota_t" AS ENUM('aktif', 'nonaktif');--> statement-breakpoint
CREATE TYPE "public"."status_penghuni_t" AS ENUM('aktif', 'pindah', 'kerja_luar_kota', 'meninggal');--> statement-breakpoint
CREATE TYPE "public"."status_pernikahan_t" AS ENUM('belum_menikah', 'menikah', 'cerai_hidup', 'cerai_mati');--> statement-breakpoint
CREATE TYPE "public"."tingkat_berita_t" AS ENUM('rw', 'kelurahan', 'kecamatan', 'kota', 'provinsi', 'nasional');--> statement-breakpoint
CREATE TYPE "public"."tipe_kas_t" AS ENUM('wajib_bulanan', 'jimpitan', 'kas_organisasi', 'sosial', 'sampah', 'keamanan', 'lainnya');--> statement-breakpoint
CREATE TYPE "public"."tipe_keanggotaan_t" AS ENUM('per_orang', 'per_rumah');--> statement-breakpoint
CREATE TYPE "public"."tipe_organisasi_t" AS ENUM('rt', 'dawis', 'koperasi', 'pemuda', 'remaja', 'keagamaan', 'lainnya');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "agenda" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organisasi_id" uuid NOT NULL,
	"judul" varchar(150) NOT NULL,
	"deskripsi" text,
	"tanggal_mulai" timestamp with time zone NOT NULL,
	"tanggal_selesai" timestamp with time zone,
	"lokasi" varchar(150),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "anggota_organisasi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organisasi_id" uuid NOT NULL,
	"warga_id" uuid,
	"rumah_id" uuid,
	"jabatan" varchar(100),
	"tanggal_bergabung" date DEFAULT now() NOT NULL,
	"status" "status_anggota_t" DEFAULT 'aktif' NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "aset" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organisasi_id" uuid NOT NULL,
	"nama" varchar(150) NOT NULL,
	"deskripsi" text,
	"nilai" numeric(12, 2),
	"kondisi" varchar(50),
	"foto_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "berita" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tingkat" "tingkat_berita_t" NOT NULL,
	"judul" varchar(200) NOT NULL,
	"isi" text NOT NULL,
	"sumber_url" text,
	"tanggal" date DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "hewan_peliharaan" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rumah_id" uuid NOT NULL,
	"nama" varchar(100),
	"jenis" varchar(100),
	"keterangan" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kategori_kas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organisasi_id" uuid,
	"nama" varchar(100) NOT NULL,
	"tipe" "tipe_kas_t" NOT NULL,
	"nominal_default" numeric(12, 2),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "kontak_darurat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" varchar(150) NOT NULL,
	"kategori" "kategori_kontak_t" NOT NULL,
	"nomor" varchar(20) NOT NULL,
	"keterangan" text
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notifikasi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"target_user_id" uuid,
	"target_organisasi_id" uuid,
	"judul" varchar(150) NOT NULL,
	"isi" text NOT NULL,
	"tipe" varchar(50),
	"ref_id" uuid,
	"dibaca" boolean DEFAULT false NOT NULL,
	"dikirim_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "organisasi" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama" varchar(100) NOT NULL,
	"tipe" "tipe_organisasi_t" NOT NULL,
	"tipe_keanggotaan" "tipe_keanggotaan_t" DEFAULT 'per_rumah' NOT NULL,
	"jenis" "jenis_organisasi_t" DEFAULT 'sosial' NOT NULL,
	"deskripsi" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "penghuni" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"warga_id" uuid NOT NULL,
	"rumah_id" uuid NOT NULL,
	"jangka_waktu_menempati" varchar(50),
	"tanggal_mulai_menempati" date,
	"status" "status_penghuni_t" DEFAULT 'aktif' NOT NULL,
	"tanggal_status_berubah" date,
	"keterangan" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pengumuman" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"organisasi_id" uuid,
	"judul" varchar(200) NOT NULL,
	"isi" text NOT NULL,
	"tanggal_mulai" date DEFAULT now() NOT NULL,
	"tanggal_berakhir" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "push_subscription" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"endpoint" text NOT NULL,
	"keys_p256dh" text NOT NULL,
	"keys_auth" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "push_subscription_user_id_endpoint_unique" UNIQUE("user_id","endpoint")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rumah" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"alamat" text NOT NULL,
	"blok_rt" varchar(20),
	"kepemilikan" "kepemilikan_rumah_t" DEFAULT 'milik_sendiri' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sop" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"judul" varchar(150) NOT NULL,
	"kategori" varchar(100),
	"konten" text NOT NULL,
	"urutan" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "transaksi_kas" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kategori_kas_id" uuid NOT NULL,
	"warga_id" uuid,
	"rumah_id" uuid,
	"jenis" "jenis_transaksi_t" NOT NULL,
	"jumlah" numeric(12, 2) NOT NULL,
	"tanggal" date DEFAULT now() NOT NULL,
	"keterangan" text,
	"bukti_url" text,
	"dicatat_oleh" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "usaha_warga" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"rumah_id" uuid NOT NULL,
	"nama_usaha" varchar(150) NOT NULL,
	"kategori" varchar(100),
	"deskripsi" text,
	"kontak" varchar(50),
	"foto_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"warga_id" uuid,
	"username" varchar(50) NOT NULL,
	"password_hash" text NOT NULL,
	"role" "role_t" DEFAULT 'warga' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "warga" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nama_lengkap" varchar(150) NOT NULL,
	"nik" varchar(16) NOT NULL,
	"no_kk" varchar(16) NOT NULL,
	"jenis_kelamin" "jenis_kelamin_t" NOT NULL,
	"tanggal_lahir" date NOT NULL,
	"nama_panggilan" varchar(50),
	"pekerjaan" varchar(100),
	"alamat_ktp" text NOT NULL,
	"no_hp" varchar(20),
	"status_pernikahan" "status_pernikahan_t" DEFAULT 'belum_menikah' NOT NULL,
	"foto_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "warga_nik_unique" UNIQUE("nik")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "agenda" ADD CONSTRAINT "agenda_organisasi_id_organisasi_id_fk" FOREIGN KEY ("organisasi_id") REFERENCES "public"."organisasi"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "anggota_organisasi" ADD CONSTRAINT "anggota_organisasi_organisasi_id_organisasi_id_fk" FOREIGN KEY ("organisasi_id") REFERENCES "public"."organisasi"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "anggota_organisasi" ADD CONSTRAINT "anggota_organisasi_warga_id_warga_id_fk" FOREIGN KEY ("warga_id") REFERENCES "public"."warga"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "anggota_organisasi" ADD CONSTRAINT "anggota_organisasi_rumah_id_rumah_id_fk" FOREIGN KEY ("rumah_id") REFERENCES "public"."rumah"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "aset" ADD CONSTRAINT "aset_organisasi_id_organisasi_id_fk" FOREIGN KEY ("organisasi_id") REFERENCES "public"."organisasi"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "hewan_peliharaan" ADD CONSTRAINT "hewan_peliharaan_rumah_id_rumah_id_fk" FOREIGN KEY ("rumah_id") REFERENCES "public"."rumah"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "kategori_kas" ADD CONSTRAINT "kategori_kas_organisasi_id_organisasi_id_fk" FOREIGN KEY ("organisasi_id") REFERENCES "public"."organisasi"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_target_user_id_users_id_fk" FOREIGN KEY ("target_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notifikasi" ADD CONSTRAINT "notifikasi_target_organisasi_id_organisasi_id_fk" FOREIGN KEY ("target_organisasi_id") REFERENCES "public"."organisasi"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "penghuni" ADD CONSTRAINT "penghuni_warga_id_warga_id_fk" FOREIGN KEY ("warga_id") REFERENCES "public"."warga"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "penghuni" ADD CONSTRAINT "penghuni_rumah_id_rumah_id_fk" FOREIGN KEY ("rumah_id") REFERENCES "public"."rumah"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pengumuman" ADD CONSTRAINT "pengumuman_organisasi_id_organisasi_id_fk" FOREIGN KEY ("organisasi_id") REFERENCES "public"."organisasi"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "push_subscription" ADD CONSTRAINT "push_subscription_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transaksi_kas" ADD CONSTRAINT "transaksi_kas_kategori_kas_id_kategori_kas_id_fk" FOREIGN KEY ("kategori_kas_id") REFERENCES "public"."kategori_kas"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transaksi_kas" ADD CONSTRAINT "transaksi_kas_warga_id_warga_id_fk" FOREIGN KEY ("warga_id") REFERENCES "public"."warga"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transaksi_kas" ADD CONSTRAINT "transaksi_kas_rumah_id_rumah_id_fk" FOREIGN KEY ("rumah_id") REFERENCES "public"."rumah"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "transaksi_kas" ADD CONSTRAINT "transaksi_kas_dicatat_oleh_users_id_fk" FOREIGN KEY ("dicatat_oleh") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "usaha_warga" ADD CONSTRAINT "usaha_warga_rumah_id_rumah_id_fk" FOREIGN KEY ("rumah_id") REFERENCES "public"."rumah"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "users" ADD CONSTRAINT "users_warga_id_warga_id_fk" FOREIGN KEY ("warga_id") REFERENCES "public"."warga"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
