# Setup Google OAuth untuk MyMo

## File yang Sudah Dibuat

1. **signup.html** - Halaman pendaftaran akun baru dengan form dan Google OAuth
2. **signup-script.js** - Logic untuk registrasi dan Google OAuth signup
3. **login-script.js** (updated) - Ditambahkan fungsi Google OAuth login

## Cara Setup Google OAuth

### 1. Dapatkan Google Client ID

1. Buka [Google Cloud Console](https://console.cloud.google.com/)
2. Buat project baru atau pilih project yang sudah ada
3. Aktifkan **Google+ API**
4. Pergi ke **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Pilih **Web application**
6. Tambahkan **Authorized JavaScript origins**:
   - `http://localhost:3000`
   - `http://localhost:5173` (untuk Vite dev server)
   - Domain production Anda
7. Tambahkan **Authorized redirect URIs**:
   - `http://localhost:3000`
   - `http://localhost:5173`
   - Domain production Anda
8. Copy **Client ID** yang didapat

### 2. Update Client ID di Code

Ganti `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com` dengan Client ID Anda di:

- **signup-script.js** (line ~246)
- **login-script.js** (line ~179)

```javascript
client_id: 'YOUR_ACTUAL_CLIENT_ID.apps.googleusercontent.com',
```

## Fitur yang Sudah Diimplementasi

### Signup Page (signup.html)
- ✓ Form registrasi dengan validasi:
  - Nama lengkap (minimal 2 karakter)
  - Email (format valid)
  - Password (minimal 8 karakter)
  - Konfirmasi password (harus sama)
  - Checkbox syarat & ketentuan (wajib)
- ✓ Toggle visibility password
- ✓ Google OAuth signup button
- ✓ Link ke halaman login
- ✓ Redirect ke dashboard setelah berhasil

### Login Page (login.html - updated)
- ✓ Google OAuth login button (sekarang functional)
- ✓ Integrasi dengan Google Sign-In API
- ✓ Redirect ke dashboard setelah berhasil

### Authentication Flow
- Simpan user data di `localStorage` (demo purposes)
- Data yang disimpan:
  - `mymo_user`: { fullname, email, picture (jika Google), googleAuth }
  - `mymo_auth_token`: token autentikasi

## Testing

1. Buka browser di `http://localhost:5173/signup.html`
2. Test registrasi manual:
   - Isi semua field dengan data valid
   - Klik "Daftar Sekarang"
   - Harus redirect ke Vue dashboard
3. Test Google OAuth (setelah setup Client ID):
   - Klik tombol "Google"
   - Login dengan akun Google
   - Harus redirect ke Vue dashboard
4. Test login di `http://localhost:5173/login.html`

## Catatan Keamanan

⚠️ **PENTING untuk Production:**

1. **JANGAN validate JWT di client-side** - implementasi saat ini hanya untuk demo
2. **Kirim credential ke backend** untuk verifikasi yang aman
3. **Gunakan HTTPS** untuk production
4. **Implementasi proper session management** di backend
5. **Validate token di server-side** dengan Google's token verification
6. **Gunakan secure cookie** untuk menyimpan auth token, bukan localStorage

## Backend Integration (untuk Production)

```javascript
// Contoh flow yang benar:
// 1. Client dapat credential dari Google
// 2. Kirim credential ke backend
fetch('/api/auth/google', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ credential: response.credential })
})
// 3. Backend verify token dengan Google
// 4. Backend buat session/JWT
// 5. Return session ke client
```

## Next Steps

- Replace Client ID dengan yang asli
- Test signup dan login flow
- Implementasi backend verification untuk production
- Setup database untuk menyimpan user data
- Implementasi proper session management
