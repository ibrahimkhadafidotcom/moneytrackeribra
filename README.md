# Money Tracker Cloud Sync v5

Money Tracker PWA dengan:

- saldo rekening realtime;
- budgeting periode 20–19;
- natural-language transaction input;
- Firebase Authentication email/password;
- Cloud Firestore realtime sync;
- sinkronisasi MacBook dan iPhone;
- offline cache;
- data terpisah per akun;
- backup/import JSON dan export CSV.

## File utama

- `index.html` — aplikasi.
- `firebase-config.js` — konfigurasi Firebase milik pengguna.
- `cloud-sync.js` — login dan sinkronisasi Firestore.
- `firestore.rules` — aturan keamanan.
- `manifest.json`, `sw.js`, `icon-*.png` — PWA.
- `TUTORIAL_BAHASA_BAYI.md` — tutorial setup lengkap.

## Setup singkat

1. Buat project Firebase dan web app.
2. Isi `firebase-config.js`.
3. Aktifkan Authentication Email/Password.
4. Buat Firestore database.
5. Publish isi `firestore.rules`.
6. Tambahkan domain `username.github.io` ke Authorized domains.
7. Upload semua file app ke root GitHub repository.
8. Login dari device yang datanya paling lengkap dan tekan **Kirim Data Device Ini ke Cloud**.
9. Login dengan akun yang sama di device kedua.

Baca `TUTORIAL_BAHASA_BAYI.md` untuk langkah super rinci.
