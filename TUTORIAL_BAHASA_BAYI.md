# Tutorial Money Tracker Cloud Sync — Bahasa Bayi 👶☁️

Tujuan kita:

**MacBook dan iPhone pegang buku uang yang sama.**

Jadi:

- Tulis transaksi di iPhone → muncul di MacBook.
- Tulis transaksi di MacBook → muncul di iPhone.
- BCA, Dompet, Dana, ShopeePay → saldonya sama.
- Saat internet mati → app tetap bisa dipakai.
- Saat internet hidup lagi → data naik sendiri ke cloud.

---

# Bagian A — Bikin rumah awan di Firebase

## 1. Buka Firebase

Buka:

`https://console.firebase.google.com/`

Lalu tekan:

**Create a project** / **Buat project**

Nama project boleh:

`money-tracker-ibrahim`

Tekan **Continue** sampai project jadi.

Google Analytics boleh dimatikan. App tetap jalan.

---

## 2. Daftarkan app web

Di halaman utama Firebase, cari gambar seperti ini:

`</>`

Itu tombol **Web**.

Tekan tombol itu.

Nama app isi:

`Money Tracker Web`

Tidak perlu centang Firebase Hosting karena kita tetap pakai GitHub Pages.

Tekan:

**Register app**

Nanti muncul kotak kode seperti ini:

```javascript
const firebaseConfig = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  storageBucket: "...",
  messagingSenderId: "...",
  appId: "..."
};
```

Jangan ditutup dulu. Kita butuh isi di dalam `{ }`.

---

# Bagian B — Tempel kode Firebase ke app

## 3. Buka file `firebase-config.js`

Di folder app v5 ada file:

`firebase-config.js`

Isinya masih seperti ini:

```javascript
window.MONEY_TRACKER_FIREBASE_CONFIG = {
  apiKey: "ISI_API_KEY",
  authDomain: "ISI_PROJECT_ID.firebaseapp.com",
  projectId: "ISI_PROJECT_ID",
  storageBucket: "ISI_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "ISI_MESSAGING_SENDER_ID",
  appId: "ISI_APP_ID"
};
```

Ganti bagian `ISI_...` dengan kode dari Firebase.

Contoh bentuk akhirnya:

```javascript
window.MONEY_TRACKER_FIREBASE_CONFIG = {
  apiKey: "AIzaSyContoh",
  authDomain: "money-tracker-ibrahim.firebaseapp.com",
  projectId: "money-tracker-ibrahim",
  storageBucket: "money-tracker-ibrahim.firebasestorage.app",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

Yang ditempel hanya punya kamu. Contoh di atas jangan dipakai.

---

# Bagian C — Hidupkan tombol login

## 4. Buka Authentication

Di Firebase sebelah kiri:

**Build → Authentication**

Tekan:

**Get started**

Masuk ke tab:

**Sign-in method**

Pilih:

**Email/Password**

Nyalakan tombol **Enable**.

Tekan **Save**.

Selesai. Sekarang app boleh bikin akun dan login.

---

# Bagian D — Bikin lemari data Firestore

## 5. Buka Firestore Database

Di Firebase sebelah kiri:

**Build → Firestore Database**

Tekan:

**Create database**

Pilih:

**Start in production mode**

Tekan **Next**.

Pilih lokasi yang dekat. Misalnya Singapore atau lokasi terdekat yang tersedia.

Tekan **Enable**.

Tunggu sebentar sampai database jadi.

---

# Bagian E — Pasang gembok supaya data aman

## 6. Buka Firestore Rules

Masih di Firestore, tekan tab:

**Rules**

Hapus semua tulisan yang ada.

Buka file:

`firestore.rules`

Salin semuanya. Isinya:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null
                         && request.auth.uid == userId;
    }
  }
}
```

Tempel ke kotak Rules.

Tekan:

**Publish**

Ini gemboknya.

Artinya:

- Ibrahim hanya boleh lihat data Ibrahim.
- Teman hanya boleh lihat data teman.
- Orang yang belum login tidak boleh buka data.

Jangan pilih rules yang mengizinkan semua orang membaca data.

---

# Bagian F — Izinkan alamat GitHub kamu

## 7. Tambahkan domain GitHub Pages

Buka:

**Authentication → Settings → Authorized domains**

Tekan:

**Add domain**

Masukkan domain GitHub kamu. Bentuknya seperti:

`ibrahimkhadafidotcom.github.io`

Jangan pakai `https://`.

Jangan pakai nama repository.

Yang dimasukkan hanya:

`username.github.io`

Tekan **Add**.

---

# Bagian G — Upload versi v5 ke GitHub

## 8. Buka repository Money Tracker kamu

Masuk ke tab:

**Code**

Tekan:

**Add file → Upload files**

Upload file berikut:

- `index.html`
- `manifest.json`
- `sw.js`
- `firebase-config.js`
- `cloud-sync.js`
- `icon-192.png`
- `icon-512.png`
- `.nojekyll`

File tutorial dan `firestore.rules` boleh ikut di-upload, tapi tidak wajib untuk app.

Kalau GitHub bilang file sudah ada, upload saja. File lama akan diganti.

Scroll ke bawah.

Tekan:

**Commit changes**

Tunggu GitHub Pages membangun app sekitar beberapa menit.

---

# Bagian H — Pertama kali pindahkan data MacBook ke cloud

## 9. Buka app di MacBook

Pakai MacBook yang datanya paling lengkap.

Buka link GitHub Pages Money Tracker.

Refresh halaman.

Masuk ke menu:

**Cloud Sync**

Isi:

- Email
- Password minimal 6 karakter

Kalau belum punya akun, tekan:

**Buat Akun Baru**

Kalau akun sudah ada, tekan:

**Masuk**

Setelah login, tekan:

**Kirim Data Device Ini ke Cloud**

Tekan **OK**.

Tunggu sampai status berubah menjadi:

**Cloud aktif**

Sekarang data MacBook sudah naik ke awan.

---

# Bagian I — Sambungkan iPhone

## 10. Buka app di iPhone

Buka link Money Tracker lewat Safari.

Masuk menu:

**Cloud Sync**

Masukkan email dan password yang sama dengan MacBook.

Tekan:

**Masuk**

Data dari cloud akan turun otomatis.

Cek:

- Saldo BCA sama.
- Saldo Dompet sama.
- Saldo Dana sama.
- Saldo ShopeePay sama.
- Transaksi sama.

Kalau belum masuk, tekan:

**Ambil Data dari Cloud**

---

# Bagian J — Pasang lagi ke Home Screen iPhone

Kalau icon lama masih membuka versi v4:

1. Hapus icon Money Tracker lama dari Home Screen.
2. Buka link app lewat Safari.
3. Tekan tombol **Share**.
4. Tekan **Add to Home Screen**.
5. Tekan **Add**.

Sekarang icon baru membuka v5.

---

# Cara pakai sehari-hari

Tidak perlu tekan tombol sync setiap kali.

Cukup:

1. Login di MacBook.
2. Login di iPhone.
3. Input transaksi seperti biasa.

App akan sinkron otomatis.

Statusnya:

- **Cloud aktif** = semua aman.
- **Menyinkronkan** = sedang kirim data.
- **Mode offline** = internet mati, data menunggu.
- **Cloud error** = ada pengaturan yang belum benar.

---

# Kalau error, lihat ini

## “Cloud belum diatur”

Artinya `firebase-config.js` belum diisi atau belum di-upload ke GitHub.

## “Permission denied”

Artinya Firestore Rules belum benar atau belum tekan **Publish**.

## “Invalid API key”

Artinya isi `firebase-config.js` salah. Salin ulang dari Firebase Project Settings.

## “Unauthorized domain”

Tambahkan:

`username.github.io`

ke Authentication → Settings → Authorized domains.

## Login berhasil tapi data kosong

Di device yang datanya paling lengkap, tekan:

**Kirim Data Device Ini ke Cloud**

Lalu di device kedua tekan:

**Ambil Data dari Cloud**

## iPhone masih menampilkan versi lama

Hapus icon Home Screen lama, buka Safari, refresh, lalu Add to Home Screen ulang.

---

# Aturan emas 🥇

Sebelum pertama kali menyalakan cloud:

**Download Backup JSON dulu.**

Sesudah cloud aktif:

**Tetap download backup JSON seminggu sekali.**

Cloud membantu sinkron, backup membantu kalau salah hapus.
