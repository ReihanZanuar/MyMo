# Sistem Desain & Alur Aplikasi (PWA)

File ini berisi panduan desain (Design System) dan alur (Flow) yang dapat dibaca oleh AI (seperti Google Stitch) untuk menghasilkan tampilan aplikasi web Progressive Web App (PWA) yang konsisten.

## 1. Vibe & Estetika (Vibe Design)
- **Tema Utama:** Modern, minimalis, profesional, dan responsif.
- **Gaya Visual:** Menggunakan banyak *whitespace* (ruang kosong) agar terlihat bersih, efek *glassmorphism* (kaca transparan buram) tipis pada komponen yang melayang (seperti navigasi), dan bayangan lembut (*soft shadows*) untuk memberikan kesan kedalaman.
- **Fokus PWA:** Terasa seperti aplikasi *native* (asli) saat diinstal di HP (App-like feel), transisi antar halaman yang halus, dan mendukung *Dark Mode*.

## 2. Palet Warna (Color Palette)
- **Warna Utama (Primary):** `#2563EB` (Biru) - Digunakan untuk tombol aksi utama, tautan, dan elemen aktif.
- **Warna Sekunder (Secondary):** `#10B981` (Hijau Emerald) - Digunakan untuk notifikasi sukses, status, dan aksen pelengkap.
- **Latar Belakang Terang (Light Background):** `#F8FAFC` (Slate 50)
- **Latar Belakang Gelap (Dark Background):** `#0F172A` (Slate 900)
- **Permukaan/Card Terang (Light Surface):** `#FFFFFF`
- **Permukaan/Card Gelap (Dark Surface):** `#1E293B` (Slate 800)
- **Teks Utama:** `#0F172A` (Light Mode) / `#F1F5F9` (Dark Mode)
- **Teks Sekunder:** `#64748B` (Light Mode) / `#94A3B8` (Dark Mode)
- **Error/Destructive:** `#EF4444` (Merah)

## 3. Tipografi (Typography)
- **Font Heading (H1, H2, H3):** `Inter`, sans-serif (Tebal, bersih, modern)
- **Font Body:** `Roboto`, sans-serif (Netral, tingkat keterbacaan tinggi untuk teks panjang)
- **Ukuran:**
  - H1: 32px (Mobile) / 40px (Desktop), Bold, Line-height 1.2
  - H2: 24px (Mobile) / 32px (Desktop), Semi-bold, Line-height 1.3
  - Body: 16px, Regular, Line-height 1.5
  - Caption/Small Text: 14px, Regular

## 4. Tata Letak & Spasi (Layout & Spacing)
- **Pendekatan Layout:** *Mobile-first* (Rancangan awal difokuskan untuk layar HP, kemudian disesuaikan/melebar untuk Tablet dan Desktop).
- **Spasi (Padding/Margin):** Menggunakan skala kelipatan 4px atau 8px (misalnya: 8px, 16px, 24px, 32px) untuk menjaga konsistensi jarak antar elemen.
- **Radius Sudut (Border Radius):**
  - Komponen kecil (Tombol & Input Text): `8px` (Sedikit membulat)
  - Komponen besar (Card, Modal, Dialog, Image): `16px` (Membulat lembut)

## 5. Komponen UI Utama (Core UI Components)
- **Tombol Utama (Primary Button):** Latar belakang warna Primary (`#2563EB`), teks putih tebal, border-radius 8px. Efek saat ditekan/di-hover: Terdapat transisi bayangan bertambah atau sedikit memperbesar (`transform: scale(1.02)`).
- **Tombol Sekunder (Secondary Button):** Latar transparan, garis tepi (*outline*) warna Primary, teks warna Primary.
- **Card (Kartu Konten):** Latar warna Surface (putih/gelap), border-radius 16px, memiliki bayangan halus (`box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1)`), padding dalam 24px.
- **Input Form:** Latar abu-abu sangat terang, tanpa garis tepi tegas kecuali saat state `:focus` (garis tepi akan berubah menjadi warna biru menyala).

## 6. Syarat Khusus PWA (PWA Specific Elements)
Instruksi tambahan untuk meng-generate struktur Progressive Web App:
1. **Navigasi Bawah (Bottom Navigation Bar):** Sebagai navigasi utama di HP (seperti Beranda, Cari, Profil), navigasi ini harus berada di bagian paling bawah layar dan bersifat *fixed* (menempel). Untuk versi Desktop, navigasi ini secara otomatis berubah menjadi *Sidebar* di kiri atau *Top Navbar* di atas.
2. **Prompt "Add to Home Screen" (A2HS):** Siapkan UI khusus berupa *banner* atas atau *bottom sheet* (panel bawah) yang mengajak user menginstal web menjadi aplikasi HP.
3. **App Manifest Configuration:** Atur `theme_color` menjadi `#2563EB` agar *status bar* (bagian atas HP tempat jam dan baterai) mengikuti warna *brand*.
4. **Offline State / Fallback UI:** Siapkan desain halaman atau ilustrasi khusus yang akan muncul jika HP kehilangan koneksi internet (misalnya maskot lucu dengan teks "Anda sedang offline").

## 7. Alur Halaman (Screen Flow)
Google Stitch perlu membuat antarmuka untuk 4 layar utama berikut:

**Layar 1: Splash Screen / Onboarding**
- Latar belakang layar penuh dengan warna utama (`#2563EB`).
- Logo putih berada tepat di tengah layar.
- Desain *skeleton loading* (animasi garis/kotak berkedip sebelum konten asli dimuat) sebagai transisi menuju halaman Beranda.

**Layar 2: Halaman Beranda (Home / Dashboard)**
- **App Bar (Atas):** Teks sapaan "Halo, [Nama]" di kiri dan foto profil pengguna berbentuk lingkaran di kanan atas.
- **Hero Banner:** *Card* besar berisi promo/info utama dengan desain gradien warna utama dan tombol *Call to Action* (CTA).
- **Quick Actions:** Barisan ikon bulat secara horizontal untuk pintasan menu cepat.
- **Content Feed:** Daftar konten ke bawah berbentuk *Cards*. Setiap card memuat gambar, judul, teks singkat, dan ikon aksi (misal: tombol suka).
- **Bottom Navigation:** Menempel di layar bawah dengan ikon menu (Beranda, Jelajah, Profil).

**Layar 3: Halaman Detail (Detail View)**
- **Header:** Menggunakan *Hero Image* (gambar besar yang melebar) dengan tombol panah kembali (Back) mengambang di pojok kiri atas (berwarna putih dengan latar semi-transparan).
- **Body Konten:** Judul artikel/produk, teks deskripsi panjang yang tersusun rapi dengan *line-height* lega.
- **Floating Action Area:** Bagian paling bawah layar memiliki panel berwarna solid (*fixed*) berisi harga dan tombol lebar "Beli" / "Simpan" agar selalu mudah ditekan oleh jempol pengguna (App-like behavior).

**Layar 4: Halaman Profil & Pengaturan**
- Foto profil besar di tengah dengan nama pengguna dan email di bawahnya.
- **List Menu:** Daftar menu pengaturan memanjang ke bawah (Akun, Notifikasi, Bantuan).
- Setiap menu memiliki ikon di sebelah kiri dan ikon panah (`chevron-right`) di sebelah kanan.
- **Toggle Switch:** Sebuah sakelar geser (*switch*) di dalam list menu untuk mengaktifkan "Dark Mode" dan "Push Notifications".
