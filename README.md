# AI Code Auditor

Aplikasi web untuk memeriksa kualitas dan risiko kode JavaScript hasil AI generatif.
Tugas I - 11S3133 Pengembangan Aplikasi Berbasis Web.

Kode yang ditempel dianalisis langsung di browser. Tidak ada server, tidak ada pustaka tambahan, dan kode tidak dikirim ke mana pun.

## Fitur
- Memeriksa kode dengan 13 aturan (keamanan, penanganan error, keterbacaan)
- Skor kualitas 0-100 dan tingkat keparahan (tinggi, sedang, rendah)
- Alasan masalah dan saran perbaikan untuk tiap temuan
- Tampilan kode dengan penanda warna pada baris bermasalah
- Tombol muat contoh kode AI, kosongkan, dan unduh laporan .txt

## Cara menjalankan
Buka `index.html` di browser. Tidak perlu instalasi.

## Pengujian
Jalankan `node tests.js` (membutuhkan Node.js). Ada 15 kasus uji plus 1 uji kode contoh, termasuk kasus tepi: pola di dalam string dan komentar, beberapa deklarasi dalam satu baris, dan template literal.

## Aturan pemeriksaan
| Tingkat | Aturan |
|---|---|
| Tinggi | R01 `eval()`, R02 `innerHTML` / `document.write` tanpa sanitasi, R03 kunci rahasia di kode |
| Sedang | R04 perbandingan longgar (`==`), R05 blok `catch` kosong, R06 jaringan/async tanpa penanganan error, R07 input pengguna tanpa validasi, R08 fungsi terlalu panjang (lebih dari 30 baris) |
| Rendah | R09 memakai `var`, R10 `console.log` tertinggal, R11 komentar TODO/FIXME, R12 URL `http://`, R13 variabel tidak terpakai |

## Skor
`skor = max(0, 100 - 15T - 7S - 3R)`, dengan T, S, R adalah jumlah temuan tingkat tinggi, sedang, dan rendah.
Skor 85 ke atas dianggap cukup aman, 60 sampai 84 perlu perbaikan, dan di bawah 60 berisiko. Bobot ini keputusan perancangan, bukan standar baku.

## Struktur
- `index.html` - struktur halaman
- `style.css` - tampilan
- `rules.js` - daftar aturan, pembersih string/komentar (`sanitize`), dan `runRules`
- `app.js` - skor, tampilan hasil, dan unduh laporan
- `tests.js` - pengujian otomatis
- `docs/` - proposal, tangkapan layar proses bersama AI, dan panduan Git

## Cara menambah aturan
Tambahkan objek baru ke array `RULES` di `rules.js` dengan `id`, `level`, `title`, `why`, `fix`, dan fungsi `test(line)` atau `check(code, lines)`. Beri `raw: true` bila aturan perlu membaca isi string atau komentar.

## Keamanan
Hasil ditampilkan dengan `textContent`, bukan `innerHTML`, sehingga kode yang ditempel tidak dieksekusi oleh aplikasi ini.

## Batasan
- Pemeriksaan berbasis pola (regex), bukan analisis sintaks penuh, sehingga bisa memberi positif palsu atau melewatkan masalah.
- R06 dan R07 memeriksa seluruh kode sekali, bukan per fungsi.
- R02 menandai `innerHTML` yang diisi teks konstan karena tidak mengetahui asal data.
- `sanitize` belum diuji pada regex literal yang memuat tanda kutip.

Hasilnya adalah alat bantu, bukan pengganti code review.

## Penggunaan AI
Dibangun dengan bantuan AI generatif (Claude). Proses kerjanya, yaitu prompt, evaluasi, kesalahan yang ditemukan, dan perbaikannya, didokumentasikan di bab 4 proposal pada folder `docs/`.