const WEIGHT = { high: 15, medium: 7, low: 3 };
const LABEL = { high: "Tinggi", medium: "Sedang", low: "Rendah" };
const $ = id => document.getElementById(id);
let lastReport = "";

function analyze(code) {
  const lines = code.split("\n");
  const findings = runRules(code);
  const penalty = findings.reduce((s, f) => s + WEIGHT[f.rule.level], 0);
  return { lines, findings, score: Math.max(0, 100 - penalty) };
}

function verdictFor(score) {
  if (score >= 85) return "Cukup aman. Tetap uji manual sebelum dipakai.";
  if (score >= 60) return "Perlu perbaikan. Periksa temuan tingkat sedang dan tinggi.";
  return "Berisiko. Jangan dipakai sebelum temuan tinggi diperbaiki.";
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text; // aman dari XSS
  return e;
}

function render({ lines, findings, score }) {
  $("output").hidden = false;
  const s = $("score");
  s.textContent = score;
  s.className = "score " + (score >= 85 ? "good" : score >= 60 ? "warn" : "bad");
  $("verdict").textContent = verdictFor(score) + " (" + findings.length + " temuan)";

  const ul = $("findings");
  ul.replaceChildren();
  if (!findings.length) ul.appendChild(el("li", "empty", "Tidak ada masalah yang cocok dengan aturan. Bukan jaminan bebas bug."));
  findings.forEach(f => {
    const li = el("li", "f " + f.rule.level);
    li.appendChild(el("strong", "", "Baris " + f.line + ": " + f.rule.title));
    li.appendChild(el("span", "tag", LABEL[f.rule.level]));
    li.appendChild(el("p", "", f.rule.why));
    li.appendChild(el("p", "fix", "Saran: " + f.rule.fix));
    ul.appendChild(li);
  });

  const order = { high: 3, medium: 2, low: 1 };
  const worst = {};
  findings.forEach(f => {
    if (!worst[f.line] || order[f.rule.level] > order[worst[f.line]]) worst[f.line] = f.rule.level;
  });
  const cv = $("codeview");
  cv.replaceChildren();
  lines.forEach((l, i) => {
    const row = el("div", "row " + (worst[i + 1] || ""));
    row.appendChild(el("span", "no", String(i + 1)));
    row.appendChild(el("code", "", l || " "));
    cv.appendChild(row);
  });

  lastReport = ["LAPORAN AI CODE AUDITOR", "Skor: " + score + "/100", verdictFor(score), ""]
    .concat(findings.map(f => "[" + LABEL[f.rule.level] + "] Baris " + f.line + " - " + f.rule.title + "\n  Saran: " + f.rule.fix))
    .join("\n");
  $("output").scrollIntoView({ behavior: "smooth", block: "start" });
}

$("analyze").addEventListener("click", () => {
  const code = $("code").value;
  if (!code.trim()) { $("msg").textContent = "Kolom kode masih kosong. Tempel kode atau muat contoh."; return; }
  $("msg").textContent = "";
  render(analyze(code));
});
$("sample").addEventListener("click", () => { $("code").value = SAMPLE; $("msg").textContent = "Contoh dimuat. Klik Periksa kode."; });
$("clear").addEventListener("click", () => { $("code").value = ""; $("output").hidden = true; $("msg").textContent = ""; });
$("export").addEventListener("click", () => {
  const url = URL.createObjectURL(new Blob([lastReport], { type: "text/plain" }));
  const a = el("a"); a.href = url; a.download = "laporan-audit.txt"; a.click();
  URL.revokeObjectURL(url);
});
