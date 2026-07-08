# MyMo - Personal Finance Management System

## Overview

MyMo adalah aplikasi web manajemen keuangan pribadi (personal finance management) yang membantu pengguna melacak pemasukan, pengeluaran, mengatur kategori transaksi, melihat analitik keuangan, dan berinteraksi dengan AI assistant untuk mendapatkan insight tentang keuangan mereka.

## Tujuan Aplikasi

MyMo dirancang untuk:
- Memudahkan pencatatan transaksi keuangan harian
- Memberikan visualisasi dan analitik keuangan yang mudah dipahami
- Membantu pengguna mengatur budget per kategori
- Menyediakan AI assistant untuk memberikan insight dan rekomendasi keuangan
- Mengelola data keuangan dengan aman dan terorganisir

## Arsitektur Teknologi

MyMo dibangun dengan arsitektur modern full-stack:

### Frontend
- **Framework**: Vue.js 3 dengan Composition API
- **Routing**: Vue Router untuk single-page application
- **State Management**: Pinia untuk state management
- **Build Tool**: Vite untuk development dan build
- **HTTP Client**: Axios untuk API communication
- **Styling**: CSS dengan design system khusus (indigo/purple gradient theme)

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: PostgreSQL
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: express-validator
- **AI Integration**: Ollama API dengan model DeepSeek R1:14B

### Infrastructure
- **Containerization**: Docker dengan multi-stage builds
- **Orchestration**: Docker Compose
- **Web Server**: Nginx sebagai reverse proxy dan static file server
- **Database**: PostgreSQL container dengan persistent volume

## Fitur Utama

### 1. Autentikasi dan Manajemen User
- Registrasi user dengan email dan password
- Login dengan email/password
- Login dengan Google OAuth
- JWT-based authentication
- Logout dengan cache clearing

### 2. Manajemen Transaksi
- Tambah transaksi (income/expense)
- Edit transaksi
- Hapus transaksi
- Filter transaksi berdasarkan tanggal, tipe, kategori
- Pagination untuk daftar transaksi
- Summary transaksi (total income, expense, balance)

### 3. Manajemen Kategori
- Kategori default otomatis dibuat saat registrasi
- Tambah kategori custom
- Edit kategori (nama, tipe, warna, icon, emoji, budget)
- Hapus kategori
- Budget tracking per kategori
- Kategori dapat bertipe: income, expense, atau transfer

### 4. Analitik dan Reports
- Summary keuangan (income vs expense)
- Visualisasi data keuangan
- Reports berdasarkan periode waktu
- Tracking budget vs actual spending per kategori

### 5. AI Chat Assistant
- Integrasi dengan Ollama API (DeepSeek R1:14B model)
- Multiple endpoint fallback system (local network, internet)
- Session-based endpoint caching untuk performa optimal
- Conversation history management
- Context-aware responses tentang keuangan

### 6. User Profile Management
- Update profile (nama, email)
- Change password
- Update avatar
- Delete account (cascade delete transactions dan categories)

## User Flow

### Onboarding
1. User mengunjungi landing page
2. Register dengan email/password atau Google OAuth
3. Sistem otomatis membuat default categories
4. User diarahkan ke dashboard

### Daily Usage
1. User login ke aplikasi
2. View dashboard dengan summary keuangan
3. Add transaction (manual atau via scan receipt)
4. View dan manage transactions
5. View analytics dan reports
6. Interact dengan AI assistant untuk insight
7. Manage categories dan budgets
8. Update settings dan profile

### Data Management
1. Semua data disimpan per user (multi-tenant)
2. User hanya bisa akses data mereka sendiri
3. Data terhapus otomatis saat delete account
4. JWT token untuk session management

## Design System

### Color Palette
- **Primary**: Indigo (#667eea)
- **Secondary**: Purple (#764ba2)
- **Gradient**: Linear gradient dari indigo ke purple
- **Background**: White untuk light mode, dark blue untuk dark mode
- **Text**: Dark gray (#1f2937) untuk light mode, light gray (#f3f4f6) untuk dark mode

### Typography
- **Font Family**: Inter (Google Fonts)
- **Hierarchy**: Heading sizes dari h1 (2rem) sampai h6 (0.875rem)
- **Body Text**: 0.875rem untuk body, 0.75rem untuk small text

### Components Style
- **Border Radius**: 8px untuk small, 12px untuk medium, 16px untuk large
- **Shadows**: Subtle shadows dengan blur dan spread
- **Icons**: Minimalist SVG icons
- **Buttons**: Gradient backgrounds dengan hover effects

## Security Features

### Authentication
- Password hashing dengan bcryptjs (salt rounds: 10)
- JWT tokens dengan expiration
- Secure cookie handling
- Google OAuth integration

### Authorization
- Middleware-based authentication check
- User-scoped data access (user_id filtering)
- Protected API endpoints
- Token verification pada setiap request

### Data Protection
- SQL injection prevention via parameterized queries
- Input validation dengan express-validator
- XSS protection
- CORS configuration
- Environment variables untuk sensitive data

## Performance Optimizations

### Frontend
- Vite untuk fast development dan optimized production builds
- Code splitting dengan dynamic imports
- Lazy loading untuk routes
- Efficient state management dengan Pinia
- Minimal re-renders dengan Vue reactivity

### Backend
- PostgreSQL connection pooling
- Indexed database queries
- Efficient SQL queries dengan JOINs
- Ollama endpoint caching untuk faster AI responses
- Timeout handling untuk long-running operations

### Deployment
- Docker multi-stage builds untuk smaller images
- Nginx untuk efficient static file serving
- Gzip compression
- Production-optimized builds

## Scalability Considerations

### Current Architecture
- Single database instance (PostgreSQL)
- Stateless backend (JWT-based auth)
- Docker containers untuk easy deployment
- Horizontal scaling ready (stateless design)

### Future Scalability
- Load balancer dapat ditambahkan di depan backend
- Database replication untuk read scaling
- Redis untuk session caching
- CDN untuk static assets
- Microservices separation jika diperlukan

## Monitoring dan Logging

### Current Logging
- Console logging untuk development
- Error logging di backend
- Request logging di Express
- Ollama connection status logging

### Future Improvements
- Structured logging dengan Winston atau Bunyan
- Log aggregation dengan ELK stack
- Application monitoring dengan Prometheus
- Error tracking dengan Sentry
- Performance monitoring

## Development Workflow

### Local Development
1. Clone repository
2. Install dependencies (npm install di root dan backend)
3. Setup PostgreSQL database
4. Create .env files dengan configuration
5. Run backend: `cd backend && npm run dev`
6. Run frontend: `npm run dev`
7. Access pada localhost:5173 (frontend) dan localhost:3000 (backend)

### Production Deployment
1. Build Docker images
2. Configure environment variables
3. Deploy dengan Docker Compose
4. Setup reverse proxy (nginx)
5. Configure domain dan SSL
6. Monitor logs dan performance

## API Architecture

### RESTful Design
- Resource-based URLs
- HTTP methods (GET, POST, PUT, DELETE)
- JSON request/response format
- Status codes yang semantic
- Error handling dengan consistent format

### Authentication Flow
1. User login/register → Backend return JWT token
2. Frontend simpan token di localStorage
3. Setiap API request include token di Authorization header
4. Backend verify token via middleware
5. Extract userId dari token untuk data scoping

### Error Handling
- Validation errors: 400 Bad Request
- Authentication errors: 401 Unauthorized
- Not found errors: 404 Not Found
- Server errors: 500 Internal Server Error
- Consistent error response format

## Data Model Overview

### Users Table
- Menyimpan data user (email, password hash, nama, avatar)
- Google OAuth integration (google_id field)
- Timestamps untuk created_at dan updated_at

### Categories Table
- User-scoped categories
- Tipe: income, expense, transfer
- Customizable (nama, warna, icon, emoji)
- Budget field untuk budget tracking
- Foreign key ke users

### Transactions Table
- User-scoped transactions
- Link ke category (optional)
- Amount, type, description, payment_method
- Date field untuk transaction date
- Foreign keys ke users dan categories

## Integration Points

### Ollama AI Integration
- Multiple endpoints untuk high availability
- Endpoint priority: Local network → Internet fallback
- Session-based caching untuk optimal performance
- Extended timeout (120 seconds) untuk reasoning model
- DeepSeek R1:14B model untuk financial insights

### Google OAuth Integration
- OAuth 2.0 flow
- User data extraction (email, name, googleId)
- Automatic account creation atau login
- Default categories creation untuk new users

## Deployment Architecture

### Container Structure
```
mymo-deployment/
├── postgres container (port 5432)
│   └── Persistent volume untuk data
├── backend container (port 3000)
│   └── Node.js + Express API
└── frontend container (port 80)
    └── Nginx serving Vue.js app
```

### Network Configuration
- Docker network untuk inter-container communication
- Exposed ports: 80 (frontend), 3000 (backend), 5432 (database)
- Environment-specific configuration via .env files

### Data Persistence
- PostgreSQL data volume mounted ke host
- Volume persistence untuk database durability
- Backup strategy untuk production data

## Kesimpulan

MyMo adalah full-stack personal finance management application dengan:
- Modern tech stack (Vue.js, Node.js, PostgreSQL)
- Comprehensive features (transactions, categories, analytics, AI chat)
- Secure authentication dan authorization
- Docker-based deployment
- Scalable architecture
- AI-powered insights via Ollama integration

Dokumentasi ini memberikan overview lengkap tentang sistem MyMo untuk digunakan sebagai knowledge base dalam RAG system.
