# 🚀 Panduan Lengkap Deploy Sistem RT ke VPS (aaPanel + Docker Compose)

Panduan ini memandu Anda mulai dari persiapan server aaPanel, konfigurasi domain, database terisolasi, hingga auto-deploy menggunakan GitHub Actions.

---

## 📋 Daftar Isi
1. [Spesifikasi & Kebutuhan Server](#1-spesifikasi--kebutuhan-server)
2. [Persiapan Awal di aaPanel & VPS](#2-persiapan-awal-di-aapanel--vps)
3. [Deploy Pertama Kali (Manual)](#3-deploy-pertama-kali-manual)
4. [Konfigurasi Reverse Proxy & SSL di aaPanel](#4-konfigurasi-reverse-proxy--ssl-di-aapanel)
5. [Inisialisasi Database & Akun Admin](#5-inisialisasi-database--akun-admin)
6. [Setup Auto Deploy Otomatis (GitHub Actions)](#6-setup-auto-deploy-otomatis-github-actions)
7. [Tips Maintenance & Troubleshooting](#7-tips-maintenance--troubleshooting)

---

## 1. Spesifikasi & Kebutuhan Server
- **VPS OS:** Ubuntu 20.04 / 22.04 / Debian 11+
- **Control Panel:** aaPanel (Nginx terinstall)
- **Engine:** Docker & Docker Compose Plugin
- **Domain/Subdomain:** Sudah diarahkan (A Record DNS) ke IP VPS (contoh: `rt.domainanda.com`)

---

## 2. Persiapan Awal di aaPanel & VPS

### A. Pastikan Docker & Git Terpasang di VPS
Masuk ke terminal VPS via SSH atau Terminal aaPanel:
```bash
# Pastikan Docker terinstall
docker --version
docker compose version
git --version
```
*(Jika Docker belum ada di aaPanel: Masuk ke aaPanel > menu **App Store** > cari **Docker Manager** > Install)*.

### B. Konfigurasi Jaringan VPS (IPv4 Priority)
Jalankan perintah ini sekali untuk mencegah error timeout koneksi Docker Hub:
```bash
sudo sed -i 's/#precedence ::ffff:0:0\/96  100/precedence ::ffff:0:0\/96  100/' /etc/gai.conf 2>/dev/null || echo "precedence ::ffff:0:0/96 100" | sudo tee -a /etc/gai.conf
sudo mkdir -p /etc/docker && echo '{"dns": ["8.8.8.8", "1.1.1.1"]}' | sudo tee /etc/docker/daemon.json
sudo systemctl restart docker
```

---

## 3. Deploy Pertama Kali (Manual)

### Langkah 1: Buat Direktori & Clone Kode
```bash
mkdir -p /www/wwwroot/catatan_rt
cd /www/wwwroot/catatan_rt

# Set safe directory git
git config --global --add safe.directory /www/wwwroot/catatan_rt

# Download kode
git init
git remote add origin https://github.com/MegonoComunity/sistem-rt.git
git fetch origin main
git reset --hard origin/main
```

### Langkah 2: Buat File `.env`
Salin template konfigurasi:
```bash
cp .env.example .env
```
Edit file `.env` menggunakan `nano .env` (atau melalui File Manager aaPanel):
```env
# =========================================================
# PENGATURAN PORT (Ubah jika port 3000 / 5432 sudah dipakai project lain)
# =========================================================
APP_PORT=3005
DB_PORT=5433

# =========================================================
# KREDENSIAL DATABASE
# =========================================================
DB_USER=postgres
DB_PASSWORD=rt_secret_password_123
DB_NAME=sistem_rt

# URL internal docker (biarkan default):
DATABASE_URL=postgresql://postgres:rt_secret_password_123@postgres:5432/sistem_rt

# URL Domain Publik Anda:
APP_ORIGIN=https://rt.domainanda.com
```

### Langkah 3: Jalankan Docker Compose
```bash
docker compose up -d --build
```
Periksa apakah container sudah jalan:
```bash
docker compose ps
```
Pastikan `sistem_rt_db` dan `sistem_rt_app` berstatus `Up`.

---

## 4. Konfigurasi Reverse Proxy & SSL di aaPanel

Agar web bisa diakses lewat domain `https://rt.domainanda.com`:

1. **Tambah Website di aaPanel:**
   - Masuk ke menu **Website** > klik **Add site**.
   - Masukkan Domain: `rt.domainanda.com` (samakan dengan domain Anda).
   - PHP Version: pilih **Pure Static** (karena backend dijalankan oleh Docker).
   - Klik **Submit**.

2. **Pasang SSL (HTTPS):**
   - Klik nama website yang baru dibuat > pilih tab **SSL**.
   - Pilih **Let's Encrypt** > centang domain > klik **Apply**.
   - Aktifkan **Force HTTPS**.

3. **Setting Reverse Proxy ke Docker:**
   - Di pengaturan website yang sama, klik tab **Reverse Proxy** > klik **Add Reverse Proxy**.
   - **Proxy Name:** `sistem_rt`
   - **Target URL:** `http://127.0.0.1:3005` *(sesuaikan dengan `APP_PORT` di file `.env`)*
   - **Sent Domain:** `$host`
   - Klik **Save**.

🎉 Sekarang website Anda sudah live dan dapat diakses dengan aman di browser!

---

## 5. Inisialisasi Database & Akun Admin

Jalankan perintah ini satu kali di terminal VPS untuk membuat akun Admin awal:

```bash
cd /www/wwwroot/catatan_rt
docker compose exec -it app npx tsx scripts/seed-admin.ts
```

Akun login bawaan:
- **Username:** `admin`
- **Password:** `admin123`
- **Role:** Admin RT (Akses Penuh)

---

## 6. Setup Auto Deploy Otomatis (GitHub Actions)

Setiap kali Anda push kode baru ke branch `main`, GitHub Actions akan otomatis mengupdate aplikasi di VPS tanpa downtime database.

### Masukkan Secrets di Repositori GitHub:
1. Buka repo GitHub: `https://github.com/MegonoComunity/sistem-rt`
2. Masuk ke tab **Settings** > **Secrets and variables** > **Actions** > klik **New repository secret**.
3. Tambahkan 3 secret berikut:
   - `HOST`: IP Public VPS Anda (contoh: `103.xxx.xxx.xxx`)
   - `USERNAME`: Username SSH VPS Anda (contoh: `root` atau `megonoserver`)
   - `SSH_PRIVATE_KEY`: Isi dengan Private Key SSH VPS (`id_rsa` / `id_ed25519`).
   - `SSH_PASSPHRASE`: *(Kosongkan jika private key tidak memakai passphrase)*

Setiap ada commit baru di `main`, workflow `.github/workflows/deploy.yml` akan otomatis berjalan! 🚀

---

## 7. Tips Maintenance & Troubleshooting

### Melihat Log Container
Jika aplikasi tidak bisa dibuka atau restart:
```bash
# Log aplikasi web
docker compose logs -f app

# Log database
docker compose logs -f postgres
```

### Database Aman Saat Update
Data PostgreSQL tersimpan di Docker Volume `sistem_rt_postgres_data`. Update kode, restart server, atau `docker compose down` **tidak akan menghapus data warga atau kas RT**.

### Backup Database Manual
Untuk mem-backup database ke file SQL:
```bash
docker compose exec -T postgres pg_dump -U postgres sistem_rt > backup_rt_$(date +%Y%m%d).sql
```
