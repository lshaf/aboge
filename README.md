# Kalender Aboge

Sistem penanggalan Jawa (siklus windu 8 tahun) — dibangun dengan **Vue 3 + Vite**.

Aplikasi ini menampilkan:

- **Masehi** — kalender Masehi dengan padanan tanggal Aboge (hari, pasaran, neptu) setiap hari.
- **Kalender** — satu siklus windu penuh, kartu per bulan, klik untuk detail harian.
- **Hari Baik** — perhitungan *dakon* neptu (Hitung & Dasar).
- **Hari Peringatan** — hitung hari ke-1, 7, 35, 40, 100, 1000 dari hari & pasaran terpilih.

Di bagian atas (hero) ada **kolofon "Hari Iki"** yang menampilkan tanggal hari ini
langsung dalam reckoning Aboge. Aplikasi ini juga merupakan **PWA**: bisa dipasang
ke layar utama dan dibuka **offline**.

## Menjalankan secara lokal

```bash
npm install
npm run dev      # server pengembangan di http://localhost:5173
```

Build untuk produksi:

```bash
npm run build    # menghasilkan folder dist/
npm run preview  # melihat hasil build secara lokal
```

## Deploy ke GitHub Pages

Repository ini sudah berisi workflow GitHub Actions di
[`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) yang otomatis
mem-build dan men-deploy ke GitHub Pages setiap kali ada push ke branch `main`.

Langkah satu kali untuk mengaktifkannya:

1. Buat repository di GitHub dan push kode ini ke branch `main`:
   ```bash
   git init
   git add .
   git commit -m "Kalender Aboge — Vue"
   git branch -M main
   git remote add origin https://github.com/<username>/<repo>.git
   git push -u origin main
   ```
2. Di GitHub, buka **Settings → Pages**.
3. Pada bagian **Build and deployment → Source**, pilih **GitHub Actions**.
4. Setiap push ke `main` akan menjalankan workflow. Setelah selesai, situs
   tersedia di `https://<username>.github.io/<repo>/`.

> Konfigurasi Vite memakai `base: './'` (path relatif), sehingga build berfungsi
> di subpath GitHub Pages tanpa perlu menyebut nama repo.

## PWA / Offline

Service worker dan manifest dibuat otomatis oleh `vite-plugin-pwa` saat `npm run build`.
Setelah situs dibuka sekali secara online, app shell dan font ter-cache sehingga
aplikasi tetap bisa dipakai tanpa koneksi. Di browser yang mendukung, akan muncul
opsi **"Install"** / "Add to Home Screen".

Ikon (di `public/`) dibuat dari `icon.png` (wayang + kalender); latar hitamnya
dijadikan transparan, plus varian *maskable* (Android) dan *apple-touch-icon* (iOS).

## Struktur

```
src/
  main.js                  # entry point
  App.vue                  # layout, tab, grid windu, modal
  lib/aboge.js             # konstanta + logika kalender (murni JS)
  components/
    AbogeModal.vue         # detail harian per bulan
    KalenderUmum.vue       # kalender Masehi ↔ Aboge
    HariBaikHitung.vue     # kalkulator dakon dua orang
    HariBaikDasar.vue      # tabel referensi dakon
    DakonTable.vue         # tabel dakon (dipakai ulang)
    HariPeringatan.vue     # milestone hari
```
