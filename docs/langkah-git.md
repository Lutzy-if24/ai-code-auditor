# Langkah Git dan GitHub

1. Buat repository kosong di github.com (misal `ai-code-auditor`), tanpa README otomatis.
2. Di folder proyek:

```
git init
git branch -M main
git remote add origin https://github.com/USERNAME/ai-code-auditor.git
```

3. Commit bertahap (satu perubahan, satu commit):

```
git add index.html style.css && git commit -m "Tambah kerangka halaman dan gaya dasar"
git add rules.js && git commit -m "Tambah 13 aturan pemeriksaan kode"
git add app.js && git commit -m "Tambah logika analisis, skor, dan tampilan temuan"
git add rules.js && git commit -m "Perbaiki positif palsu: abaikan string dan komentar (sanitize)"
git add tests.js && git commit -m "Tambah pengujian otomatis"
git add README.md .gitignore docs && git commit -m "Tambah README dan dokumentasi"
git push -u origin main
```

4. Tambahkan dosen dan asisten: Settings > Collaborators > Add people.
5. Taruh PDF proposal dan screenshot di folder `docs/`.
