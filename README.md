# SHN Desktop Application

Aplikasi desktop untuk manajemen inventori dan sales order PT. SURYA HARSA NAGARA.

## Fitur Utama

### Sales Order (SO)
- **Tampilan List**: Halaman utama menampilkan daftar semua Sales Order dalam bentuk tabel
- **Tombol Tambah SO**: Tombol hijau di atas list untuk menambah Sales Order baru
- **Form Input**: Halaman input yang tersembunyi dengan form lengkap untuk membuat SO
- **Pencarian & Filter**: 
  - Pencarian berdasarkan No SO atau nama pelanggan
  - Filter berdasarkan status (Draft, Confirmed, In Progress, Completed, Cancelled)
  - Filter berdasarkan periode (Hari ini, Minggu ini, Bulan ini, Kuartal ini, Tahun ini)
- **Summary Info**: Informasi ringkasan total SO, nilai, rata-rata, dan jumlah per status
- **Export Data**: Fitur export ke CSV untuk data yang sudah difilter
- **Responsive Design**: Tampilan yang responsif untuk berbagai ukuran layar

### Fitur Lainnya
- Purchase Order (PO) management
- FUI (Form Uang In)
- AR/AP management
- Workshop management
- Master data management
- Reporting system

## Struktur Aplikasi

```
src/
├── main.js              # Main process Electron
├── preload.js           # Preload script
└── renderer/
    ├── pages/           # HTML pages
    │   ├── so.html      # Sales Order page
    │   ├── index.html   # PO page
    │   └── ...
    ├── logics/          # JavaScript logic
    │   ├── so.js        # Sales Order logic
    │   ├── po.js        # Purchase Order logic
    │   └── ...
    └── styles/          # CSS styles
        └── style.css    # Main stylesheet
```

## Cara Penggunaan Sales Order

### 1. Melihat List SO
- Buka halaman Sales Order
- Halaman akan menampilkan daftar semua SO yang sudah dibuat
- Gunakan fitur pencarian dan filter untuk menemukan SO tertentu

### 2. Menambah SO Baru
- Klik tombol "Tambah Sales Order" di atas list
- Isi informasi pelanggan (nama, telepon, email, alamat)
- Isi detail item (panjang, lebar, qty, jenis plat, harga, satuan, diskon)
- Klik "Tambah Item" untuk menambahkan item ke SO
- Klik "Simpan SO" untuk menyimpan

### 3. Mencari dan Filter SO
- Gunakan kotak pencarian untuk mencari berdasarkan No SO atau nama pelanggan
- Pilih status dari dropdown untuk filter berdasarkan status
- Pilih periode dari dropdown untuk filter berdasarkan waktu
- Klik "Clear Filter" untuk menghapus semua filter

### 4. Export Data
- Setelah menggunakan filter, klik tombol "Export"
- Data akan di-download dalam format CSV

## Teknologi yang Digunakan

- **Electron**: Framework untuk aplikasi desktop cross-platform
- **HTML5**: Struktur halaman
- **CSS3**: Styling dan responsive design
- **Vanilla JavaScript**: Logic aplikasi
- **LocalStorage**: Penyimpanan data lokal

## Instalasi dan Menjalankan

1. Clone repository ini
2. Install dependencies: `npm install`
3. Jalankan aplikasi: `npm start`

## Kontribusi

Silakan buat pull request atau issue untuk saran dan perbaikan.

## Lisensi

© 2024 PT. SURYA HARSA NAGARA. All rights reserved.