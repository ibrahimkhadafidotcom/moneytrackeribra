MONEY TRACKER v7.0 — EDIT MASTER

FITUR BARU
===========

1. Master Kategori sekarang memiliki tombol Edit.
2. Master Rekening sekarang memiliki tombol Edit.
3. Form berubah ke mode "Simpan Perubahan" saat data sedang diedit.
4. Tersedia tombol "Batal Edit" untuk kembali ke mode tambah data.
5. Nama master yang sudah dipakai tidak dapat diduplikasi.

KEAMANAN DATA TERKAIT
=====================

Saat kategori diubah:
- Transaksi yang memakai kategori lama ikut diperbarui.
- Group dan jenis transaksi terkait ikut diperbarui.
- Budget plan yang memakai kategori lama ikut diperbarui.

Saat nama rekening diubah:
- Rekening asal pada transaksi lama ikut diperbarui.
- Rekening tujuan transfer pada transaksi lama ikut diperbarui.
- Perhitungan saldo dan laporan tetap tersambung ke nama rekening baru.

VERSI CACHE
===========

Service worker menggunakan cache v7.0 agar browser dan PWA mengambil source terbaru.

SETELAH DEPLOY
==============

- Tunggu GitHub Pages selesai memperbarui situs.
- MacBook: tekan Command + Shift + R.
- iPhone: tutup aplikasi lalu buka kembali.
- Jika versi lama masih terlihat, hapus shortcut dari Home Screen lalu tambahkan ulang.
