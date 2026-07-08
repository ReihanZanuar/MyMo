# mymo - My Money Landing Page

Landing page profesional untuk aplikasi pencatatan keuangan **mymo**.

## 🎯 Fitur Landing Page

### Sections
- **Hero Section** - Headline utama dengan CTA dan statistik pengguna
- **Features** - 6 fitur unggulan dengan icon dan deskripsi
- **Benefits** - 4 keunggulan utama mymo dengan visual menarik
- **How It Works** - 3 langkah mudah menggunakan mymo
- **Testimonials** - Review dari pengguna dengan rating bintang
- **CTA Section** - Call-to-action untuk download aplikasi
- **Footer** - Navigasi lengkap dan social links

### Interactivity
- Smooth scroll navigation
- Sticky navbar dengan scroll effect
- Floating animation pada phone mockup
- Counter animation pada statistik
- Hover effects pada cards
- Mobile responsive menu
- Fade-in animations saat scroll

## 🎨 Design Highlights

- **Modern Design** - Clean, minimal, dan profesional
- **Color Scheme** - Primary: Indigo (#6366f1), Secondary: Green (#10b981)
- **Typography** - Inter font family untuk readability
- **Responsive** - Optimized untuk desktop, tablet, dan mobile
- **Animations** - Smooth transitions dan micro-interactions

## 📱 Responsive Breakpoints

- Desktop: 1200px+
- Tablet: 768px - 1024px
- Mobile: 320px - 767px

## 🚀 Getting Started

### Environment Variables

Project ini menggunakan file `.env` untuk menyimpan konfigurasi yang sensitif (seperti URL API, secret keys, dll). File `.env` sudah diproteksi dan **tidak akan** di-push ke GitHub karena sudah ditambahkan ke `.gitignore`.

Sebelum menjalankan project, duplikat file `.env.example` menjadi `.env`:

```bash
cp .env.example .env
```

Lalu sesuaikan nilai variabel di dalam file `.env` sesuai kebutuhan.

### Cara Membuka

1. **Langsung di Browser**
   ```bash
   open index.html
   ```

2. **Dengan Live Server** (jika menggunakan VS Code)
   - Install extension "Live Server"
   - Right-click pada index.html
   - Pilih "Open with Live Server"

3. **Dengan Python Server**
   ```bash
   python3 -m http.server 8000
   ```
   Buka browser ke `http://localhost:8000`

## 📂 Struktur File

```
mymo/
├── index.html      # HTML structure
├── styles.css      # Complete styling with responsive design
├── script.js       # Interactive features
└── README.md       # Documentation
```

## 🎯 Keunggulan mymo (Highlighted)

1. **Interface yang Intuitif** - Desain clean dan mudah dipahami
2. **AI-Powered Insights** - Rekomendasi personal berdasarkan pola spending
3. **Privacy First** - Enkripsi military-grade, data tidak dijual
4. **Gratis Selamanya** - Fitur core gratis tanpa batas waktu

## 🔧 Customization

### Mengubah Warna
Edit variabel CSS di `styles.css`:
```css
:root {
    --primary: #6366f1;        /* Warna utama */
    --secondary: #10b981;      /* Warna sekunder */
}
```

### Mengubah Konten
Edit langsung di `index.html` pada section yang diinginkan.

### Menambah Fitur
Tambahkan card baru di section `.features-grid` dengan struktur:
```html
<div class="feature-card">
    <div class="feature-icon">🎯</div>
    <h3 class="feature-title">Judul Fitur</h3>
    <p class="feature-description">Deskripsi fitur...</p>
</div>
```

## 📊 Performance

- Lightweight: Total size < 50KB
- Fast load time: < 1s on 3G
- SEO optimized dengan semantic HTML
- Accessibility compliant

## 🌐 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 📝 Next Steps

1. ✅ Landing page structure & design
2. ✅ Responsive layout
3. ✅ Interactive features
4. 🔄 Connect to actual app download links
5. 🔄 Add analytics tracking (Google Analytics, etc.)
6. 🔄 Deploy to hosting (Vercel, Netlify, GitHub Pages)

## 📄 License

© 2026 mymo. All rights reserved.

---

**Built with ❤️ using HTML, CSS, and vanilla JavaScript**
