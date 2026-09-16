# ceknet

ceknet adalah perangkat lunak diagnostik performa jaringan internet dan pengukuran kecepatan transfer data berbasis web. Aplikasi ini mengintegrasikan antarmuka pengguna berbasis React dengan backend Express untuk menyediakan evaluasi throughput fisik koneksi secara akurat dan efisien.

## Gambaran Umum

Aplikasi ini dirancang dengan pendekatan minimalis, performa tinggi, dan efisiensi sumber daya. Seluruh metrik latensi dan bandwidth diproses secara langsung dengan visualisasi jalur SVG native tanpa ketergantungan pada pustaka grafik pihak ketiga yang berat.

Pengukuran koneksi memanfaatkan titik akhir edge CDN Cloudflare untuk pengujian jaringan publik sesungguhnya, dengan fallback otomatis ke server lokal apabila koneksi eksternal tidak dapat diakses.

## Fitur Utama

- Pengukuran Latensi dan Jitter: Evaluasi waktu bolak-balik (round-trip time) dan variasi stabilitas jaringan melalui serangkaian permintaan berkala.
- Pengujian Throughput Unduh (Download): Pengukuran laju transfer data unduhan secara streaming dengan pemulusan eksponensial untuk hasil yang stabil.
- Pengujian Throughput Unggah (Upload): Pengukuran laju transmisi muatan biner secara bertahap menuju endpoint penerima.
- Visualisasi Real-Time Ringan: Grafik sparkline dinamis berbasis elemen SVG native untuk memantau fluktuasi bandwidth tanpa membebani browser.
- Inspeksi Jaringan dan ISP: Identifikasi alamat IP publik, penyedia layanan internet (ISP), nomor sistem otonom (ASN), serta lokasi geografis server.
- Analisis Kelayakan Aktivitas: Penilaian otomatis terhadap kualitas jaringan untuk skenario gaming kompetitif, streaming video 4K, dan panggilan konferensi video.
- Riwayat Diagnostik Lokal: Penyimpanan hasil pengujian sebelumnya pada penyimpanan lokal peramban (localStorage) serta fitur ekspor data dalam format CSV.

## Struktur Direktori

```
ceknet/
├── client/                 # Antarmuka frontend (React + Vite)
│   ├── src/
│   │   ├── components/     # Komponen UI (Header, SpeedHero, MetricsPanel, TestHistory)
│   │   ├── services/       # Mesin pengujian jaringan (speedTestEngine.js)
│   │   ├── App.jsx         # Komponen utama dan manajemen alur pengujian
│   │   ├── index.css       # Konfigurasi Tailwind CSS dan tema visual
│   │   └── main.jsx        # Titik masuk aplikasi React
│   ├── package.json
│   └── vite.config.js
├── server/                 # Layanan backend (Node.js + Express)
│   ├── index.js            # Endpoint pengujian latensi, unduh, unggah, dan GeoIP
│   └── package.json
├── package.json            # Konfigurasi root dan skrip orkestrasi monorepo
└── README.md
```

## Prasyarat Sistem

- Node.js versi 18.0.0 atau yang lebih baru
- npm versi 9.0.0 atau yang lebih baru

## Instalasi

1. Lakukan instalasi dependensi pada direktori klien dan server:

```bash
cd client && npm install
cd ../server && npm install
cd ..
```

2. Alternatif menggunakan konfigurasi package utama:

```bash
npm install --prefix client
npm install --prefix server
```

## Menjalankan Aplikasi

### Mode Pengembangan (Development)

Untuk menjalankan server backend dan client frontend secara bersamaan:

```bash
npm run dev
```

Secara bawaan:
- Layanan Frontend berjalan pada: `http://localhost:5173`
- Layanan Backend berjalan pada: `http://localhost:5000`

### Menjalankan Secara Terpisah

Menjalankan server API:
```bash
npm run server
```

Menjalankan server development frontend:
```bash
npm run client
```

### Kompilasi Produksi (Production Build)

Untuk menghasilkan bundel produksi frontend yang teroptimasi:

```bash
npm run build
```

Hasil kompilasi akan tersimpan pada direktori `client/dist/`.

## Lisensi

Proyek ini didistribusikan di bawah lisensi MIT.
