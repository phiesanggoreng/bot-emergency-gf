# Kabarin Bot - MVP
**One-Click Check-in untuk Kontak Terpercaya**

Sistem check-in personal berbasis Telegram Bot dan dashboard web untuk memberi kabar kondisi kepada kontak terpercaya hanya dengan sekali klik (saat sedang sakit, istirahat, atau kondisi emergency).

## Struktur Repositori

Proyek ini menggunakan arsitektur monorepo sederhana yang terbagi menjadi dua bagian:

- `frontend/`: Aplikasi Dashboard berbasis **Next.js (App Router) + Tailwind CSS + TypeScript**
- `backend/`: API dan Bot Telegram berbasis **NestJS + Prisma (PostgreSQL) + TypeScript**

## Kebutuhan Sistem

- Node.js (v18+)
- npm (atau yarn/pnpm)
- Docker & Docker Compose (untuk database PostgreSQL lokal)
- Akun Telegram (untuk token Bot dari BotFather)

## Cara Menjalankan secara Lokal

1. **Clone Repositori & Install Dependencies**
   ```bash
   git clone https://github.com/phiesanggoreng/bot-emergency-gf.git
   cd bot-gf

   # Install frontend
   cd frontend
   npm install

   # Install backend
   cd ../backend
   npm install
   ```

2. **Jalankan Database PostgreSQL**
   Dari root direktori, jalankan:
   ```bash
   docker-compose up -d
   ```

3. **Konfigurasi Environment Variables**
   - Di `frontend/`, copy `.env.example` ke `.env.local` dan sesuaikan nilainya.
   - Di `backend/`, copy `.env.example` ke `.env` dan isi token Telegram bot kamu (`TELEGRAM_BOT_TOKEN`) serta config database.

4. **Jalankan Migrasi Database**
   ```bash
   cd backend
   npx prisma migrate dev --name init
   ```

5. **Jalankan Server**
   Buka dua terminal:
   
   **Terminal 1 (Backend):**
   ```bash
   cd backend
   npm run start:dev
   ```
   
   **Terminal 2 (Frontend):**
   ```bash
   cd frontend
   npm run dev
   ```

## Konfigurasi Deployment (Vercel & Railway)

### Frontend (Vercel)
Aplikasi Next.js ini dapat di-deploy ke Vercel tanpa konfigurasi tambahan (zero-config).
1. Hubungkan repository GitHub ke Vercel.
2. Tambahkan domain kustom: `mysweety.my.id`.
3. Set Environment Variable: `NEXT_PUBLIC_API_URL` (URL dari backend di Railway).

### Backend (Railway)
Backend NestJS akan menggunakan Railway untuk deployment API dan database.
1. Hubungkan repository GitHub ke Railway.
2. Tambahkan plugin **PostgreSQL** di project Railway.
3. Railway akan membaca file `railway.toml` untuk proses build dan start.
4. Set Environment Variables di Railway:
   - `DATABASE_URL` (Berasal dari PostgreSQL Railway)
   - `TELEGRAM_BOT_TOKEN`
   - `JWT_SECRET`
   - `FRONTEND_URL` (https://mysweety.my.id)

---
*Dibuat untuk memenuhi MVP Kabarin Bot.*
