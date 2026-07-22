MONEY TRACKER v7.2 — QUICK BUDGET DASHBOARD

Pembaruan utama:
- Kolom Aksi ditambahkan paling kanan pada tabel Semua Master & Status Budgeting.
- Master yang belum memiliki budget menampilkan tombol + Isi Budget.
- Master yang sudah memiliki budget menampilkan tombol Ubah Budget.
- Nominal dapat ditambah atau diperbarui langsung melalui modal di Dashboard.
- Budget otomatis disimpan ke periode aktif dan status Dashboard langsung diperbarui.
- Data tetap memakai saveState sehingga Cloud Sync berjalan seperti perubahan lainnya.
- Kategori Transfer tetap tampil, tetapi ditandai Tidak diperlukan karena tidak membutuhkan budget.

Validasi:
- Budget hanya dapat disimpan jika nominal lebih dari Rp0.
- Penyimpanan dibatalkan jika periode atau Master berubah saat modal sedang terbuka.
- Data budget ganda untuk kategori/periode yang sama dikonsolidasikan saat diperbarui.
- Cache PWA dinaikkan ke v7.2 agar browser mengambil source terbaru.
