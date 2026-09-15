# Sistem RT

Scaffold: **SvelteKit (Svelte 5) + Tailwind v4 + Drizzle ORM + PostgreSQL**, siap PWA (installable + push notification).

## 1. Install dependencies

```bash
npm install
```

## 2. Setup database

1. Siapkan database Postgres (lokal via Docker, atau layanan seperti Supabase/Neon/Railway).
2. Copy `.env.example` jadi `.env`, isi `DATABASE_URL`.
3. Generate & jalankan migrasi dari schema Drizzle:

```bash
npm run db:generate   # generate file migrasi SQL dari src/lib/server/db/schema.ts
npm run db:migrate    # jalankan migrasi ke database
```

4. (Opsional) buka `npm run db:studio` untuk lihat/edit data lewat GUI Drizzle Studio.

> Skema tabel mengikuti ERD di `erd-sistem-rt.mermaid` dan `schema-sistem-rt.sql` yang sudah dibuat sebelumnya — kedua file itu jadi dokumentasi referensi, sedangkan `src/lib/server/db/schema.ts` adalah source of truth yang dipakai aplikasi.

## 3. Setup Auth & akun pertama

Auth pakai **session-based** (cookie berisi token random, hash-nya disimpan di tabel `sessions` — bukan JWT). Password di-hash pakai bcrypt.

Karena tidak ada halaman registrasi publik (akun dibuatkan pengurus untuk warga), buat akun admin pertama lewat script:

```bash
# isi SEED_ADMIN_USERNAME & SEED_ADMIN_PASSWORD di .env dulu (opsional, ada default)
npm run db:seed-admin
```

Setelah itu login lewat `/login` pakai akun tsb. Untuk menambah akun pengurus/warga lain sementara ini bisa lewat `npm run db:studio` (insert manual ke tabel `users`, `passwordHash` harus di-hash dulu — belum ada form admin untuk ini).

## 4. Setup Push Notification (opsional, bisa nanti)

```bash
npx web-push generate-vapid-keys
```

Isi hasilnya ke `VAPID_PUBLIC_KEY` dan `VAPID_PRIVATE_KEY` di `.env`.

## 5. Jalankan dev server

```bash
npm run dev
```

Buka di HP (satu jaringan WiFi yang sama dengan laptop): akses lewat IP laptop, misal `http://192.168.1.10:5173`, lalu tap "Add to Home Screen" dari browser HP untuk install sebagai PWA.

## 6. Icon PWA

Isi folder `static/icons/` dengan `icon-192.png`, `icon-512.png`, dan `icon-512-maskable.png` (lihat `static/icons/README.md`).

## Struktur folder penting

```
src/
  app.html                  # shell HTML + link manifest.json
  app.css                   # import Tailwind
  hooks.server.ts           # isi locals.user & locals.session dari cookie di tiap request
  service-worker.js         # caching offline + handler push notification
  lib/
    pwa.ts                  # helper register SW & subscribe push (client)
    server/
      auth.ts               # session: generate/validate/invalidate token, cookie helpers
      authz.ts               # requireRole() - guard akses berdasarkan role
      password.ts           # hash & verify password (bcrypt)
      random.ts              # generator password acak (untuk akun baru/reset)
      db/
        schema.ts           # semua tabel (Drizzle ORM), termasuk `sessions`
        index.ts            # koneksi db (drizzle + postgres.js)
  routes/
    +layout.svelte          # layout minimal (semua route, termasuk /login)
    login/                  # halaman & logic login (publik)
    logout/                 # endpoint POST untuk logout
    (app)/                  # route group TERPROTEKSI (wajib login)
      +layout.server.ts     # guard: redirect ke /login kalau belum login
      +layout.svelte        # bottom nav mobile + tombol keluar
      +page.svelte          # halaman beranda
      admin/
        +layout.server.ts   # guard tambahan: hanya role admin_rt
        akun/                # kelola akun: buat/nonaktifkan/reset password/ubah role
      warga/
        +page.svelte         # list + cari warga
        baru/                 # tambah warga
        [id]/                 # detail, edit, hapus + riwayat hunian
      rumah/
        +page.svelte         # list + cari rumah
        baru/                 # tambah rumah
        [id]/                 # detail, edit, hapus + kelola penghuni
      organisasi/
        +page.svelte         # list organisasi
        baru/                 # tambah organisasi
        [id]/                 # detail, edit, hapus + kelola anggota (per-orang/per-rumah)
      kas/
        +page.svelte         # overview semua kategori kas + total saldo
        baru/                 # tambah kategori kas
        [id]/                 # detail kategori: saldo, buku kas, tambah/hapus transaksi
  lib/components/
    WargaForm.svelte          # form dipakai di /warga/baru & /warga/[id]
    RumahForm.svelte          # form dipakai di /rumah/baru & /rumah/[id]
    OrganisasiForm.svelte     # form dipakai di /organisasi/baru & /organisasi/[id]
    KategoriKasForm.svelte    # form dipakai di /kas/baru & /kas/[id]
  lib/format.ts                # helper formatRupiah()
  lib/server/validation/
    warga.ts                  # parsing & validasi input form warga
    rumah.ts                  # parsing & validasi input form rumah
    organisasi.ts              # parsing & validasi input form organisasi
    kas.ts                     # parsing & validasi input kategori kas & transaksi
    api/push/subscribe/     # endpoint simpan push subscription (butuh login)
scripts/
  seed-admin.ts              # buat akun admin pertama (npm run db:seed-admin)
static/
  manifest.json              # PWA manifest
  icons/                     # taruh icon PWA di sini
```

## Langkah selanjutnya (belum dibuat di scaffold ini)

- [x] Auth dasar (login/logout, session, guard route) — sudah jadi
- [x] Halaman admin kelola akun (`/admin/akun`) — buat akun, aktif/nonaktif, reset password, ubah role
- [x] CRUD Warga (`/warga`) — tambah, cari, lihat, edit, hapus
- [x] CRUD Rumah (`/rumah`) — tambah, cari, lihat, edit, hapus, + kelola penghuni (tambah/ubah status/hapus)
- [x] CRUD Organisasi (`/organisasi`) — tambah, lihat, edit, hapus, + kelola anggota (per-orang atau per-rumah tergantung tipe keanggotaan, ubah jabatan/status, keluarkan anggota)
- [x] Kas & Iuran (`/kas`) — kategori kas (wajib bulanan, jimpitan, kas organisasi, sosial, dll), buku kas per kategori (tambah/hapus transaksi masuk-keluar), saldo otomatis dihitung dari transaksi, ringkasan saldo total di beranda
- [ ] Ganti password sendiri & lupa password (untuk warga/pengurus, saat ini reset hanya lewat admin)
- [ ] Role-based access di halaman lain — pola guard-nya sudah ada contohnya di `(app)/admin/+layout.server.ts` dan tiap action CRUD (`requireRole`), tinggal dipakai ulang
- [ ] Modul Informasi (aset, agenda, berita, pengumuman, dll) — belum ada halamannya
- [ ] Modul Laporan — untuk sekarang laporan pemasukan/pengeluaran bisa dilihat langsung dari halaman `/kas/[id]` (saldo & buku kas per kategori), belum ada laporan gabungan/cetak/export
- [ ] Server-side function kirim push notification pakai `web-push` + data dari tabel `push_subscription`
- [ ] Upload foto (bukti kas, foto warga, aset) — perlu storage (Supabase Storage / S3 / local)
