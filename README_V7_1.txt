MONEY TRACKER v7.1 — MASTER BUDGET STATUS

Pembaruan utama

- Semua Master Kategori selalu tampil pada Dashboard, termasuk yang belum
  memiliki budgeting pada periode aktif.
- Ringkasan jumlah master menampilkan Sudah Diisi, Belum Diisi, dan Total
  Master.
- Setiap master menampilkan Jenis, Group, Expected, Actual, serta Status
  Budgeting.
- Budget bernilai Rp0 atau belum pernah dibuat diberi status Belum Diisi.
- Master Transfer tetap tampil dengan status Tidak Perlu Budget.

Teknis

- Dashboard menggunakan Master Kategori sebagai sumber daftar utama dan
  mencocokkan budget berdasarkan periode aktif.
- Pencocokan actual kategori dibuat case-insensitive agar perubahan kapitalisasi
  tidak memutus nilai pada dashboard.
- Cache PWA dinaikkan ke v7.1 agar browser mengambil source terbaru.
