# Sistem Manajemen & Optimasi Produksi Bakery TEFA (3 Role)

Sistem terintegrasi untuk manajemen produksi roti dengan 3 role: **Admin Utama**, **Admin Produksi**, dan **Kasir**. Digunakan untuk menggantikan proses manual (Google Sheet, buku manual, aplikasi Play Store terpisah) menjadi satu platform terpadu.

## 🔧 Instalasi

```bash
npm install
npm run dev
```

## 👥 Akun Demo (Client-side)

Ganti dengan autentikasi backend (Node.js + MongoDB) untuk produksi.

| Username | Password | Role |
|----------|----------|------|
| admin.utama | utama123 | Admin Utama |
| admin.produksi | produksi123 | Admin Produksi |
| kasir | kasir123 | Kasir |

---

## 📋 3 Role & Akses

### 1. Admin Utama (Pemilik/Manajer)
- Mengatur modal bulanan & parameter kapasitas (oven, mixer, SDM)
- Menyetujui rencana produksi bulanan (MILP)
- Mengelola bahan baku (kategori Utama / Penunjang / Isian / Lain-lain)
- Mengelola produk & resep (harga jual, HPP, BOM, berat adonan)
- Melihat laporan keuangan, laba, dan log aktivitas semua pengguna
- Reset data & pengaturan sistem

**Sidebar:** Semua grup menu (Perencanaan, Bahan Baku, Produksi, Pemasaran, Laporan, Sistem)

### 2. Admin Produksi (Pelaksana Lapangan)
- Menerima perintah kerja harian dari rencana yang disetujui
- Mencatat realisasi produksi per tahap (8 tahap proses)
- Mencatat distribusi bahan baku & memantau stok kritis
- Mengajukan & menerima pembelian bahan baku
- Menambah & memperbarui pesanan pelanggan
- Melacak kapasitas produksi harian

**Sidebar:** Grup Produksi (Rencana, Penjadwalan, Stok Jadi, Proses Produksi) & Pemasaran (Pesanan)

### 3. Kasir (Front Office / POS)
- Mencatat penjualan harian per produk (tombol besar, mudah disentuh)
- Menerima pesanan pelanggan dengan pembayaran QRIS / Transfer / Tunai
- Memilih metode pencatatan: Google Sheet / Manual / Aplikasi Play Store
- Memantau stok roti siap jual & pemberitahuan kedaluwarsa

**Sidebar:** Menu lintang hanya 4 halaman (Dashboard, Stok Barang Jadi, Pesanan, Bahan Baku)

---

## 🍞 Katalog Produk & Harga

| Produk | Harga Jual | Berat Adonan | Masa Simpan |
|--------|-----------|--------------|-------------|
| Roti Manis | Rp 5.000 | 50 g | 3 hari |
| Roti Tawar | Rp 12.000 | 250 g | 4 hari |
| Roti Kering 100g | Rp 10.000 | 100 g | 14 hari |
| Roti Kering 180g | Rp 15.000 | 180 g | 14 hari |
| Roti Kering Toples | Rp 25.000 | 250 g | 21 hari |

---

## 📦 Bahan Baku (4 Kategori)

**Utama (60%)**: Tepung Terigu, Air, Ragi, Garam  
**Penunjang (20%)**: Margarin, Gula Pasir, Telur Ayam, Bread Improver  
**Isian (10%)**: Coklat, Mesis, Kacang, Susu  
**Lain-lain (10%)**: Bahan Lain-lain

---

## 🔄 8 Tahap Proses Produksi

| No | Tahap | Durasi | Keterangan |
|----|-------|--------|------------|
| P1 | Penimbangan | 10 mnt | Timbang bahan baku sesuai resep |
| P2 | Pencampuran | 30 mnt | Campur hingga adonan kalis |
| P3 | Tempering | 15 mnt | Istirahatkan adonan sebelum dicetak |
| P4 | Molding | 20 mnt | Bentuk per resep 5 kg, isian sesuai variasi |
| P5 | Proving | Dinamis | Fermentasi sebelum dipanggang |
| P6 | Pengovenan | 20 mnt | Panggang dalam oven |
| P7 | Pendinginan | 15 mnt | Dinginkan sebelum dikemas |
| P8 | Packing | 10 mnt | Kemas dalam toples/plastik |

---

## ⚙️ Kapasitas Produksi Harian

| Hari | Kapasitas | Fokus Produk |
|------|-----------|--------------|
| Senin & Kamis | 25 kg (Full) | Roti Manis & Roti Tawar |
| Selasa & Jumat | 10–15 kg | Kue Kering |
| Sabtu & Minggu | 10–15 kg | Semua produk |

---

## 💳 Metode Pembayaran & Pencatatan

**Pembayaran:** QRIS, Transfer, Tunai  
**Pencatatan:** Google Sheet, Manual, Aplikasi Play Store

---

## 🗄️ Database (MongoDB)

Sistem dirancang untuk diimplementasikan dengan backend MongoDB. Koleksi utama:

| Koleksi | Keterangan |
|---------|------------|
| `users` | Pengguna & RBAC (3 role) |
| `roles` | Definisi hak akses per role |
| `products` | Katalog produk & BOM (resep) |
| `materials` | Bahan baku & stok (4 kategori) |
| `stock_logs` | Riwayat mutasi stok |
| `production_process` | Log 8 tahap produksi per batch |
| `production_capacity` | Aturan kapasitas harian |
| `orders` | Pesanan pelanggan (dengan pembayaran & pencatatan) |
| `sales` | Transaksi penjualan POS kasir |
| `waste_logs` | Roti kedaluwarsa / terbuang |
| `purchase_requests` | Pengajuan pembelian bahan |
| `production_plans` | Rencana bulanan (disetujui Admin Utama) |
| `cost_categories` | Biaya operasional (overhead) |
| `audit_logs` | Log aktivitas semua pengguna |
| `daily_stats` | Statistik harian (cache dashboard) |

---

## 📁 File Baru & Diubah

**Baru:**
- `src/modules/ProductionProcessModule.jsx` — Pelacakan 8 tahap produksi
- `src/data/tefa-data.json` — Diperluas: 5 produk, 13 bahan baku, proses produksi, kapasitas, pembayaran, pencatatan

**Diubah:**
- `src/lib/roles.js` — 3 role (utama, produksi, kasir), konfigurasi bisnis bakery, permission process.track
- `src/lib/solver.js` — Solver MILP dinamis untuk 5 produk, ekspor konfigurasi bisnis
- `src/components/Sidebar.jsx` — Grup Produksi & Pemasaran dipisah, menu Kasir disederhanakan
- `src/components/QuickAdd.jsx` — Form pesanan dengan metode pembayaran & pencatatan
- `src/components/OrdersCard.jsx` — Tabel pesanan dengan kolom Pembayaran & Pencatatan
- `src/modules/Dashboard.jsx` — Dashboard Kasir (fokus penjualan, tanpa data keuangan)
- `src/modules/StokJadiModule.jsx` — Tampilan Kasir (tombol besar, catat penjualan per produk)
- `src/modules/ModulePage.jsx` — Memuat ProductionProcessModule & roleId ke StokJadiModule
- `src/App.jsx` — Routing Dashboard Kasir, simpan paymentMethod & recordingMethod
- `src/styles.css` — Gaya kasir (animasi, tombol besar, kartu hover)
- `README_UPDATE.md` — Dokumentasi sistem lengkap

---

## 🚀 Cara Menjalankan

```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev

# Build untuk produksi
npm run build

# Preview build
npm run preview
```

Aplikasi akan berjalan di `http://localhost:5173` (default Vite).

---

## 📝 Catatan

- Login saat ini bersifat **client-side (demo)**. Untuk produksi, sambungkan ke backend Node.js + MongoDB dengan autentikasi yang aman.
- Semua data disimpan di `localStorage` browser saat ini.
- UI dirancang sederhana dengan minimal interaksi: tombol besar untuk Kasir, navigasi jelas per role, dan validasi otomatis pada setiap tindakan.
## Pembaruan 4: Kasir POS, pipeline produksi, kapasitas & biaya, UI ramah awam
- **Kasir POS** (peran Kasir, akun `kasir / kasir123`): ketuk produk (Roti Manis 50g Rp5.000, Roti Tawar 250g Rp12.000, Kue Kering 100g Rp10.000 / 180g Rp15.000 / Toples Rp25.000), pilih Tunai / QRIS / Transfer, struk muncul, stok barang jadi berkurang (FIFO) dan tabel transaksi bertambah seketika. Riwayat Penjualan memuat filter tanggal & metode; Laporan Keuangan menampilkan pendapatan nyata per metode.
- **Proses Produksi**: pipeline horizontal 8 tahap (Penimbangan 10 menit → Pencampuran → Tempering → Molding → Proving → Pengovenan → Pendinginan → Packing) dengan timer hidup. Penimbangan memotong stok bahan sesuai resep; setelah Packing, hasil masuk Stok Barang Jadi dan Laporan Produksi. Durasi tahap selain Penimbangan adalah nilai awal di `src/data/tefa-data.json` (`productionProcess`), silakan sesuaikan.
- **Biaya & Kapasitas** (Admin Utama): pilih mode Rutin 10–15 kg (Senin/Kamis) atau Penuh 25 kg, modal bulanan dibagi 60/20/10/10, jadwal & anggaran per hari produksi, biaya resep per produk. Batas kapasitas ini ditegakkan di Proses Produksi.
- **UI**: jarak antar-blok 24px, teks dan tombol besar, kontras lebih tinggi, alur kerja dashboard berbentuk pipeline horizontal. Semua halaman input memiliki tabel data di bawahnya.
- Catatan: kode QRIS di Kasir POS adalah contoh tampilan; rekening transfer perlu diisi sendiri. MILP/Perencanaan Modal tetap memakai 3 produk pertama (Manis, Tawar, Kering 100g).
