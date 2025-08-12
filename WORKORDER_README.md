# Work Order System - SURYA LOGAM JAYA

## Overview
Sistem Work Order (WO) telah dibuat untuk mengelola proses produksi berdasarkan Sales Order (SO). Setiap Work Order dapat dibuat dari item-item yang ada di Sales Order dan dapat dipisahkan menjadi Work Order baru jika diperlukan.

## Fitur Utama

### 1. Daftar Work Order
- Menampilkan semua Work Order yang ada
- Informasi: No WO, No SO, Pelanggan, Item, Ukuran, Satuan, Qty, Status
- Filter berdasarkan status dan periode
- Pencarian berdasarkan No WO, No SO, nama pelanggan, atau item

### 2. Pembuatan Work Order dari Sales Order
- Pilih Sales Order yang akan dibuatkan Work Order
- Tampilkan semua item dari Sales Order yang dipilih
- Pilih item-item yang akan dimasukkan ke Work Order
- Informasi otomatis terisi dari Sales Order:
  - Data pelanggan
  - Asal gudang
  - Detail item (jenis, bentuk, grade, ukuran, qty, luas, satuan)

### 3. Pemisahan Item menjadi Work Order Baru
- Setiap item dalam Work Order dapat dipisahkan menjadi Work Order terpisah
- Tombol "Pisahkan" pada setiap item
- Work Order baru otomatis dibuat dengan nomor unik
- Status awal: Draft

### 4. Detail Work Order
- Deskripsi pekerjaan
- Estimasi jam kerja
- Ditetapkan kepada (nama pekerja)
- Deadline
- Prioritas (Low, Medium, High, Urgent)

## Struktur Data

### Work Order Object
```javascript
{
  id: Number,
  woNumber: String,           // Format: WO-YYYYMMDD-XXX
  soNumber: String,           // Nomor Sales Order
  customerName: String,       // Nama pelanggan
  customerPhone: String,      // Telepon pelanggan
  customerEmail: String,      // Email pelanggan
  customerAddress: String,    // Alamat pelanggan
  tanggalSO: String,          // Tanggal Sales Order
  asalGudang: String,         // Asal gudang
  woDate: String,             // Tanggal Work Order
  priority: String,           // Low/Medium/High/Urgent
  description: String,        // Deskripsi pekerjaan
  estimatedHours: Number,     // Estimasi jam kerja
  assignedTo: String,         // Nama pekerja
  deadline: String,           // Deadline
  items: Array,               // Array item yang dipilih
  status: String,             // Draft/In Progress/Completed/Cancelled
  createdAt: String,          // Timestamp pembuatan
  isSplit: Boolean,           // Apakah WO hasil pemisahan
  parentWO: String            // Referensi WO induk (jika ada)
}
```

### Item Object
```javascript
{
  id: Number,
  jenisBarang: String,        // Jenis barang
  bentukBarang: String,       // Bentuk barang
  gradeBarang: String,        // Grade barang
  panjang: Number,            // Panjang dalam meter
  lebar: Number,              // Lebar dalam meter
  qty: Number,                // Quantity
  luas: Number,               // Luas dalam m²
  ketebalan: Number,          // Ketebalan dalam mm
  harga: Number,              // Harga per satuan
  units: String,              // Satuan (per_m2/per_lembar/per_kg)
  discount: Number,           // Diskon dalam persen
  discountAmount: Number,     // Jumlah diskon
  total: Number,              // Total harga
  notes: String               // Catatan
}
```

## Cara Penggunaan

### 1. Membuat Work Order Baru
1. Klik tombol "Tambah Work Order"
2. Pilih Sales Order dari dropdown
3. Pilih item-item yang akan dimasukkan ke Work Order (gunakan checkbox)
4. Klik "Buat Work Order"
5. Isi detail Work Order (deskripsi, estimasi, pekerja, deadline)
6. Klik "Simpan Work Order"

### 2. Memisahkan Item menjadi Work Order Baru
1. Pada daftar item yang dipilih, klik tombol "Pisahkan" pada item yang ingin dipisahkan
2. Item akan otomatis dibuat menjadi Work Order baru
3. Work Order baru akan muncul di daftar dengan status "Draft"

### 3. Mengelola Work Order
- **Lihat**: Melihat detail Work Order
- **Edit**: Mengedit informasi Work Order
- **Hapus**: Menghapus Work Order

### 4. Filter dan Pencarian
- **Search**: Cari berdasarkan No WO, No SO, nama pelanggan, atau item
- **Status Filter**: Filter berdasarkan status (Draft, In Progress, Completed, Cancelled)
- **Periode Filter**: Filter berdasarkan periode (hari ini, minggu ini, bulan ini, dll)

## File yang Dibuat

1. **`src/renderer/pages/workorder.html`** - Halaman utama Work Order
2. **`src/renderer/logics/workorder.js`** - Logika dan fungsi Work Order

## Integrasi dengan Sistem

### Sales Order
- Work Order dibuat berdasarkan Sales Order yang ada
- Semua informasi pelanggan dan item otomatis terisi
- Referensi ke Sales Order tersimpan untuk tracking

### Master Data
- Menggunakan data dari master data yang sudah ada:
  - Jenis Barang
  - Bentuk Barang
  - Grade Barang
  - Gudang

### Storage
- Data disimpan di localStorage browser
- Format: `woList` - array Work Order
- Format: `soList` - array Sales Order (sudah ada)

## Navigasi

Menu Work Order telah ditambahkan ke navigasi utama di:
- `src/renderer/pages/index.html` (halaman utama)

## Status Work Order

1. **Draft** - Work Order baru dibuat, belum dimulai
2. **In Progress** - Pekerjaan sedang berlangsung
3. **Completed** - Pekerjaan selesai
4. **Cancelled** - Work Order dibatalkan

## Prioritas

1. **Low** - Prioritas rendah
2. **Medium** - Prioritas sedang (default)
3. **High** - Prioritas tinggi
4. **Urgent** - Prioritas sangat tinggi

## Catatan Penting

- Setiap Work Order memiliki nomor unik dengan format `WO-YYYYMMDD-XXX`
- Item yang dipisahkan menjadi Work Order baru tidak dapat dikembalikan ke Work Order asli
- Semua data tersimpan di localStorage browser
- Sistem mendukung multiple item dalam satu Work Order
- Work Order dapat dibuat dari multiple Sales Order yang berbeda

## Pengembangan Selanjutnya

1. **Status Tracking**: Implementasi tracking progress pekerjaan
2. **Notifikasi**: Sistem notifikasi untuk deadline dan status update
3. **Reporting**: Laporan produksi dan efisiensi
4. **Integration**: Integrasi dengan sistem workshop dan produksi
5. **Export/Import**: Fitur export data ke Excel/PDF
6. **User Management**: Manajemen user dan permission
