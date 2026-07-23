MONEY TRACKER v7.8

Perubahan:
- Memperbaiki error localStorage quota saat data cloud dipasang.
- Backup lokal otomatis dibatasi ke satu snapshot terbaru.
- Backup lama dibersihkan hanya ketika ruang browser tidak mencukupi.
- Kegagalan membuat backup tidak lagi menggagalkan pemasangan data cloud.
- Penyimpanan state mencoba ulang setelah membersihkan snapshot lama.
- Status sinkronisasi selalu dipulihkan meski pemasangan snapshot gagal.
- Sinkronisasi awal dapat mencoba kembali setelah kegagalan sementara.
- Cache PWA diperbarui ke v7.8.
