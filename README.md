# Money Tracker Offline — Visual Budgeting Edition v3

Versi ini menambahkan tampilan utama visual seperti dashboard budgeting di spreadsheet.

## Tambahan v3

- Visual Money Dashboard.
- Status overview Income, Needs, Wants, Debt.
- Donut chart komposisi actual expense.
- Expected vs Actual by group.
- Cash Flow Summary.
- Needs Summary, Wants Summary, Debt Summary, Income Summary.
- Persentase actual vs expected.
- Progress bar visual per budget category.
- Tetap offline-first dan bisa dibuat PWA.

## Cara Pakai di Desktop

1. Extract ZIP.
2. Buka `index.html` langsung di browser.

Untuk mode PWA/offline yang lebih stabil:

```bash
python3 -m http.server 8000
```

Lalu buka:

```text
http://localhost:8000
```

## Cara Pakai di iPhone

Agar terasa seperti aplikasi:
1. Upload folder ini ke hosting HTTPS, GitHub Pages, Netlify, Vercel, atau server lokal yang bisa diakses iPhone.
2. Buka link app melalui Safari iPhone.
3. Tap tombol Share.
4. Pilih Add to Home Screen.
5. Buka dari ikon yang muncul di Home Screen.

Catatan: data tersimpan di browser/device. Backup JSON secara rutin.
