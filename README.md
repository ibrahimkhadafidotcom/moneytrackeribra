# Money Tracker Offline — Realtime Balance v4

Versi ini menambahkan tampilan saldo rekening realtime seperti area G2:J7 di spreadsheet.

## Tambahan v4

- Panel utama **Saldo Rekening Sekarang**.
- Saldo realtime per rekening:
  - BCA
  - Dompet
  - Dana
  - Shopeepay
  - rekening lain dari Master Rekening
- Total uang sekarang.
- Perhitungan saldo:
  - saldo awal rekening
  - + semua pemasukan ke rekening
  - - semua pengeluaran dari rekening
  - - transfer keluar
  - + transfer masuk
- Dashboard budgeting visual tetap ada.

## Cara Mengatur Saldo Awal

Buka menu **Master → Master Rekening**, lalu isi saldo awal masing-masing rekening.

Contoh:
- BCA: 500000
- Dompet: 100000
- Dana: 0
- Shopeepay: 0

Setelah itu, setiap transaksi akan otomatis mengubah saldo rekening.

## Update ke GitHub Pages

Replace/upload file berikut di root repository:
- index.html
- manifest.json
- sw.js
- README.md

Pastikan file `.nojekyll` tetap ada.

Jika di iPhone masih tampil versi lama:
1. Buka link app dari Safari.
2. Refresh beberapa kali.
3. Kalau masih sama, hapus icon Home Screen lama lalu Add to Home Screen ulang.
