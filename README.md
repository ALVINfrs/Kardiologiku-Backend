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

### Modul: Makanan & Nutrisi (`/api/food`)

Semua endpoint dalam modul ini memerlukan autentikasi.

-   **Headers**: `Authorization: Bearer <token>` (required)

#### `GET /api/food/search`
Mencari makanan dari database global dan makanan kustom yang ditambahkan oleh pengguna.

-   **Query Parameters**:
    - `q` (string, optional): Kata kunci pencarian. Jika kosong, akan mengembalikan semua makanan kustom milik pengguna dan beberapa makanan global sebagai rekomendasi.

-   **Success Response (200 OK)**
    ```json
    [
      {
        "id": 101,
        "name": "Nasi Putih",
        "calories": 130,
        "sodium": 5,
        "potassium": 35,
        "fat": 0.3,
        "protein": 2.7,
        "carbs": 28,
        "category": "Pokok"
      },
      {
        "id": 552,
        "name": "Salad Buah Kustom",
        "calories": 150,
        "sodium": 10,
        // ... properti lainnya
        "user_id": 1 // Muncul jika ini makanan kustom
      }
    ]
    ```

#### `POST /api/food/custom`
Menambahkan entri makanan baru yang spesifik untuk pengguna (misal: resep pribadi).

-   **Request Body**: `application/json`
    ```json
    {
      "name": "Salad Buah Kustom",
      "calories": 150,
      "sodium": 10,
      "potassium": 200,
      "fat": 2,
      "protein": 1,
      "carbs": 35,
      "category": "Buah"
    }
    ```
    - `name`, `calories`, `sodium` adalah wajib.

-   **Success Response (201 Created)**
    ```json
    { "message": "Makanan kustom berhasil ditambahkan" }
    ```

-   **Error Response (400 Bad Request)**: Jika data wajib tidak diisi.

#### `POST /api/food/log`
Mencatat makanan yang dikonsumsi oleh pengguna pada tanggal dan waktu makan tertentu.

-   **Request Body**: `application/json`
    ```json
    {
      "food_id": 101,
      "meal_type": "Makan Siang",
      "portion": 1.5,
      "log_date": "2025-09-13"
    }
    ```
    - `food_id` (number, required): ID dari makanan (bisa dari global atau kustom).
    - `meal_type` (string, required): e.g., "Sarapan", "Makan Siang", "Makan Malam", "Camilan".
    - `portion` (number, optional, default: 1): Porsi yang dikonsumsi.
    - `log_date` (string, required): Tanggal konsumsi dalam format `YYYY-MM-DD`.

-   **Success Response (201 Created)**
    ```json
    { "message": "Makanan berhasil dicatat" }
    ```

#### `GET /api/food/log`
Mengambil riwayat catatan makanan pengguna untuk tanggal tertentu.

-   **Query Parameters**:
    - `date` (string, optional): Tanggal dalam format `YYYY-MM-DD`. Jika tidak disediakan, akan menggunakan tanggal hari ini.

-   **Success Response (200 OK)**
    ```json
    {
      "summary": {
        "total_calories": 1800,
        "total_sodium": 1200,
        // ... ringkasan nutrisi lainnya
      },
      "logs": [
        {
          "log_id": 1,
          "meal_type": "Sarapan",
          "food_name": "Roti Gandum",
          "calories": 150,
          "portion": 2
          // ... detail lainnya
        },
        {
          "log_id": 2,
          "meal_type": "Makan Siang",
          "food_name": "Nasi Putih",
          "calories": 260,
          "portion": 2
        }
      ]
    }
    ```

#### `DELETE /api/food/log/:logId`
Menghapus satu entri catatan makanan dari riwayat pengguna.

-   **URL Parameters**:
    - `logId` (number, required): ID dari catatan log makanan yang ingin dihapus.

-   **Success Response (200 OK)**
    ```json
    { "message": "Catatan makanan berhasil dihapus" }
    ```

-   **Error Response (404 Not Found)**: Jika `logId` tidak ditemukan atau bukan milik pengguna.

### Modul: Manajemen Obat (`/api/medications`)

Endpoint untuk mengelola daftar obat-obatan pribadi pengguna. Semua endpoint dalam modul ini memerlukan autentikasi.

-   **Headers**: `Authorization: Bearer <token>` (required)

#### `GET /api/medications`
Mengambil daftar semua obat yang terdaftar untuk pengguna yang sedang login.

-   **Success Response (200 OK)**
    ```json
    [
      {
        "id": 1,
        "user_id": 1,
        "name": "Aspirin",
        "dosage": "81mg",
        "stock": 50,
        "notes": "Minum setiap pagi setelah makan.",
        "created_at": "2025-09-10T08:00:00.000Z"
      },
      {
        "id": 2,
        "user_id": 1,
        "name": "Lisinopril",
        "dosage": "10mg",
        "stock": 25,
        "notes": "Minum sebelum tidur.",
        "created_at": "2025-09-10T08:05:00.000Z"
      }
    ]
    ```

#### `POST /api/medications`
Menambahkan obat baru ke dalam daftar pengguna.

-   **Request Body**: `application/json`
    ```json
    {
      "name": "Simvastatin",
      "dosage": "20mg",
      "stock": 30,
      "notes": "Minum malam hari."
    }
    ```
    - `name`, `dosage`, `stock` adalah wajib.

-   **Success Response (201 Created)**
    ```json
    { "message": "Obat berhasil ditambahkan" }
    ```

#### `PUT /api/medications/:medId`
Memperbarui detail obat yang sudah ada (misal: mengubah dosis, memperbarui stok).

-   **URL Parameters**:
    - `medId` (number, required): ID dari obat yang ingin diperbarui.
-   **Request Body**: `application/json` (kirim hanya field yang ingin diubah)
    ```json
    {
      "stock": 25,
      "notes": "Stok baru, minum setelah makan malam."
    }
    ```

-   **Success Response (200 OK)**
    ```json
    { "message": "Obat berhasil diperbarui" }
    ```

#### `DELETE /api/medications/:medId`
Menghapus obat dari daftar pengguna.

-   **URL Parameters**:
    - `medId` (number, required): ID dari obat yang ingin dihapus.

-   **Success Response (200 OK)**
    ```json
    { "message": "Obat berhasil dihapus" }
    ```

#### `POST /api/medications/:medId/log`
Mencatat bahwa pengguna telah meminum obat pada waktu tertentu. Aksi ini biasanya akan mengurangi `stock` sebanyak 1.

-   **URL Parameters**:
    - `medId` (number, required): ID dari obat yang diminum.

-   **Success Response (200 OK)**
    ```json
    { "message": "Obat berhasil dicatat telah diminum" }
    ```

### Modul: Dokter & Janji Temu (`/api/doctors`)

Menyediakan informasi mengenai dokter, ulasan, dan fungsionalitas untuk membuat janji temu.

#### `GET /api/doctors`
[Publik] Mengambil daftar semua dokter yang terdaftar di platform.

-   **Success Response (200 OK)**
    ```json
    [
      {
        "id": 1,
        "name": "Dr. Budi Santoso, Sp.JP",
        "specialization": "Kardiologi",
        "hospital": "RS Jantung Harapan Kita",
        "profile_picture_url": "https://example.com/images/dr_budi.jpg"
      }
    ]
    ```

#### `GET /api/doctors/:doctorId`
[Publik] Mengambil detail lengkap seorang dokter, termasuk rata-rata rating dan daftar ulasannya.

-   **URL Parameters**:
    - `doctorId` (number, required): ID dokter.

-   **Success Response (200 OK)**
    ```json
    {
      "id": 1,
      "name": "Dr. Budi Santoso, Sp.JP",
      "specialization": "Kardiologi",
      "hospital": "RS Jantung Harapan Kita",
      "about": "Dr. Budi adalah seorang spesialis jantung dengan pengalaman 15 tahun...",
      "average_rating": 4.8,
      "reviews": [
        {
          "reviewer_name": "Anisa",
          "rating": 5,
          "comment": "Penjelasan dokter sangat mudah dipahami.",
          "created_at": "2025-09-12T14:00:00.000Z"
        }
      ]
    }
    ```

#### `GET /api/doctors/:doctorId/slots`
[Publik] Mendapatkan daftar slot waktu yang tersedia untuk konsultasi dengan dokter pada tanggal tertentu.

-   **URL Parameters**:
    - `doctorId` (number, required): ID dokter.
-   **Query Parameters**:
    - `date` (string, required): Tanggal yang diinginkan dalam format `YYYY-MM-DD`.

-   **Success Response (200 OK)**
    ```json
    [
      "09:00",
      "09:30",
      "11:00",
      "14:00",
      "14:30"
    ]
    ```

#### `POST /api/doctors/:doctorId/reviews`
[Login Dibutuhkan] Menambahkan ulasan dan rating baru untuk seorang dokter.

-   **Headers**: `Authorization: Bearer <token>`
-   **URL Parameters**: `doctorId` (number, required)
-   **Request Body**: `application/json`
    ```json
    {
      "rating": 5,
      "comment": "Sangat puas dengan pelayanan Dr. Budi."
    }
    ```
    - `rating` (number, required): Angka antara 1 hingga 5.

-   **Success Response (201 Created)**
    ```json
    { "message": "Review added successfully" }
    ```

#### `POST /api/doctors/:doctorId/appointments`
[Login Dibutuhkan] Membuat jadwal janji temu baru dengan dokter.

-   **Headers**: `Authorization: Bearer <token>`
-   **URL Parameters**: `doctorId` (number, required)
-   **Request Body**: `application/json`
    ```json
    {
      "appointmentDate": "2025-09-20 11:00:00",
      "notes": "Ingin konsultasi hasil EKG terbaru."
    }
    ```
    - `appointmentDate` (string, required): Waktu janji temu yang pasti (diambil dari slot yang tersedia) dalam format `YYYY-MM-DD HH:MM:SS`.

-   **Success Response (201 Created)**
    ```json
    { "message": "Appointment booked successfully" }
    ```

#### `PUT /api/doctors/:doctorId/availability`
[Admin] Mengatur atau memperbarui jadwal ketersediaan mingguan seorang dokter.

-   **Headers**: `Authorization: Bearer <token>`
-   **URL Parameters**: `doctorId` (number, required)
-   **Request Body**: `application/json`
    ```json
    {
      "availability": [
        { "day_of_week": 1, "start_time": "09:00", "end_time": "17:00" }, // Senin
        { "day_of_week": 3, "start_time": "09:00", "end_time": "13:00" }  // Rabu
      ]
    }
    ```
    - `day_of_week`: 0 untuk Minggu, 1 untuk Senin, dst.

-   **Success Response (200 OK)**
    ```json
    { "message": "Doctor availability updated successfully" }
    ```

### Modul: Artikel Kesehatan (`/api/articles`)

Menyediakan akses ke artikel-artikel informatif seputar kesehatan jantung.

#### `GET /api/articles`
[Publik] Mengambil daftar semua artikel yang telah dipublikasikan. Respons hanya berisi data ringkas seperti judul, slug, dan ringkasan.

-   **Success Response (200 OK)**
    ```json
    [
      {
        "id": 1,
        "title": "10 Makanan Sehat untuk Jantung Anda",
        "slug": "10-makanan-sehat-untuk-jantung-anda",
        "excerpt": "Jantung yang sehat dimulai dari apa yang Anda makan. Berikut adalah 10 makanan terbaik...",
        "published_at": "2025-09-11T10:00:00.000Z"
      }
    ]
    ```

#### `GET /api/articles/:slug`
[Publik] Mengambil konten lengkap dari satu artikel berdasarkan `slug`-nya.

-   **URL Parameters**:
    - `slug` (string, required): Slug unik dari artikel.

-   **Success Response (200 OK)**
    ```json
    {
      "id": 1,
      "title": "10 Makanan Sehat untuk Jantung Anda",
      "slug": "10-makanan-sehat-untuk-jantung-anda",
      "content": "<p>Jantung yang sehat dimulai dari apa yang Anda makan...</p>",
      "author_name": "Dr. Fitri",
      "published_at": "2025-09-11T10:00:00.000Z"
    }
    ```

#### `POST /api/articles`
[Admin] Membuat artikel baru. Endpoint ini seharusnya hanya bisa diakses oleh admin.

-   **Headers**: `Authorization: Bearer <token>`
-   **Request Body**: `application/json`
    ```json
    {
      "title": "Pentingnya Olahraga Kardio",
      "content": "<p>Olahraga kardio seperti lari atau berenang sangat penting untuk...</p>",
      "excerpt": "Kenali manfaat olahraga kardio untuk kesehatan jantung Anda.",
      "author_id": 2, // ID dari user admin
      "status": "published"
    }
    ```

-   **Success Response (201 Created)**
    ```json
    { "message": "Article created successfully" }
    ```

### Modul: Administrasi (`/api/admin`)

Kumpulan endpoint yang hanya dapat diakses oleh pengguna dengan peran `admin`. Semua endpoint di sini secara otomatis terproteksi oleh middleware `protect` dan `isAdmin`.

-   **Headers**: `Authorization: Bearer <token>` (required)

#### `GET /api/admin/stats`
[Admin] Mengambil data statistik ringkas untuk ditampilkan di dasbor admin.

-   **Success Response (200 OK)**
    ```json
    {
      "totalUsers": 150,
      "totalDoctors": 12,
      "totalArticles": 25
    }
    ```

#### `GET /api/admin/users`
[Admin] Mengambil daftar semua pengguna yang terdaftar di sistem.

-   **Success Response (200 OK)**
    ```json
    [
      {
        "id": 1,
        "name": "Alvin",
        "email": "alvin.doe@example.com",
        "role": "user",
        "created_at": "2025-09-10T12:00:00.000Z"
      },
      {
        "id": 2,
        "name": "Admin Fitri",
        "email": "fitri.admin@example.com",
        "role": "admin",
        "created_at": "2025-09-09T10:00:00.000Z"
      }
    ]
    ```

### Modul: Notifikasi (`/api/notifications`)

Mengelola notifikasi untuk pengguna, seperti pengingat obat, laporan mingguan siap, dll. Semua endpoint memerlukan autentikasi.

-   **Headers**: `Authorization: Bearer <token>` (required)

#### `GET /api/notifications`
Mengambil semua notifikasi (baik yang sudah dibaca maupun yang belum) untuk pengguna yang login.

-   **Success Response (200 OK)**
    ```json
    [
      {
        "id": 1,
        "user_id": 1,
        "message": "Peringatan: Stok obat Aspirin Anda akan segera habis.",
        "is_read": false,
        "created_at": "2025-09-13T08:00:00.000Z"
      },
      {
        "id": 2,
        "user_id": 1,
        "message": "Laporan kesehatan mingguan Anda telah siap.",
        "is_read": true,
        "created_at": "2025-09-12T20:00:00.000Z"
      }
    ]
    ```

#### `POST /api/notifications/:notificationId/read`
Menandai satu notifikasi spesifik sebagai "telah dibaca".

-   **URL Parameters**:
    - `notificationId` (number, required): ID dari notifikasi yang ingin ditandai.

-   **Success Response (200 OK)**
    ```json
    { "message": "Notification marked as read" }
    ```

#### `POST /api/notifications/read-all`
Menandai semua notifikasi yang belum dibaca milik pengguna sebagai "telah dibaca".

-   **Success Response (200 OK)**
    ```json
    { "message": "All notifications marked as read" }
    ```

### Modul: Laporan Kesehatan (`/api/reports`)

Endpoint untuk mengakses laporan kesehatan mingguan yang dibuat secara otomatis oleh sistem.

-   **Headers**: `Authorization: Bearer <token>` (required)

#### `GET /api/reports`
Mengambil riwayat semua laporan kesehatan mingguan milik pengguna.

-   **Success Response (200 OK)**
    ```json
    [
      {
        "id": 1,
        "user_id": 1,
        "week_start_date": "2025-09-08",
        "week_end_date": "2025-09-14",
        "summary_text": "Tekanan darah Anda minggu ini sedikit di atas rata-rata. Detak jantung stabil.",
        "avg_systolic": 135,
        "avg_diastolic": 85,
        "avg_heart_rate": 78,
        "created_at": "2025-09-14T20:00:00.000Z"
      }
    ]
    ```

### Modul: Tips Kesehatan (`/api/tips`)

Menyajikan tips kesehatan singkat yang bisa diakses oleh pengguna.

#### `GET /api/tips/today`
[Publik] Mengambil "Tip of the Day" yang dipilih secara acak oleh sistem setiap hari.

-   **Success Response (200 OK)**
    ```json
    {
      "id": 42,
      "tip": "Jangan lupa minum air putih minimal 8 gelas sehari untuk menjaga hidrasi dan kesehatan jantung.",
      "category": "Gaya Hidup"
    }
    ```

#### `GET /api/tips/random`
[Publik] Mengambil satu tips kesehatan secara acak. Bisa difilter berdasarkan kategori.

-   **Query Parameters**:
    - `category` (string, optional): e.g., "Diet", "Olahraga", "Gaya Hidup".

-   **Success Response (200 OK)**
    ```json
    {
      "id": 15,
      "tip": "Batasi konsumsi garam tidak lebih dari 1 sendok teh per hari.",
      "category": "Diet"
    }
    ```

#### `GET /api/tips`
[Admin] Mengambil daftar semua tips kesehatan yang ada di database.

-   **Headers**: `Authorization: Bearer <token>`
-   **Success Response (200 OK)**: Array objek tips seperti pada `/api/tips/random`.

#### `POST /api/tips`
[Admin] Membuat tips kesehatan baru.

-   **Headers**: `Authorization: Bearer <token>`
-   **Request Body**: `application/json`
    ```json
    {
      "tip": "Lakukan peregangan ringan selama 5 menit setiap jam jika Anda bekerja di depan komputer.",
      "category": "Gaya Hidup"
    }
    ```

-   **Success Response (201 Created)**
    ```json
    { "message": "Health tip created successfully." }
    ```

#### `PUT /api/tips/:tipId`
[Admin] Memperbarui konten atau kategori dari tips yang sudah ada.

-   **Headers**: `Authorization: Bearer <token>`
-   **URL Parameters**: `tipId` (number, required)
-   **Request Body**: `application/json` (sama seperti POST)

-   **Success Response (200 OK)**
    ```json
    { "message": "Health tip updated successfully." }
    ```

#### `DELETE /api/tips/:tipId`
[Admin] Menghapus sebuah tips dari database.

-   **Headers**: `Authorization: Bearer <token>`
-   **URL Parameters**: `tipId` (number, required)

-   **Success Response (200 OK)**
    ```json
    { "message": "Health tip deleted successfully." }
    ```

