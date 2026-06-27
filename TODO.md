# TODO - Rapihkan UI & Bug (src/app/**)

## Step 1 — Baseline review (done)
- Identifikasi isu dari `home.page.ts/html`, `payment.page.ts`, `message.page.ts`, `profile.page.ts`, dan routing/app lifecycle.

## Step 2 — Implement fixes (next)
1. Fix PaymentPage: hapus statement `styleUrls: ['./payment.page.scss']` yang tersisip di method.
2. Fix HomePage template: rapikan bagian duplikat/unconditional blocks di `home.page.html`.
3. Fix MessagePage: ganti penggunaan `alert()` native dengan Ionic `AlertController/ToastController` dan rapikan guard.
4. Fix ProfilePage: ganti hardcoded base URL menjadi `environment.apiBaseUrl`.
5. Standardisasi kecil: pastikan tidak ada pemanggilan interval ganda (review `PaymentPage` polling).

## Step 3 — Validation
- Jalankan build/tes kompilasi untuk memastikan tidak ada error TS/Angular template.

## Step 4 — Sanity checks manual
- Alur utama: login → home → buat pesanan → chat → payment → selesai → rating.

