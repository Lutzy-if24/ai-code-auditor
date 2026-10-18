# AI Code Auditor

Aplikasi web untuk memeriksa kualitas dan risiko kode JavaScript hasil AI generatif.
Tugas I - 11S3133 Pengembangan Aplikasi Berbasis Web.

## Fitur
- Memeriksa kode dengan 13 aturan (keamanan, penanganan error, keterbacaan)
- Skor kualitas 0-100 dan tingkat keparahan (tinggi, sedang, rendah)
- Penjelasan masalah dan saran perbaikan untuk tiap temuan
- Tampilan kode dengan penanda baris bermasalah
- Unduh laporan .txt
- Semua pemeriksaan berjalan di browser, kode tidak dikirim ke server

## Cara menjalankan
Buka `index.html` di browser. Tidak perlu instalasi.

## Pengujian
Jalankan `node tests.js` (membutuhkan Node.js). Ada 15 kasus uji plus uji kode contoh.

## Struktur
- `index.html` - tampilan
- `style.css` - gaya
- `rules.js` - daftar aturan, pembersih string/komentar (`sanitize`), dan `runRules`
- `tests.js` - pengujian otomatis
- `app.js` - logika analisis dan tampilan
- `docs/` - proposal dan tangkapan layar proses bersama AI

## Cara menambah aturan
Tambahkan objek baru ke array `RULES` di `rules.js` dengan `id`, `level`, `title`, `why`, `fix`, dan fungsi `test(line)` atau `check(code, lines)`.

## Batasan
Pemeriksaan berbasis pola (regex), bukan analisis sintaks penuh, sehingga bisa memberi positif palsu atau melewatkan masalah. Hasilnya alat bantu, bukan pengganti code review.

## Penggunaan AI
Dibangun dengan bantuan AI generatif. Prompt, evaluasi, kesalahan yang ditemukan, dan perbaikannya didokumentasikan di folder `docs/`.
