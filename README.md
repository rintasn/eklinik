# 🏥 Klinik Pratama — Sistem Informasi Manajemen Klinik

Aplikasi manajemen klinik berbasis web modern untuk **Klinik Pratama**, dibangun dengan Next.js, Prisma ORM, PostgreSQL, dan Shadcn UI. Sistem ini mencakup seluruh alur pelayanan pasien mulai dari pendaftaran online, antrian, pemeriksaan dokter, farmasi, hingga pembayaran — dilengkapi manajemen stok, fasilitas, dan penjadwalan tenaga medis.

---

## 📋 Daftar Isi

- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Arsitektur Sistem](#-arsitektur-sistem)
- [Prasyarat](#-prasyarat)
- [Instalasi & Setup](#-instalasi--setup)
- [Konfigurasi Environment](#-konfigurasi-environment)
- [Struktur Database](#-struktur-database)
- [Struktur Proyek](#-struktur-proyek)
- [Modul Aplikasi](#-modul-aplikasi)
- [Keamanan API](#-keamanan-api)
- [Performa & Skalabilitas](#-performa--skalabilitas)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Pengujian](#-pengujian)
- [Deployment](#-deployment)
- [Kontribusi](#-kontribusi)

---

## ✨ Fitur Utama

### 👥 Pasien & Front Office
- **Pendaftaran Online** — Registrasi mandiri via web, verifikasi nomor identitas & kontak
- **Sistem Antrian Digital** — Nomor antrian otomatis, estimasi waktu tunggu real-time
- **Front Office Dashboard** — Manajemen kedatangan pasien, check-in, dan triage awal

### 🏥 Pelayanan Medis
- **Poli Pendaftaran** — Verifikasi data pasien, pencatatan keluhan awal, triase
- **Ruang Dokter** — SOAP notes, rekam medis elektronik, resep digital, rujukan
- **Apotik** — Validasi resep, dispensing obat, riwayat pengambilan obat

### 💊 Farmasi & Logistik
- **Manajemen Stok Obat** — Stok masuk/keluar, expired date tracking, reorder alert
- **Stok Alat Kesehatan** — Inventaris alkes, pemeliharaan, dan kalibrasi
- **Manajemen Fasilitas** — Pemeliharaan ruangan, peralatan klinik, dan aset

### 📅 Penjadwalan
- **Jadwal Dokter** — Manajemen shift, spesialisasi, dan kapasitas per sesi
- **Jadwal Perawat** — Penugasan perawat per poli, rotasi shift, dan tracking kehadiran

### 💳 Keuangan
- **Modul Pembayaran** — Multi-metode (tunai, BPJS, asuransi, transfer), cetak kuitansi
- **Laporan Keuangan** — Rekap harian, bulanan, dan per layanan

---

## 🛠 Tech Stack

| Layer | Teknologi |
|---|---|
| **Frontend** | Next.js 15 (App Router), React 19, TypeScript |
| **UI Components** | Shadcn UI, Tailwind CSS, Radix UI |
| **Backend** | Next.js API Routes (Route Handlers) |
| **ORM** | Prisma ORM |
| **Database** | PostgreSQL 16 |
| **Autentikasi** | NextAuth.js v5 (Auth.js) |
| **Validasi** | Zod |
| **State Management** | Zustand + React Query (TanStack Query) |
| **Real-time** | Server-Sent Events / WebSocket (antrian) |
| **Caching** | Redis (via Upstash atau self-hosted) |
| **Rate Limiting** | `@upstash/ratelimit` atau `express-rate-limit` |
| **Logging** | Pino + Winston |
| **Testing** | Vitest, React Testing Library, Playwright |
| **Containerization** | Docker + Docker Compose |

---

## 🏗 Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                        │
│  Browser / PWA (Next.js App Router + Shadcn UI)             │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS + JWT / Session Cookie
┌────────────────────────────▼────────────────────────────────┐
│                       API LAYER (Next.js)                    │
│  Route Handlers (/api/v1/*)                                  │
│  Middleware: Auth → Rate Limit → Validate → RBAC → Handler  │
└──────┬─────────────────────┬──────────────────────┬─────────┘
       │                     │                      │
┌──────▼──────┐   ┌──────────▼──────┐   ┌──────────▼────────┐
│  Prisma ORM │   │  Redis Cache    │   │  External Service │
│  (Query     │   │  (Session /     │   │  (SMS, Email,     │
│   Builder)  │   │   Rate Limit /  │   │   BPJS API, dll)  │
└──────┬──────┘   │   Antrian TTL)  │   └───────────────────┘
       │          └─────────────────┘
┌──────▼──────────────────────────────┐
│          PostgreSQL 16              │
│  (Row-Level Security + Audit Log)   │
└─────────────────────────────────────┘
```

---

## ✅ Prasyarat

Pastikan sudah terinstal:

- **Node.js** `>= 20.x` (LTS)
- **pnpm** `>= 9.x` *(direkomendasikan)* atau npm/yarn
- **PostgreSQL** `>= 16.x`
- **Redis** `>= 7.x` *(opsional, untuk caching & antrian)*
- **Docker & Docker Compose** *(opsional, untuk kontainerisasi)*

---

## 🚀 Instalasi & Setup

### 1. Clone Repositori

```bash
git clone https://github.com/your-org/klinik-pratama.git
cd klinik-pratama
```

### 2. Instal Dependensi

```bash
pnpm install
```

### 3. Salin File Environment

```bash
cp .env.example .env
```

Sesuaikan nilai di `.env` (lihat bagian [Konfigurasi Environment](#-konfigurasi-environment)).

### 4. Setup Database

```bash
# Jalankan migrasi database
pnpm prisma migrate dev --name init

# Jalankan seed data awal (role, unit, dll)
pnpm prisma db seed
```

### 5. Generate Prisma Client

```bash
pnpm prisma generate
```

### 6. Jalankan Aplikasi (Mode Development)

```bash
pnpm dev
```

Aplikasi akan berjalan di: `http://localhost:3000`

---

## ⚙️ Konfigurasi Environment

Buat file `.env` di root proyek berdasarkan `.env.example` berikut:

```dotenv
# ─── DATABASE ───────────────────────────────────────────────
PG_HOST=202.155.157.83
PG_PORT=5432
PG_USER=kki
PG_PASSWORD=User@mis1
PG_DATABASE=db_klinik

# Prisma Database URL (dibangun otomatis dari variabel di atas)
DATABASE_URL="postgresql://${PG_USER}:${PG_PASSWORD}@${PG_HOST}:${PG_PORT}/${PG_DATABASE}?schema=public&connection_limit=10&pool_timeout=20"

# ─── AUTENTIKASI ─────────────────────────────────────────────
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=ganti_dengan_secret_32_karakter_acak   # openssl rand -base64 32

# ─── KEAMANAN ────────────────────────────────────────────────
JWT_SECRET=ganti_dengan_jwt_secret_minimal_256bit
ENCRYPTION_KEY=ganti_dengan_kunci_enkripsi_aes256      # 32 bytes hex

# ─── REDIS (Opsional — untuk rate limit & antrian) ───────────
REDIS_URL=redis://localhost:6379

# ─── EMAIL / NOTIFIKASI dan OTP Pendaftaran ──────────────────────────────────────
Username:	rinta@rabtech.co.id
Password:	Rf=ck2UwSdr]bS&b
Incoming Server:	mail.rabtech.co.id
IMAP Port: 993 POP3 Port: 995
Outgoing Server:	mail.rabtech.co.id
SMTP Port: 465
IMAP, POP3, and SMTP require authentication.


# ─── APLIKASI ────────────────────────────────────────────────
NEXT_PUBLIC_APP_NAME="Klinik Pratama"
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# ─── LOGGING ─────────────────────────────────────────────────
LOG_LEVEL=info        # debug | info | warn | error
```

> ⚠️ **Penting:** Jangan commit file `.env` ke repositori. Pastikan `.env` sudah ada di `.gitignore`.

---

## 🗄 Struktur Database

Skema database dikelola oleh **Prisma ORM**. Berikut modul utama beserta entitas terkait:

```
┌────────────────┐    ┌─────────────────┐    ┌──────────────────┐
│    Pasien      │───▶│   Pendaftaran   │───▶│  Antrian         │
│  (identitas,  │    │  (poli, dokter, │    │  (nomor, status, │
│   kontak, NIK)│    │   tanggal)      │    │   waktu panggil) │
└────────────────┘    └─────────────────┘    └──────────────────┘
                               │
              ┌────────────────┼─────────────────┐
              ▼                ▼                 ▼
    ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐
    │ Rekam Medis  │  │    Resep     │  │   Pembayaran    │
    │ (SOAP, ICD) │  │  (item obat, │  │  (tagihan,      │
    │             │  │   dosis)     │  │   metode, BPJS) │
    └──────────────┘  └──────┬───────┘  └─────────────────┘
                             ▼
                   ┌──────────────────┐
                   │   Stok Obat &    │
                   │   Alat Kesehatan │
                   └──────────────────┘

┌──────────────────────────────────────────────────────────┐
│                  MASTER DATA                             │
│  Dokter | Perawat | Poli | Jadwal | Fasilitas | Tarif   │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                   SISTEM                                 │
│  User | Role | Permission | AuditLog | Notification     │
└──────────────────────────────────────────────────────────┘
```

### Contoh Skema Prisma Utama

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── PASIEN ──────────────────────────────────────────────────
model Pasien {
  id            String        @id @default(cuid())
  noRekamMedis  String        @unique
  nik           String        @unique
  nama          String
  tanggalLahir  DateTime
  jenisKelamin  JenisKelamin
  alamat        String
  telepon       String
  email         String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  pendaftarans  Pendaftaran[]
  rekamMedis    RekamMedis[]

  @@index([nik])
  @@index([noRekamMedis])
}

// ─── PENDAFTARAN ─────────────────────────────────────────────
model Pendaftaran {
  id          String             @id @default(cuid())
  pasienId    String
  poliId      String
  dokterId    String
  jadwalId    String
  tanggal     DateTime
  status      StatusPendaftaran  @default(MENUNGGU)
  sumber      SumberPendaftaran  @default(ONLINE)
  createdAt   DateTime           @default(now())

  pasien      Pasien             @relation(fields: [pasienId], references: [id])
  poli        Poli               @relation(fields: [poliId], references: [id])
  dokter      Dokter             @relation(fields: [dokterId], references: [id])
  jadwal      JadwalDokter       @relation(fields: [jadwalId], references: [id])
  antrian     Antrian?
  rekamMedis  RekamMedis?
  pembayaran  Pembayaran?

  @@index([tanggal, poliId])
  @@index([pasienId])
}

// ─── ANTRIAN ─────────────────────────────────────────────────
model Antrian {
  id             String         @id @default(cuid())
  pendaftaranId  String         @unique
  nomorAntrian   Int
  status         StatusAntrian  @default(MENUNGGU)
  dipanggil      DateTime?
  selesai        DateTime?

  pendaftaran    Pendaftaran    @relation(fields: [pendaftaranId], references: [id])
}

// ─── REKAM MEDIS ─────────────────────────────────────────────
model RekamMedis {
  id             String       @id @default(cuid())
  pasienId       String
  pendaftaranId  String       @unique
  dokterId       String
  subjektif      String       @db.Text
  objektif       String       @db.Text
  assessment     String       @db.Text
  plan           String       @db.Text
  diagnosaICD    String[]
  createdAt      DateTime     @default(now())

  pasien         Pasien       @relation(fields: [pasienId], references: [id])
  pendaftaran    Pendaftaran  @relation(fields: [pendaftaranId], references: [id])
  dokter         Dokter       @relation(fields: [dokterId], references: [id])
  resep          Resep[]

  @@index([pasienId, createdAt])
}

// ─── RESEP & STOK OBAT ───────────────────────────────────────
model Resep {
  id           String      @id @default(cuid())
  rekamMedisId String
  status       StatusResep @default(MENUNGGU)
  createdAt    DateTime    @default(now())

  rekamMedis   RekamMedis  @relation(fields: [rekamMedisId], references: [id])
  items        ResepItem[]
}

model ResepItem {
  id       String  @id @default(cuid())
  resepId  String
  obatId   String
  jumlah   Int
  aturan   String  // "3x1 sesudah makan"
  catatan  String?

  resep    Resep   @relation(fields: [resepId], references: [id])
  obat     Obat    @relation(fields: [obatId], references: [id])
}

model Obat {
  id            String      @id @default(cuid())
  kode          String      @unique
  nama          String
  satuan        String
  stok          Int         @default(0)
  stokMinimum   Int         @default(10)
  hargaBeli     Decimal     @db.Decimal(12, 2)
  hargaJual     Decimal     @db.Decimal(12, 2)
  expiredDate   DateTime?
  updatedAt     DateTime    @updatedAt

  resepItems    ResepItem[]
  stokLogs      StokLog[]

  @@index([stok])
}

// ─── JADWAL DOKTER & PERAWAT ─────────────────────────────────
model JadwalDokter {
  id          String        @id @default(cuid())
  dokterId    String
  poliId      String
  hari        HariKerja
  jamMulai    String        // "08:00"
  jamSelesai  String        // "12:00"
  kuota       Int           @default(20)
  aktif       Boolean       @default(true)

  dokter      Dokter        @relation(fields: [dokterId], references: [id])
  poli        Poli          @relation(fields: [poliId], references: [id])
  pendaftarans Pendaftaran[]

  @@unique([dokterId, poliId, hari, jamMulai])
}

model JadwalPerawat {
  id          String     @id @default(cuid())
  perawatId   String
  poliId      String
  tanggal     DateTime
  shift       Shift
  createdAt   DateTime   @default(now())

  perawat     Perawat    @relation(fields: [perawatId], references: [id])
  poli        Poli       @relation(fields: [poliId], references: [id])

  @@unique([perawatId, tanggal, shift])
  @@index([tanggal, poliId])
}

// ─── ENUMS ───────────────────────────────────────────────────
enum JenisKelamin   { LAKI_LAKI PEREMPUAN }
enum StatusPendaftaran { MENUNGGU DIPERIKSA SELESAI BATAL }
enum SumberPendaftaran { ONLINE OFFLINE }
enum StatusAntrian  { MENUNGGU DIPANGGIL SELESAI BATAL }
enum StatusResep    { MENUNGGU DIPROSES SELESAI }
enum HariKerja     { SENIN SELASA RABU KAMIS JUMAT SABTU }
enum Shift          { PAGI SIANG MALAM }
```

---

## 📁 Struktur Proyek

```
klinik-pratama/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Route group: halaman autentikasi
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/              # Route group: dashboard (protected)
│   │   ├── layout.tsx            # Layout dengan sidebar & auth guard
│   │   ├── front-office/         # 🖥  Front Office
│   │   ├── pendaftaran/          # 📋 Poli Pendaftaran
│   │   ├── dokter/               # 🩺 Ruang Dokter
│   │   ├── apotik/               # 💊 Apotik
│   │   ├── pembayaran/           # 💳 Kasir / Pembayaran
│   │   ├── stok/                 # 📦 Stok Obat & Alkes
│   │   ├── fasilitas/            # 🏗  Fasilitas Klinik
│   │   ├── jadwal/
│   │   │   ├── dokter/           # 📅 Jadwal Dokter
│   │   │   └── perawat/          # 👩‍⚕️ Jadwal Perawat
│   │   └── laporan/              # 📊 Laporan & Statistik
│   ├── api/
│   │   └── v1/                   # REST API versioned
│   │       ├── auth/
│   │       ├── pasien/
│   │       ├── pendaftaran/
│   │       ├── antrian/
│   │       ├── rekam-medis/
│   │       ├── resep/
│   │       ├── obat/
│   │       ├── pembayaran/
│   │       ├── jadwal/
│   │       └── laporan/
│   └── daftar-online/            # 🌐 Halaman publik pendaftaran online
│
├── components/
│   ├── ui/                       # Shadcn UI components (auto-generated)
│   ├── layout/                   # Sidebar, Navbar, Breadcrumb
│   ├── antrian/                  # Komponen display antrian
│   ├── forms/                    # Form pasien, resep, dll
│   └── shared/                   # DataTable, Modal, Badge, dll
│
├── lib/
│   ├── auth.ts                   # NextAuth config
│   ├── prisma.ts                 # Prisma client singleton
│   ├── redis.ts                  # Redis client
│   ├── validations/              # Zod schemas
│   ├── middlewares/              # Rate limit, RBAC, audit log
│   ├── encryption.ts             # AES-256 untuk data sensitif
│   └── utils.ts
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── hooks/                        # Custom React hooks
├── store/                        # Zustand stores
├── types/                        # TypeScript type definitions
├── public/
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── next.config.ts
├── tailwind.config.ts
└── package.json
```

---

## 📦 Modul Aplikasi

### 🖥️ Front Office
- Check-in pasien (QR code / manual)
- Monitor antrian real-time
- Manajemen pendaftaran walk-in

### 📋 Poli Pendaftaran
- Verifikasi data pasien
- Pencatatan tanda vital (tensi, berat, tinggi, suhu)
- Pengarahan ke poli & dokter yang tepat

### 🩺 Ruang Dokter
- SOAP notes (Subjective, Objective, Assessment, Plan)
- Rekam medis terintegrasi (riwayat kunjungan)
- Penerbitan resep elektronik
- Surat rujukan (internal & eksternal)
- Coding diagnosa ICD-10

### 💊 Apotik
- Penerimaan & validasi resep
- Dispensing obat dengan konfirmasi stok
- Riwayat pengambilan obat pasien
- Alert obat hampir habis / expired

### 💳 Kasir / Pembayaran
- Kalkulasi tagihan otomatis (tarif poli + obat + tindakan)
- Metode: tunai, transfer, BPJS, asuransi swasta
- Cetak kuitansi & invoice
- Rekap harian kasir

### 📦 Stok Obat & Alat Kesehatan
- Penerimaan barang (purchase order)
- Stok keluar otomatis saat dispensing
- Pelacakan expired date
- Alert stok minimum & reorder
- Laporan mutasi stok

### 🏗️ Manajemen Fasilitas
- Inventaris ruangan & peralatan
- Jadwal pemeliharaan berkala
- Log kerusakan & perbaikan
- Status ketersediaan ruang

### 📅 Jadwal Dokter
- Setup jadwal mingguan per dokter per poli
- Manajemen kuota pasien per sesi
- Penggantian dokter / jadwal off
- Integrasi dengan pendaftaran online

### 👩‍⚕️ Jadwal Perawat
- Penugasan perawat per poli per shift
- Rotasi jadwal mingguan/bulanan
- Tracking kehadiran
- Notifikasi jadwal ke perawat

---

## 🔐 Keamanan API

Aplikasi ini dirancang untuk memproses data kesehatan pribadi pasien (PII & PHI). Lapisan keamanan yang diterapkan:

### Autentikasi & Otorisasi
```typescript
// lib/middlewares/auth.middleware.ts

// 1. Session-based auth via NextAuth (HttpOnly Cookie)
// 2. JWT dengan expiry pendek (15 menit) + Refresh Token rotation
// 3. RBAC — Role-Based Access Control

const ROLES = {
  ADMIN:         ['*'],                           // Akses penuh
  FRONT_OFFICE:  ['pendaftaran:read', 'antrian:*'],
  DOKTER:        ['rekam-medis:*', 'resep:write'],
  PERAWAT:       ['rekam-medis:read', 'tanda-vital:write'],
  APOTEKER:      ['resep:read', 'obat:*'],
  KASIR:         ['pembayaran:*'],
  MANAJER_STOK:  ['stok:*', 'fasilitas:*'],
}
```

### Lapisan Middleware (urutan eksekusi)
```
Request
  → HTTPS/TLS (enforced)
  → CORS Policy (whitelist origin)
  → Rate Limiting (per IP & per user)
  → Authentication (session / JWT verify)
  → RBAC Authorization
  → Input Validation (Zod)
  → Business Logic
  → Audit Logging
  → Response Sanitization
```

### Enkripsi Data Sensitif
```typescript
// lib/encryption.ts
// NIK, nomor telepon, alamat pasien dienkripsi AES-256-GCM sebelum disimpan ke DB
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto'

export function encryptField(plaintext: string): string { ... }
export function decryptField(ciphertext: string): string { ... }
```

### Keamanan Database
```sql
-- Aktifkan Row Level Security di PostgreSQL
ALTER TABLE "RekamMedis" ENABLE ROW LEVEL SECURITY;

-- Hanya dokter yang menangani dapat membaca rekam medis
CREATE POLICY rekam_medis_dokter ON "RekamMedis"
  FOR SELECT USING (dokter_id = current_setting('app.current_user_id'));
```

### Checklist Keamanan
- [x] HTTPS enforced (HSTS header)
- [x] HttpOnly + Secure + SameSite cookie
- [x] CSRF protection (NextAuth built-in)
- [x] Input sanitization & Zod validation
- [x] SQL injection prevention (Prisma parameterized queries)
- [x] Rate limiting: 100 req/menit per IP, 30 req/menit per user
- [x] Data PHI terenkripsi AES-256-GCM
- [x] Audit log untuk semua aksi sensitif
- [x] Password hashing bcrypt (cost factor 12)
- [x] Dependency vulnerability scan (pnpm audit)
- [x] Environment secrets tidak di-commit (`.gitignore`)
- [x] Security headers via `next.config.ts` (CSP, X-Frame-Options)

---

## ⚡ Performa & Skalabilitas

### Database
```prisma
// Indeks strategis pada kolom pencarian & join paling sering digunakan
@@index([pasienId, createdAt])       // Riwayat rekam medis
@@index([tanggal, poliId])           // Query antrian & jadwal harian
@@index([nik])                       // Pencarian pasien by NIK
@@index([stok])                      // Alert stok minimum
```

### Caching Strategy
```
┌─────────────────────────────────────────────────────┐
│                  CACHING LAYERS                     │
├─────────────────────────────────────────────────────┤
│ L1: Next.js Fetch Cache    — Data statis (jadwal)   │
│ L2: Redis (TTL 5 menit)    — Antrian, stok, tarif   │
│ L3: React Query            — Client-side caching    │
│ L4: PostgreSQL Connection  — Pool: max 10 koneksi   │
└─────────────────────────────────────────────────────┘
```

### Optimasi Next.js
```typescript
// next.config.ts
const nextConfig = {
  experimental: {
    ppr: true,                    // Partial Pre-rendering
  },
  images: { formats: ['image/avif', 'image/webp'] },
  compress: true,
}
```

### Skalabilitas Horizontal
- **Stateless API** — Session disimpan di Redis, bukan memori server
- **Connection Pooling** — Prisma dengan `connection_limit=10` per instance
- **Antrian Job** — Background jobs (notifikasi SMS, laporan) via queue worker
- **Pagination** — Semua list endpoint menggunakan cursor-based pagination

---

## ▶️ Menjalankan Aplikasi

### Development

```bash
pnpm dev                    # Next.js dev server (http://localhost:3000)
pnpm prisma studio          # GUI database (http://localhost:5555)
```

### Production (Lokal)

```bash
pnpm build
pnpm start
```

### Dengan Docker Compose

```bash
# Jalankan semua layanan (Next.js + PostgreSQL + Redis)
docker-compose up -d

# Jalankan migrasi di dalam container
docker-compose exec app pnpm prisma migrate deploy
docker-compose exec app pnpm prisma db seed
```

**`docker-compose.yml`** (ringkasan):
```yaml
services:
  app:
    build: .
    ports: ["3000:3000"]
    environment:
      DATABASE_URL: postgresql://kki:User@mis1@db:5432/db_klinik
    depends_on: [db, redis]

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: kki
      POSTGRES_PASSWORD: User@mis1
      POSTGRES_DB: db_klinik
    volumes: [pgdata:/var/lib/postgresql/data]
    ports: ["5432:5432"]

  redis:
    image: redis:7-alpine
    ports: ["6379:6379"]

volumes:
  pgdata:
```

---

## 🧪 Pengujian

```bash
# Unit & Integration tests
pnpm test

# Watch mode
pnpm test:watch

# E2E tests (Playwright)
pnpm test:e2e

# Coverage report
pnpm test:coverage
```

Strategi pengujian:
- **Unit tests** — Validasi Zod, helper functions, business logic
- **Integration tests** — API route handlers dengan database test
- **E2E tests** — Alur kritikal: pendaftaran → antrian → periksa → bayar

---

## 🚢 Deployment

### Rekomendasi Stack Production

### Checklist Pre-Production
- [ ] Ganti semua secret di `.env` dengan nilai production yang kuat
- [ ] Aktifkan SSL/TLS dan konfigurasi HTTPS redirect
- [ ] Jalankan `pnpm prisma migrate deploy` (bukan `migrate dev`)
- [ ] Konfigurasi backup database otomatis (harian)
- [ ] Setup monitoring & alerting
- [ ] Load test dengan minimal 100 concurrent users
- [ ] Review Security Headers di [securityheaders.com](https://securityheaders.com)
- [ ] Aktifkan audit log ke storage permanen

---

## 🤝 Kontribusi

1. Fork repositori ini
2. Buat branch fitur: `git checkout -b feature/nama-fitur`
3. Commit perubahan: `git commit -m 'feat: tambah fitur X'`
4. Push ke branch: `git push origin feature/nama-fitur`
5. Buat Pull Request

Ikuti konvensi commit [Conventional Commits](https://www.conventionalcommits.org/).

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah lisensi **MIT**. Lihat file [LICENSE](LICENSE) untuk detail.

---

<div align="center">
  <p>Dibuat dengan ❤️ untuk <strong>Klinik Pratama</strong></p>
  <p>Next.js · Prisma · PostgreSQL · Shadcn UI</p>
</div>
