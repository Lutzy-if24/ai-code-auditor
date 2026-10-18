// Aturan pemeriksaan. level: high | medium | low
// test(line) memeriksa satu baris; check(code, lines) memeriksa seluruh kode
// dan mengembalikan array nomor baris (1-based).
const RULES = [
  { id: "R01", level: "high", title: "Penggunaan eval()",
    why: "eval() menjalankan teks sebagai kode sehingga membuka celah injeksi.",
    fix: "Gunakan JSON.parse() untuk data, atau fungsi biasa untuk logika.",
    test: l => /\beval\s*\(/.test(l) },
  { id: "R02", level: "high", title: "innerHTML / document.write tanpa sanitasi",
    why: "Input pengguna yang masuk ke innerHTML dapat memicu serangan XSS.",
    fix: "Gunakan textContent atau buat elemen dengan createElement.",
    test: l => /\.innerHTML\s*[+]?=|document\.write\s*\(/.test(l) },
  { id: "R03", raw: true, level: "high", title: "Kunci rahasia tertulis di kode",
    why: "API key atau password di dalam kode ikut terbaca siapa pun yang melihat repository.",
    fix: "Simpan di environment variable atau file .env yang tidak di-commit.",
    test: l => /(api[_-]?key|secret|password|token)\s*[:=]\s*["'][^"']{6,}["']/i.test(l) },
  { id: "R04", level: "medium", title: "Perbandingan longgar (==)",
    why: "== melakukan konversi tipe otomatis, misalnya 0 == '' bernilai true.",
    fix: "Gunakan === atau !==.",
    test: l => /[^=!<>]==[^=]/.test(l) || /!=[^=]/.test(l) },
  { id: "R05", level: "medium", title: "Blok catch kosong",
    why: "Error ditelan diam-diam sehingga bug sulit dilacak.",
    fix: "Tampilkan pesan ke pengguna atau catat error di dalam catch.",
    test: l => /catch\s*(\([^)]*\))?\s*{\s*}/.test(l) },
  { id: "R06", level: "medium", title: "Jaringan/async tanpa penanganan error",
    why: "fetch atau await tanpa try/catch membuat aplikasi macet saat jaringan gagal.",
    fix: "Bungkus dengan try/catch dan periksa response.ok.",
    check: (code, lines) => (/\bfetch\s*\(|\bawait\b/.test(code) && !/\btry\s*{|\.catch\s*\(/.test(code))
      ? [lines.findIndex(l => /\bfetch\s*\(|\bawait\b/.test(l)) + 1] : [] },
  { id: "R07", level: "medium", title: "Input pengguna tanpa validasi",
    why: "Nilai dari form dipakai langsung tanpa trim, isNaN, atau pengecekan kosong.",
    fix: "Validasi tipe, panjang, dan rentang nilai sebelum diproses.",
    check: (code, lines) => (/\.value\b|prompt\s*\(/.test(code) && !/\.trim\s*\(|isNaN|Number\.isFinite|\.length\s*(===|>|<)|!\s*\w+\.value/.test(code))
      ? [lines.findIndex(l => /\.value\b|prompt\s*\(/.test(l)) + 1] : [] },
  { id: "R08", level: "medium", title: "Fungsi terlalu panjang",
    why: "Fungsi di atas 30 baris sulit dites dan dipahami.",
    fix: "Pecah menjadi fungsi-fungsi kecil dengan satu tugas.",
    check: (code, lines) => {
      const out = [];
      lines.forEach((l, i) => {
        if (!/^\s*(async\s+)?function\s+\w+|^\s*(const|let)\s+\w+\s*=\s*(async\s*)?(function|\(.*\)\s*=>|\w+\s*=>)\s*{?/.test(l)) return;
        let depth = 0, started = false;
        for (let j = i; j < lines.length; j++) {
          for (const ch of lines[j]) { if (ch === "{") { depth++; started = true; } if (ch === "}") depth--; }
          if (started && depth <= 0) { if (j - i + 1 > 30) out.push(i + 1); break; }
        }
      });
      return out;
    } },
  { id: "R09", level: "low", title: "Memakai var",
    why: "var berlingkup fungsi dan bisa di-hoist sehingga memicu bug tak terduga.",
    fix: "Gunakan const, atau let jika nilainya berubah.",
    test: l => /\bvar\s+[A-Za-z_$]/.test(l) },
  { id: "R10", level: "low", title: "console.log tertinggal",
    why: "Sisa debugging dapat membocorkan data dan memperlambat aplikasi.",
    fix: "Hapus sebelum kode dipublikasikan.",
    test: l => /console\.log\s*\(/.test(l) },
  { id: "R11", raw: true, level: "low", title: "Komentar TODO / FIXME",
    why: "Menandakan bagian kode yang belum selesai.",
    fix: "Selesaikan atau catat sebagai issue di GitHub.",
    test: l => /\/\/\s*(TODO|FIXME)/i.test(l) },
  { id: "R12", raw: true, level: "low", title: "URL memakai http://",
    why: "Data yang dikirim lewat HTTP tidak terenkripsi.",
    fix: "Gunakan https://.",
    test: l => /["'`]http:\/\/(?!localhost|127\.0\.0\.1)/.test(l) },
  { id: "R13", level: "low", title: "Variabel tidak terpakai",
    why: "Variabel yang dideklarasikan tetapi tidak dipakai menambah kerumitan.",
    fix: "Hapus variabel tersebut.",
    check: (code, lines) => {
      const out = [];
      lines.forEach((l, i) => {
        const m = l.match(/^\s*(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=/);
        if (m && (code.match(new RegExp("\\b" + m[1].replace(/\$/g, "\\$") + "\\b", "g")) || []).length === 1) out.push(i + 1);
      });
      return out;
    } }
];

const SAMPLE = `// Kode contoh buatan AI (sengaja berisi masalah)
var API_KEY = "sk-demo-1234567890abcdef";

function addTask() {
  var title = document.getElementById("title").value;
  var list = document.getElementById("list");
  list.innerHTML += "<li>" + title + "</li>";
  console.log("added", title);
}

async function loadData() {
  const res = await fetch("http://example.com/api/tasks?key=" + API_KEY);
  const data = await res.json();
  if (data.status == 200) {
    return data;
  }
}

function parseConfig(text) {
  try {
    return eval("(" + text + ")");
  } catch (e) {}
}
// TODO: tambahkan fitur hapus
`;

// Mengosongkan isi string dan komentar agar aturan tidak salah menandai teks biasa.
// Isi ekspresi ${...} pada template literal tetap dipertahankan.
function sanitize(code) {
  let out = "", i = 0, state = "code", q = "";
  const depth = [];
  const blank = c => (c === "\n" ? "\n" : " ");
  while (i < code.length) {
    const c = code[i], n = code[i + 1];
    if (state === "code") {
      if (c === "/" && n === "/") { state = "line"; out += "  "; i += 2; continue; }
      if (c === "/" && n === "*") { state = "block"; out += "  "; i += 2; continue; }
      if (c === '"' || c === "'") { state = "str"; q = c; out += c; i++; continue; }
      if (c === "`") { state = "tpl"; out += c; i++; continue; }
      if (depth.length) {
        if (c === "{") depth[depth.length - 1]++;
        else if (c === "}") {
          if (depth[depth.length - 1] === 0) { depth.pop(); state = "tpl"; out += c; i++; continue; }
          depth[depth.length - 1]--;
        }
      }
      out += c; i++;
    } else if (state === "line") {
      if (c === "\n") { state = "code"; out += c; } else out += " ";
      i++;
    } else if (state === "block") {
      if (c === "*" && n === "/") { state = "code"; out += "  "; i += 2; } else { out += blank(c); i++; }
    } else if (state === "str") {
      if (c === "\\") { out += " " + blank(n || " "); i += 2; }
      else if (c === q || c === "\n") { state = "code"; out += c; i++; }
      else { out += " "; i++; }
    } else {
      if (c === "\\") { out += " " + blank(n || " "); i += 2; }
      else if (c === "`") { state = "code"; out += c; i++; }
      else if (c === "$" && n === "{") { state = "code"; depth.push(0); out += "${"; i += 2; }
      else { out += blank(c); i++; }
    }
  }
  return out;
}

// Menjalankan semua aturan. Mengembalikan [{rule, line}] berurutan menurut baris.
function runRules(code) {
  const rawLines = code.split("\n");
  const clean = sanitize(code);
  const cleanLines = clean.split("\n");
  const findings = [];
  for (const r of RULES) {
    const hits = r.check
      ? r.check(clean, cleanLines)
      : (r.raw ? rawLines : cleanLines).reduce((a, l, i) => (r.test(l) ? a.concat(i + 1) : a), []);
    hits.filter(n => n > 0).forEach(n => findings.push({ rule: r, line: n }));
  }
  return findings.sort((a, b) => a.line - b.line);
}

if (typeof module !== "undefined") module.exports = { RULES, SAMPLE, sanitize, runRules };
