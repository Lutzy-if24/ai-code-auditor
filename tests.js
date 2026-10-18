// Pengujian otomatis. Jalankan: node tests.js
const { runRules, SAMPLE } = require("./rules.js");
const ids = code => runRules(code).map(f => f.rule.id).join(",");
const cases = [
  ["eval terdeteksi", 'const r = eval("1+1");\nconsole.warn(r);', "R01"],
  ["eval di komentar diabaikan", "// jangan pakai eval(x)\nconst y = 2;\nconsole.warn(y);", ""],
  ["== terdeteksi", "if (a == b) { go(); }", "R04"],
  ["== di dalam string diabaikan", 'const m = "a == b";\nconsole.warn(m);', ""],
  ["=== tidak ditandai", "if (a === b) { go(); }", ""],
  ["innerHTML terdeteksi", "el.innerHTML = x;", "R02"],
  ["innerHTML hanya dibaca", "const h = el.innerHTML;\nconsole.warn(h);", ""],
  ["API key terdeteksi", 'const apiKey = "abcdef123456";\nconsole.warn(apiKey);', "R03"],
  ["var di tengah baris", "let a = 1; var b = 2;\nconsole.warn(a, b);", "R09"],
  ["variabel dipakai di template literal", "const nama = 1;\nconsole.warn(`halo ${nama}`);", ""],
  ["catch kosong", "try { go(); } catch (e) {}", "R05"],
  ["fungsi 35 baris", "function big() {\n" + "  doIt();\n".repeat(35) + "}\nbig();", "R08"],
  ["arrow function 35 baris", "const big = () => {\n" + "  doIt();\n".repeat(35) + "};\nbig();", "R08"],
  ["await di dalam try", 'async function f(){\n try {\n const r = await fetch("https://x.id");\n return r;\n } catch (e) { console.warn(e); }\n}\nf();', ""],
  ["kode bersih", "const total = items.reduce((s, i) => s + i.price, 0);\nconsole.warn(total);", ""]
];
let fail = 0;
for (const [name, code, expect] of cases) {
  const got = [...new Set(ids(code).split(",").filter(Boolean))].sort().join(",");
  const ok = got === expect;
  if (!ok) fail++;
  console.log((ok ? "LULUS " : "GAGAL ") + name + (ok ? "" : "  (diharapkan '" + expect + "', hasil '" + got + "')"));
}
const sample = runRules(SAMPLE).length;
console.log((sample >= 8 ? "LULUS " : "GAGAL ") + "kode contoh menghasilkan " + sample + " temuan");
if (sample < 8) fail++;
console.log(fail ? fail + " pengujian gagal" : "Semua pengujian lulus");
process.exit(fail ? 1 : 0);
