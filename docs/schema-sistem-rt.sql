-- =========================================================
-- SKEMA DATABASE SISTEM RT
-- Target: PostgreSQL (kompatibel Supabase)
-- Catatan: kalau pakai SQLite, ganti UUID -> TEXT,
-- TIMESTAMPTZ -> TEXT, dan ENUM -> CHECK constraint
-- =========================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- untuk gen_random_uuid()

-- =========================================================
-- 1. MASTER KEPENDUDUKAN
-- =========================================================

CREATE TYPE jenis_kelamin_t AS ENUM ('L', 'P');
CREATE TYPE status_pernikahan_t AS ENUM ('belum_menikah', 'menikah', 'cerai_hidup', 'cerai_mati');

CREATE TABLE warga (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama_lengkap        VARCHAR(150) NOT NULL,
    nik                 VARCHAR(16) UNIQUE NOT NULL,
    no_kk               VARCHAR(16) NOT NULL,
    jenis_kelamin       jenis_kelamin_t NOT NULL,
    tanggal_lahir       DATE NOT NULL,
    nama_panggilan      VARCHAR(50),
    pekerjaan           VARCHAR(100),
    alamat_ktp          TEXT NOT NULL,
    no_hp               VARCHAR(20),
    status_pernikahan   status_pernikahan_t NOT NULL DEFAULT 'belum_menikah',
    foto_url            TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_warga_no_kk ON warga(no_kk);
CREATE INDEX idx_warga_nama ON warga(nama_lengkap);

-- =========================================================
-- 2. MASTER ALAMAT
-- =========================================================

CREATE TYPE kepemilikan_rumah_t AS ENUM ('milik_sendiri', 'sewa', 'kos', 'dinas', 'lainnya');
CREATE TYPE status_penghuni_t AS ENUM ('aktif', 'pindah', 'kerja_luar_kota', 'meninggal');

CREATE TABLE rumah (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    alamat              TEXT NOT NULL,
    blok_rt             VARCHAR(20),          -- misal "RT 03 / Blok C No.12"
    kepemilikan         kepemilikan_rumah_t NOT NULL DEFAULT 'milik_sendiri',
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Riwayat & status hunian: satu warga bisa berpindah rumah dari waktu ke waktu,
-- satu rumah bisa berganti-ganti penghuni.
CREATE TABLE penghuni (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warga_id                UUID NOT NULL REFERENCES warga(id) ON DELETE CASCADE,
    rumah_id                UUID NOT NULL REFERENCES rumah(id) ON DELETE CASCADE,
    jangka_waktu_menempati  VARCHAR(50),      -- teks bebas: "sejak 2019", "3 tahun", dst
    tanggal_mulai_menempati DATE,
    status                  status_penghuni_t NOT NULL DEFAULT 'aktif',
    tanggal_status_berubah  DATE,
    keterangan              TEXT,
    created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_penghuni_warga ON penghuni(warga_id);
CREATE INDEX idx_penghuni_rumah ON penghuni(rumah_id);
CREATE INDEX idx_penghuni_status ON penghuni(status);

-- =========================================================
-- USERS (akun login, terpisah dari data warga)
-- =========================================================

CREATE TYPE role_t AS ENUM ('admin_rt', 'pengurus', 'warga');

CREATE TABLE users (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    warga_id        UUID REFERENCES warga(id) ON DELETE SET NULL,
    username        VARCHAR(50) UNIQUE NOT NULL,
    password_hash   TEXT NOT NULL,
    role            role_t NOT NULL DEFAULT 'warga',
    is_active       BOOLEAN NOT NULL DEFAULT true,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- 3. ORGANISASI
-- =========================================================

CREATE TYPE tipe_organisasi_t AS ENUM ('rt', 'dawis', 'koperasi', 'pemuda', 'remaja', 'keagamaan', 'lainnya');
CREATE TYPE tipe_keanggotaan_t AS ENUM ('per_orang', 'per_rumah');
CREATE TYPE jenis_organisasi_t AS ENUM ('bisnis', 'sosial');
CREATE TYPE status_anggota_t AS ENUM ('aktif', 'nonaktif');

CREATE TABLE organisasi (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama                VARCHAR(100) NOT NULL,
    tipe                tipe_organisasi_t NOT NULL,
    tipe_keanggotaan    tipe_keanggotaan_t NOT NULL DEFAULT 'per_rumah',
    jenis               jenis_organisasi_t NOT NULL DEFAULT 'sosial',
    deskripsi           TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Anggota organisasi: bisa per-warga ATAU per-rumah tergantung tipe_keanggotaan
-- (salah satu warga_id / rumah_id wajib diisi, dijaga lewat CHECK constraint)
CREATE TABLE anggota_organisasi (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisasi_id       UUID NOT NULL REFERENCES organisasi(id) ON DELETE CASCADE,
    warga_id            UUID REFERENCES warga(id) ON DELETE CASCADE,
    rumah_id            UUID REFERENCES rumah(id) ON DELETE CASCADE,
    jabatan             VARCHAR(100),          -- null = anggota biasa; isi = "Ketua", "Bendahara", dst
    tanggal_bergabung   DATE NOT NULL DEFAULT CURRENT_DATE,
    status              status_anggota_t NOT NULL DEFAULT 'aktif',
    CONSTRAINT chk_anggota_target CHECK (
        (warga_id IS NOT NULL AND rumah_id IS NULL) OR
        (warga_id IS NULL AND rumah_id IS NOT NULL)
    )
);

CREATE INDEX idx_anggota_org ON anggota_organisasi(organisasi_id);

-- =========================================================
-- 4. KAS & IURAN
-- =========================================================

CREATE TYPE tipe_kas_t AS ENUM ('wajib_bulanan', 'jimpitan', 'kas_organisasi', 'sosial', 'sampah', 'keamanan', 'lainnya');
CREATE TYPE jenis_transaksi_t AS ENUM ('masuk', 'keluar');

-- Kategori kas: organisasi_id NULL berarti kas umum RT (bukan milik organisasi tertentu)
CREATE TABLE kategori_kas (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisasi_id       UUID REFERENCES organisasi(id) ON DELETE CASCADE,
    nama                VARCHAR(100) NOT NULL,
    tipe                tipe_kas_t NOT NULL,
    nominal_default     DECIMAL(12,2),         -- misal iuran wajib bulanan Rp X
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Semua transaksi kas (pemasukan & pengeluaran) tercatat di sini.
-- Laporan (pemasukan/pengeluaran per organisasi) tinggal query/aggregate dari tabel ini.
CREATE TABLE transaksi_kas (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kategori_kas_id     UUID NOT NULL REFERENCES kategori_kas(id) ON DELETE RESTRICT,
    warga_id            UUID REFERENCES warga(id) ON DELETE SET NULL,   -- siapa yang bayar (kalau relevan)
    rumah_id            UUID REFERENCES rumah(id) ON DELETE SET NULL,   -- atau rumah yang bayar
    jenis               jenis_transaksi_t NOT NULL,
    jumlah              DECIMAL(12,2) NOT NULL,
    tanggal             DATE NOT NULL DEFAULT CURRENT_DATE,
    keterangan          TEXT,
    bukti_url           TEXT,                  -- foto struk/bukti transfer
    dicatat_oleh        UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_transaksi_kategori ON transaksi_kas(kategori_kas_id);
CREATE INDEX idx_transaksi_tanggal ON transaksi_kas(tanggal);

-- =========================================================
-- 5. INFORMASI
-- =========================================================

CREATE TABLE aset (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisasi_id   UUID NOT NULL REFERENCES organisasi(id) ON DELETE CASCADE,
    nama            VARCHAR(150) NOT NULL,
    deskripsi       TEXT,
    nilai           DECIMAL(12,2),
    kondisi         VARCHAR(50),
    foto_url        TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE agenda (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisasi_id   UUID NOT NULL REFERENCES organisasi(id) ON DELETE CASCADE,
    judul           VARCHAR(150) NOT NULL,
    deskripsi       TEXT,
    tanggal_mulai   TIMESTAMPTZ NOT NULL,
    tanggal_selesai TIMESTAMPTZ,
    lokasi          VARCHAR(150),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TYPE tingkat_berita_t AS ENUM ('rw', 'kelurahan', 'kecamatan', 'kota', 'provinsi', 'nasional');

CREATE TABLE berita (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tingkat         tingkat_berita_t NOT NULL,
    judul           VARCHAR(200) NOT NULL,
    isi             TEXT NOT NULL,
    sumber_url      TEXT,
    tanggal         DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE pengumuman (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organisasi_id       UUID REFERENCES organisasi(id) ON DELETE CASCADE, -- NULL = untuk semua warga
    judul               VARCHAR(200) NOT NULL,
    isi                 TEXT NOT NULL,
    tanggal_mulai       DATE NOT NULL DEFAULT CURRENT_DATE,
    tanggal_berakhir    DATE,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE usaha_warga (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rumah_id        UUID NOT NULL REFERENCES rumah(id) ON DELETE CASCADE,
    nama_usaha      VARCHAR(150) NOT NULL,
    kategori        VARCHAR(100),
    deskripsi       TEXT,
    kontak          VARCHAR(50),
    foto_url        TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE hewan_peliharaan (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rumah_id    UUID NOT NULL REFERENCES rumah(id) ON DELETE CASCADE,
    nama        VARCHAR(100),
    jenis       VARCHAR(100),
    keterangan  TEXT
);

CREATE TYPE kategori_kontak_t AS ENUM ('ambulan', 'damkar', 'polisi', 'pln', 'pdam', 'lainnya');

CREATE TABLE kontak_darurat (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nama        VARCHAR(150) NOT NULL,
    kategori    kategori_kontak_t NOT NULL,
    nomor       VARCHAR(20) NOT NULL,
    keterangan  TEXT
);

CREATE TABLE sop (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    judul       VARCHAR(150) NOT NULL,  -- "Penanganan Warga Meninggal", "Kebakaran", "Pemilihan RT", dst
    kategori    VARCHAR(100),
    konten      TEXT NOT NULL,          -- bisa markdown
    urutan      INT DEFAULT 0,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =========================================================
-- NOTIFIKASI & PUSH SUBSCRIPTION (untuk PWA push notification)
-- =========================================================

CREATE TABLE notifikasi (
    id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    target_user_id          UUID REFERENCES users(id) ON DELETE CASCADE,       -- NULL = broadcast semua
    target_organisasi_id    UUID REFERENCES organisasi(id) ON DELETE CASCADE,  -- NULL = tidak spesifik organisasi
    judul                   VARCHAR(150) NOT NULL,
    isi                     TEXT NOT NULL,
    tipe                    VARCHAR(50),          -- 'agenda','pengumuman','kas','sop', dst -> untuk routing di app
    ref_id                  UUID,                 -- id record terkait (agenda_id, pengumuman_id, dll)
    dibaca                  BOOLEAN NOT NULL DEFAULT false,
    dikirim_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notif_user ON notifikasi(target_user_id);

CREATE TABLE push_subscription (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    endpoint        TEXT NOT NULL,
    keys_p256dh     TEXT NOT NULL,
    keys_auth       TEXT NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE(user_id, endpoint)
);

-- =========================================================
-- VIEW BANTUAN (opsional, mempermudah query laporan)
-- =========================================================

-- Saldo kas per kategori (pemasukan - pengeluaran)
CREATE VIEW v_saldo_kategori_kas AS
SELECT
    kk.id AS kategori_kas_id,
    kk.nama AS nama_kategori,
    kk.organisasi_id,
    COALESCE(SUM(CASE WHEN tk.jenis = 'masuk' THEN tk.jumlah ELSE 0 END), 0) AS total_masuk,
    COALESCE(SUM(CASE WHEN tk.jenis = 'keluar' THEN tk.jumlah ELSE 0 END), 0) AS total_keluar,
    COALESCE(SUM(CASE WHEN tk.jenis = 'masuk' THEN tk.jumlah ELSE -tk.jumlah END), 0) AS saldo
FROM kategori_kas kk
LEFT JOIN transaksi_kas tk ON tk.kategori_kas_id = kk.id
GROUP BY kk.id, kk.nama, kk.organisasi_id;

-- Penghuni aktif saat ini per rumah (memudahkan tampilan "siapa yang tinggal di sini sekarang")
CREATE VIEW v_penghuni_aktif AS
SELECT p.*, w.nama_lengkap, w.no_hp
FROM penghuni p
JOIN warga w ON w.id = p.warga_id
WHERE p.status = 'aktif';
