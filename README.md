# MyMo - AI-Powered Personal Finance Tracker

MyMo adalah aplikasi pencatatan keuangan cerdas yang dilengkapi dengan fitur AI Assistant, analisis data, dan pemindaian struk (OCR). Project ini terdiri dari Landing Page profesional, Web App berbasis Vue 3, Backend API berbasis Node.js/Express, dan Microservice OCR berbasis Python.

## 🌟 Fitur Utama

- **Landing Page & Web App:** Antarmuka responsif dan modern untuk menarik pengguna serta Web App lengkap untuk manajemen keuangan.
- **AI-Powered Insights (RAG):** Asisten cerdas yang menggunakan Retrieval-Augmented Generation (RAG) untuk memberikan insight personal terhadap pola pengeluaran.
- **OCR Struk:** Microservice Python (FastAPI) untuk mengekstrak data dari foto struk belanja secara otomatis.
- **Multi-Akun & Dompet:** Mendukung manajemen keuangan dari berbagai sumber dana.
- **Analisis & Laporan:** Visualisasi data pengeluaran dan pemasukan dengan Chart.js.

## 🛠 Tech Stack

- **Frontend:** Vue 3, Vite, Pinia, Vue Router, Tailwind/Custom CSS.
- **Backend:** Node.js, Express.js, PostgreSQL.
- **OCR Service:** Python, FastAPI.
- **Infrastruktur & Deployment:** Docker, Docker Compose, Nginx, Cloudflare Tunnels.

## 📂 Struktur Project

```
mymo/
├── src/                # Vue 3 Frontend (Web App)
├── backend/            # Node.js Express API & RAG System
├── ocr-service/        # Python FastAPI untuk ekstraksi struk
├── docs/               # Dokumentasi sistem & arsitektur
├── public/             # Aset statis frontend
├── index.html          # Landing Page utama
├── login.html          # Halaman Login statis
├── signup.html         # Halaman Signup statis
├── docker-compose.yml  # Konfigurasi deployment Docker
└── ...
```

## 🚀 Getting Started

### 1. Prerequisites

Pastikan Anda telah menginstal:
- [Node.js](https://nodejs.org/) (v18 atau lebih baru)
- [Python](https://www.python.org/) (jika menjalankan OCR tanpa Docker)
- [Docker & Docker Compose](https://www.docker.com/) (Direkomendasikan)

### 2. Environment Variables

Project ini membutuhkan beberapa konfigurasi `.env`. 

**Frontend:**
Duplikat file `.env.example` menjadi `.env` di root direktori:
```bash
cp .env.example .env
```
File ini sudah diproteksi dan **tidak akan** di-push ke GitHub. Sesuaikan nilai variabel `VITE_API_URL`.

**Backend:**
Duplikat konfigurasi untuk backend:
```bash
cp backend/.env.example backend/.env
```
Sesuaikan konfigurasi database dan API key di dalamnya.

### 3. Cara Menjalankan

#### Menggunakan Docker (Rekomendasi)
Cara termudah untuk menjalankan seluruh sistem (PostgreSQL, Backend, OCR, Web App, Cloudflare Tunnel):
```bash
docker-compose up -d --build
```
Setelah berjalan, Web App dapat diakses melalui port yang dikonfigurasi (misalnya `http://localhost:8080`).

#### Menjalankan secara Manual (Local Development)

**1. Jalankan Database (PostgreSQL)**
Pastikan Anda memiliki instance PostgreSQL yang berjalan dan sesuai dengan kredensial di `backend/.env`.

**2. Jalankan Backend**
```bash
cd backend
npm install
npm run dev
```

**3. Jalankan OCR Service**
```bash
cd ocr-service
pip install -r requirements.txt
python main.py
```

**4. Jalankan Frontend (Vite)**
```bash
npm install
npm run dev
```
Buka browser ke `http://localhost:5173` (atau port default Vite lainnya).

## 📄 Dokumentasi Tambahan

Untuk dokumentasi lebih lanjut mengenai deployment, arsitektur, dan integrasi fitur spesifik, silakan lihat file berikut:
- [`DOCKER_DEPLOYMENT.md`](DOCKER_DEPLOYMENT.md) - Panduan deployment lengkap menggunakan Docker.
- [`GOOGLE_OAUTH_SETUP.md`](GOOGLE_OAUTH_SETUP.md) - Panduan setup Google Login.
- [`docs/`](docs/) - Dokumentasi lengkap arsitektur dan API.

## 📄 License

© 2026 MyMo. All rights reserved.
