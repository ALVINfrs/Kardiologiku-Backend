# Kardiologiku-Backend (Dokumentasi Teknis Komprehensif)

Versi: 1.0.0

Dokumen ini menyediakan analisis teknis yang mendalam, panduan, dan dokumentasi API lengkap untuk **Kardiologiku-Backend**.

---

## 1. Deskripsi & Arsitektur Proyek

**Kardiologiku-Backend** adalah sebuah sistem API (Application Programming Interface) berbasis Node.js dan TypeScript yang berfungsi sebagai tulang punggung (backend) untuk aplikasi kesehatan jantung "Kardiologiku". API ini dirancang dengan arsitektur berlapis (*layered architecture*) untuk memastikan pemisahan tanggung jawab (*separation of concerns*), skalabilitas, dan kemudahan pemeliharaan.

### 1.1. Stack Teknologi

| Kategori          | Teknologi / Library | Kegunaan                                                              |
| :---------------- | :------------------ | :-------------------------------------------------------------------- |
| **Runtime**       | Node.js             | Lingkungan eksekusi JavaScript di sisi server.                        |
| **Bahasa**        | TypeScript          | Superset dari JavaScript dengan penambahan *static typing*.           |
| **Framework**     | Express.js          | Framework web minimalis untuk membangun API dan routing.              |
| **Database**      | MySQL (via `mysql2`)| Sistem manajemen database relasional untuk menyimpan semua data.      |
| **Autentikasi**   | JWT (`jsonwebtoken`)| Implementasi otentikasi stateless menggunakan JSON Web Tokens.        |
| **Keamanan**      | `bcryptjs`          | Hashing password pengguna sebelum disimpan ke database.               |
| **Penjadwalan**   | `node-cron`         | Menjalankan tugas terjadwal (misal: cek stok obat, laporan mingguan). |
| **Development**   | `nodemon`, `ts-node`| Auto-reload server saat ada perubahan kode untuk pengembangan.        |
| **Lainnya**       | `dotenv`, `cors`    | Manajemen variabel lingkungan dan Cross-Origin Resource Sharing.      |

### 1.2. Struktur Direktori Proyek

Struktur direktori dirancang untuk memisahkan logika berdasarkan fungsinya.

```
/src
├── /config
│   └── database.ts       # Konfigurasi dan inisialisasi koneksi database.
├── /controllers
│   └── *.ts              # Mengatur alur request-response HTTP. Menerima input, memanggil service, dan mengirimkan response.
├── /middleware
│   ├── authMiddleware.ts   # Middleware untuk verifikasi token JWT (Protect).
│   └── adminMiddleware.ts  # Middleware untuk verifikasi peran admin (isAdmin).
├── /models
│   └── *.ts              # Representasi data dan logika interaksi langsung dengan tabel database (Query, Create, Update, Delete).
├── /routes
│   └── *.ts              # Mendefinisikan semua endpoint API, method HTTP, dan menghubungkannya ke controller yang sesuai.
├── /services
│   ├── cronJobs.ts       # Logika untuk semua tugas terjadwal (cron jobs).
│   └── notificationService.ts # (Contoh) Service terpusat untuk membuat notifikasi.
├── /types
│   └── express/index.d.ts # Deklarasi tipe global untuk memperluas object Request di Express.
└── server.ts             # Titik masuk utama aplikasi. Menginisialisasi Express, middleware, dan routes.
```

---

## 2. Panduan Instalasi & Konfigurasi

### 2.1. Prasyarat
- Node.js (v18+)
- Server MySQL
- Git

### 2.2. Langkah-langkah Instalasi
1.  **Clone Repositori**
    ```bash
    git clone https://github.com/username/kardiologiku-backend.git
    cd kardiologiku-backend
    ```
2.  **Install Dependensi**
    ```bash
    npm install
    ```
3.  **Setup Database**
    - Buka terminal MySQL atau GUI database Anda.
    - Buat database baru untuk proyek ini.
      ```sql
      CREATE DATABASE kardiologiku_db;
      ```
    - Impor skema tabel dari file `schema.sql` (jika disediakan).

4.  **Konfigurasi Variabel Lingkungan**
    - Buat file bernama `.env` di direktori root proyek.
    - Salin dan tempel konten di bawah ini ke dalam file `.env`, lalu sesuaikan nilainya.

    ```env
    # PORT server akan berjalan
    PORT=5000

    # Konfigurasi koneksi ke database MySQL Anda
    DB_HOST=localhost
    DB_USER=root
    DB_PASSWORD=your_mysql_password
    DB_NAME=kardiologiku_db

    # Kunci rahasia yang sangat kuat untuk menandatangani JWT
    # Ganti dengan string acak yang panjang dan kompleks
    JWT_SECRET=your_super_secret_and_long_jwt_key
    ```

### 2.3. Menjalankan Aplikasi
-   **Mode Pengembangan (disarankan untuk development)**:
    ```bash
    npm run dev
    ```
    Server akan otomatis restart setiap kali ada perubahan pada file `.ts`.

-   **Mode Produksi**:
    ```bash
    # 1. Kompilasi TypeScript ke JavaScript (output di direktori /dist)
    npm run build

    # 2. Jalankan aplikasi dari file JavaScript yang sudah di-build
    npm start
    ```

---

## 3. Aspek Keamanan

Sistem ini menerapkan beberapa lapisan keamanan standar untuk API web.

-   **Hashing Password**: Password pengguna tidak pernah disimpan sebagai teks biasa. Library `bcryptjs` digunakan untuk melakukan hashing password dengan *salt* sebelum menyimpannya ke database. Proses verifikasi login membandingkan hash dari password yang diinput dengan hash yang tersimpan.

-   **Autentikasi dengan JWT**:
    1.  Saat login berhasil, server menghasilkan sebuah JSON Web Token (JWT) yang ditandatangani menggunakan `JWT_SECRET`.
    2.  Token ini memiliki masa berlaku (`expiresIn: '1h'`) dan dikirim ke klien.
    3.  Untuk setiap request ke endpoint yang terproteksi, klien wajib menyertakan token ini di header `Authorization` dengan format `Bearer <token>`.

-   **Middleware Proteksi (`protect`)**:
    -   Middleware ini dieksekusi sebelum controller pada rute yang terproteksi.
    -   Tugasnya adalah memeriksa keberadaan dan validitas token JWT dari header.
    -   Jika token valid, payload-nya (yang berisi info user seperti `id`) akan diekstrak dan disimpan di `req.user`, sehingga bisa diakses oleh controller.
    -   Jika token tidak ada, tidak valid, atau kedaluwarsa, middleware akan menghentikan request dan mengirim response `401 Unauthorized`.

-   **Otorisasi Berbasis Peran (`isAdmin`)**:
    -   Middleware ini digunakan setelah `protect` pada rute yang hanya boleh diakses oleh admin.
    -   Setelah `protect` memvalidasi token dan mendapatkan `userId`, `isAdmin` akan melakukan query ke database untuk memeriksa kolom `role` pada user tersebut.
    -   Jika `role` adalah `'admin'`, request akan dilanjutkan. Jika tidak, response `403 Forbidden` akan dikirim.

---

## 4. Alur Kerja & Logika Bisnis

### 4.1. Algoritma Penentuan Slot Janji Temu (`/doctors/:id/slots`)
Logika ini bertujuan untuk menampilkan slot waktu yang benar-benar tersedia pada tanggal yang dipilih pengguna.

1.  **Input**: `doctorId` dan `date` (format YYYY-MM-DD).
2.  **Ambil Jadwal Umum**: Sistem mengambil jadwal kerja umum dokter dari tabel `doctor_availability` berdasarkan `doctorId` dan hari dalam seminggu (misal: Senin, 09:00 - 17:00).
3.  **Ambil Janji Temu Terjadwal**: Sistem mengambil semua janji temu yang sudah ada untuk dokter tersebut pada tanggal yang dipilih dari tabel `appointments`.
4.  **Iterasi & Eliminasi**:
    - Sistem membuat daftar slot waktu potensial dengan melakukan iterasi dari `start_time` hingga `end_time` jadwal umum dokter, dengan interval 30 menit (durasi konsultasi).
    - Setiap slot waktu potensial kemudian dibandingkan dengan daftar janji temu yang sudah ada.
    - Jika sebuah slot waktu sudah ada di dalam daftar janji temu, slot tersebut akan dihilangkan dari daftar slot tersedia.
5.  **Output**: Array berisi string waktu (`['10:00', '10:30', '14:00', ...]`) yang tersedia untuk di-booking.

### 4.2. Proses Latar Belakang (Cron Jobs)
Sistem menggunakan `node-cron` untuk menjalankan tugas-tugas pemeliharaan dan notifikasi secara otomatis.

-   **Pengecekan Stok Obat Harian**:
    -   **Jadwal**: Berjalan setiap hari pukul 08:00 pagi (`'0 8 * * *'`).
    -   **Proses**:
        1.  Melakukan query ke tabel `medications` untuk mencari semua obat yang `stock`-nya di bawah ambang batas (misal, <= 5).
        2.  Untuk setiap obat yang ditemukan, sistem akan memanggil `NotificationService` untuk membuat notifikasi di database bagi `user_id` pemilik obat tersebut.
        3.  Pesan notifikasi: `"Peringatan: Stok obat "NamaObat" Anda akan segera habis."`

-   **Pembuatan Laporan Kesehatan Mingguan**:
    -   **Jadwal**: Berjalan setiap hari Minggu pukul 20:00 malam (`'0 20 * * 0'`).
    -   **Proses**:
        1.  Mengambil daftar semua `user_id` dari tabel `users`.
        2.  Untuk setiap pengguna, sistem menghitung data kesehatan rata-rata (tekanan darah, detak jantung) selama 7 hari terakhir (Senin-Minggu).
        3.  Sebuah teks ringkasan (misal: "Tekanan darah Anda dalam rentang yang baik.") dibuat berdasarkan hasil rata-rata.
        4.  Hasil kalkulasi dan ringkasan disimpan atau diperbarui di tabel `weekly_reports`.
        5.  Sebuah notifikasi dikirim ke pengguna untuk memberitahu bahwa laporan mingguan mereka telah siap.

---

## 5. Dokumentasi API (Detail)

### Modul: Autentikasi (`/api/auth`)

#### `POST /api/auth/register`
Mendaftarkan pengguna baru ke dalam sistem.

-   **Request Body**: `application/json`
    ```json
    {
      "name": "Alvin",
      "email": "alvin.doe@example.com",
      "password": "password123"
    }
    ```
    - `name` (string, required): Nama lengkap pengguna.
    - `email` (string, required, unique): Alamat email yang valid.
    - `password` (string, required): Password, minimal 6 karakter (disarankan).

-   **Success Response (201 Created)**
    ```json
    {
      "message": "Registrasi berhasil"
    }
    ```

-   **Error Responses**:
    - `400 Bad Request`: Jika ada field yang kosong.
      ```json
      { "message": "Semua field harus diisi" }
      ```
    - `409 Conflict`: Jika email sudah terdaftar.
      ```json
      { "message": "Email sudah terdaftar" }
      ```
    - `500 Internal Server Error`: Jika terjadi kegagalan di server.
      ```json
      { "message": "Terjadi kesalahan pada server" }
      ```

#### `POST /api/auth/login`
Mengautentikasi pengguna dan mengembalikan token JWT.

-   **Request Body**: `application/json`
    ```json
    {
      "email": "alvin.doe@example.com",
      "password": "password123"
    }
    ```

-   **Success Response (200 OK)**
    ```json
    {
      "message": "Login berhasil",
      "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNzE1ODAwNDAwLCJleHAiOjE3MTU4MDQwMDB9.some_signature"
    }
    ```

-   **Error Responses**:
    - `400 Bad Request`: Jika email atau password kosong.
    - `401 Unauthorized`: Jika kredensial tidak valid.
      ```json
      { "message": "Email atau password salah" }
      ```

---
### Modul: Data Kesehatan (`/api/health`)

#### `GET /api/health`
Mendapatkan seluruh riwayat data kesehatan milik pengguna yang sedang login.

-   **Headers**:
    - `Authorization: Bearer <token>` (required)

-   **Success Response (200 OK)**
    ```json
    [
      {
        "id": 1,
        "user_id": 1,
        "systolic_pressure": 120,
        "diastolic_pressure": 80,
        "heart_rate": 75,
        "activity_level": "Sedang",
        "created_at": "2025-09-13T10:00:00.000Z"
      },
      {
        "id": 2,
        "user_id": 1,
        "systolic_pressure": 122,
        "diastolic_pressure": 81,
        "heart_rate": 78,
        "activity_level": "Ringan",
        "created_at": "2025-09-12T09:30:00.000Z"
      }
    ]
    ```

-   **Error Responses**:
    - `401 Unauthorized`: Jika token tidak valid atau tidak ada.

*(Endpoint lainnya akan mengikuti format detail yang sama...)*
