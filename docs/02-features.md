# MyMo - Features Documentation

## Feature Overview

MyMo menyediakan 6 fitur utama untuk manajemen keuangan pribadi:

1. **Authentication & User Management** - Registrasi, login, profile management
2. **Transaction Management** - CRUD transaksi income/expense
3. **Category Management** - Custom categories dengan budgeting
4. **Analytics & Reports** - Visualisasi dan insights keuangan
5. **AI Chat Assistant** - Conversational AI untuk financial advice
6. **Receipt Scanning (OCR)** - Extract data dari foto struk (future enhancement)

---

## 1. Authentication & User Management

### 1.1 User Registration

**Metode Registrasi:**

**A. Email/Password Registration**
- User mengisi form: email, password (min 8 karakter), nama
- Backend validates input dengan express-validator
- Password di-hash dengan bcryptjs (10 salt rounds)
- User record dibuat di database
- Default categories otomatis dibuat (15 categories)
- JWT token generated dan dikembalikan
- Frontend menyimpan token di localStorage

**B. Google OAuth Registration**
- User klik "Login with Google"
- OAuth flow redirect ke Google consent screen
- Google mengembalikan googleId, email, name
- Backend cek apakah user sudah ada (by googleId atau email)
- Jika baru: create user dengan google_id
- Jika sudah ada: update google_id jika belum ada
- Default categories dibuat untuk new users
- JWT token generated dan dikembalikan

**Default Categories yang Dibuat:**

Income Categories (4):
- 💼 Gaji (Salary)
- 🎁 Hadiah (Gift)
- 💰 Investasi (Investment)
- 📈 Lainnya (Other Income)

Expense Categories (11):
- 🍔 Makanan & Minuman (Food & Drinks)
- 🚗 Transportasi (Transportation)
- 🏠 Rumah & Tagihan (Home & Bills)
- 🛒 Belanja (Shopping)
- 💊 Kesehatan (Health)
- 🎓 Pendidikan (Education)
- 🎮 Hiburan (Entertainment)
- 🎁 Hadiah & Donasi (Gifts & Donations)
- 💳 Cicilan (Installments)
- ✈️ Liburan (Vacation)
- 📦 Lainnya (Other Expense)

### 1.2 User Login

**Email/Password Login:**
```javascript
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

Response:
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Google OAuth Login:**
```javascript
POST /api/auth/google
{
  "googleId": "1234567890",
  "email": "user@gmail.com",
  "name": "John Doe"
}
```

**Frontend Flow:**
1. User submits credentials
2. API call ke backend
3. Terima token dan user data
4. Simpan token di localStorage
5. Simpan user di Pinia store
6. Redirect ke dashboard

### 1.3 Profile Management

**Get Current Profile:**
```javascript
GET /api/users/me
Headers: { Authorization: "Bearer <token>" }

Response:
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": "https://...",
  "created_at": "2024-01-15T10:30:00Z"
}
```

**Update Profile:**
```javascript
PUT /api/users/me
{
  "name": "John Smith",
  "email": "newemaiL@example.com"
}
```

**Change Password:**
```javascript
PUT /api/users/me/password
{
  "oldPassword": "current123",
  "newPassword": "newpass123"
}
```

**Update Avatar:**
```javascript
PUT /api/users/me/avatar
{
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**Delete Account:**
```javascript
DELETE /api/users/me
```
- Cascade delete: transactions → categories → user
- Permanent deletion, tidak ada soft delete
- Logout otomatis setelah delete

### 1.4 Logout

**Backend Logout:**
```javascript
POST /api/auth/logout
Headers: { Authorization: "Bearer <token>" }
```
- Clear cached Ollama endpoint untuk user ini
- Return success message

**Frontend Logout:**
```javascript
// Pinia auth store
logout() {
  this.token = null;
  this.user = null;
  localStorage.removeItem('token');
  router.push('/login');
}
```

---

## 2. Transaction Management

### 2.1 Create Transaction

**Manual Entry:**
```javascript
POST /api/transactions
{
  "categoryId": 5,              // Optional
  "amount": 50000,
  "type": "expense",            // "income" or "expense"
  "description": "Makan siang",
  "paymentMethod": "cash",      // Optional
  "date": "2024-01-15"
}

Response:
{
  "message": "Transaction created successfully",
  "transaction": {
    "id": 123,
    "user_id": 1,
    "category_id": 5,
    "amount": 50000,
    "type": "expense",
    "description": "Makan siang",
    "payment_method": "cash",
    "date": "2024-01-15",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

**Frontend Form Fields:**
- Amount (required): Number input
- Type (required): Radio buttons (Income/Expense)
- Category (optional): Dropdown dari user's categories
- Description (optional): Text input
- Payment Method (optional): Dropdown (Cash, Card, Transfer, etc.)
- Date (required): Date picker, default today

### 2.2 Get Transactions

**List Transactions:**
```javascript
GET /api/transactions?limit=50&offset=0&type=expense&startDate=2024-01-01&endDate=2024-01-31

Response:
{
  "transactions": [
    {
      "id": 123,
      "user_id": 1,
      "category_id": 5,
      "category_name": "Makanan & Minuman",
      "category_color": "#FF6B6B",
      "amount": 50000,
      "type": "expense",
      "description": "Makan siang",
      "payment_method": "cash",
      "date": "2024-01-15",
      "created_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

**Query Parameters:**
- `limit` (optional): Max 100, default 50
- `offset` (optional): For pagination, default 0
- `type` (optional): Filter by "income" or "expense"
- `startDate` (optional): ISO date format
- `endDate` (optional): ISO date format

**Sorting:** Always sorted by date DESC, created_at DESC

### 2.3 Update Transaction

```javascript
PUT /api/transactions/:id
{
  "categoryId": 6,
  "amount": 75000,
  "description": "Makan siang + kopi"
}
```

- Hanya field yang dikirim yang akan di-update
- COALESCE pattern: `field = COALESCE($1, field)`
- User hanya bisa update transaksi mereka sendiri

### 2.4 Delete Transaction

```javascript
DELETE /api/transactions/:id

Response:
{
  "message": "Transaction deleted successfully",
  "transaction": { ... }
}
```

### 2.5 Transaction Summary

**Get Summary for Period:**
```javascript
GET /api/transactions/summary?startDate=2024-01-01&endDate=2024-01-31

Response:
{
  "income": 5000000,
  "expense": 3500000,
  "balance": 1500000
}
```

**Calculation:**
- Income: SUM(amount) WHERE type='income'
- Expense: SUM(amount) WHERE type='expense'
- Balance: income - expense

---

## 3. Category Management

### 3.1 Get Categories

```javascript
GET /api/categories

Response:
{
  "categories": [
    {
      "id": 1,
      "user_id": 1,
      "name": "Makanan & Minuman",
      "type": "expense",
      "color": "#FF6B6B",
      "icon": "utensils",
      "emoji": "🍔",
      "budget": 1000000,
      "description": "Makanan, snacks, kopi",
      "transaction_count": 15,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

**Transaction Count:**
- LEFT JOIN dengan transactions table
- COUNT untuk setiap category
- Membantu user lihat category mana yang sering dipakai

### 3.2 Create Category

```javascript
POST /api/categories
{
  "name": "Investasi Crypto",
  "type": "expense",
  "color": "#4ECDC4",
  "icon": "bitcoin",
  "emoji": "₿",
  "budget": 500000,
  "description": "Trading dan investment crypto"
}
```

**Category Types:**
- `income`: Untuk sumber pemasukan
- `expense`: Untuk jenis pengeluaran
- `transfer`: Untuk transfer antar akun (future feature)

**Customization Options:**
- Name: Custom text
- Color: Hex color code
- Icon: Font Awesome icon name atau custom SVG
- Emoji: Single emoji character
- Budget: Optional monthly budget limit
- Description: Additional notes

### 3.3 Update Category

```javascript
PUT /api/categories/:id
{
  "budget": 1200000,
  "description": "Increased budget"
}
```

### 3.4 Delete Category

```javascript
DELETE /api/categories/:id
```

**Cascade Behavior:**
- Transactions dengan category_id ini akan set ke NULL
- Transactions TIDAK dihapus
- User tetap bisa lihat historical transactions

---

## 4. Analytics & Reports

### 4.1 Dashboard Summary

**Data Points Displayed:**
1. **Total Balance** (Income - Expense)
2. **This Month Income**
3. **This Month Expense**
4. **Budget Status** per category

**Calculation Period:**
- Default: Current month (startDate = first day, endDate = last day)
- Dapat di-filter by custom date range

### 4.2 Transaction Charts

**Income vs Expense Chart:**
- Bar chart atau line chart
- X-axis: Time period (daily, weekly, monthly)
- Y-axis: Amount
- Two series: Income (green) dan Expense (red)

**Category Breakdown:**
- Pie chart atau donut chart
- Show percentage per category
- Filter by type (income/expense)
- Filter by date range

### 4.3 Budget Tracking

**Per Category:**
```javascript
{
  "category": "Makanan & Minuman",
  "budget": 1000000,
  "spent": 750000,
  "remaining": 250000,
  "percentage": 75
}
```

**Visual Indicators:**
- Green: < 70% of budget
- Yellow: 70-90% of budget
- Red: > 90% of budget
- Alert: Exceeded budget

---

## 5. AI Chat Assistant

### 5.1 Chat Interface

**ChatBox Component:**
- Floating chat button di bottom-right
- Click to expand chat window (350x500px)
- Minimalist design dengan gradient theme
- Dark mode support

**Chat Features:**
- Conversation history dalam sesi yang sama
- Typing indicator saat AI berpikir
- Timestamp untuk setiap message
- Scroll to bottom otomatis

### 5.2 Send Message to AI

```javascript
POST /api/chat
{
  "message": "Berapa total pengeluaran saya bulan ini?",
  "conversationHistory": [
    {
      "type": "user",
      "text": "Hello"
    },
    {
      "type": "bot",
      "text": "Hi! Ada yang bisa saya bantu?"
    }
  ]
}

Response:
{
  "reply": "Berdasarkan data Anda, total pengeluaran bulan ini adalah Rp 3,500,000...",
  "model": "deepseek-r1:14b",
  "endpoint": "http://10.99.99.116:11434"
}
```

**Backend Processing:**
1. Terima message dan conversation history
2. Format untuk Ollama API (user/assistant roles)
3. Cek cached endpoint untuk user ini
4. Jika ada cache: gunakan cached endpoint
5. Jika tidak ada atau gagal: coba semua endpoints
6. First successful endpoint: cache untuk user ini
7. Return AI response ke frontend

### 5.3 Endpoint Caching System

**Cache Structure:**
```javascript
const userEndpointCache = new Map();
// Format: { userId: 'http://10.99.99.116:11434' }
```

**Cache Lifecycle:**
1. **First Message**: Try all 3 endpoints sequentially
2. **Success**: Cache working endpoint untuk userId ini
3. **Subsequent Messages**: Langsung pakai cached endpoint
4. **Cache Miss**: Jika cached endpoint gagal, clear cache dan retry all
5. **Logout**: Clear cache untuk userId ini

**Benefits:**
- Faster response setelah first message (no retry delay)
- Per-user caching (multi-user safe)
- Automatic failover jika cached endpoint down
- Reset on logout (fresh discovery saat login kembali)

### 5.4 AI Capabilities

**DeepSeek R1:14B Model:**
- Reasoning model dengan extended thinking
- 120 second timeout untuk reasoning
- Context-aware responses
- Financial domain knowledge

**Use Cases:**
- "Berapa sisa budget kategori Makanan?"
- "Ringkas pengeluaran saya minggu ini"
- "Tips hemat untuk transportasi"
- "Apakah pengeluaran saya normal?"
- "Buat budget plan untuk bulan depan"

**Limitations:**
- Tidak bisa akses data user secara real-time (perlu integration)
- Responses berdasarkan general knowledge
- Untuk data-specific queries, perlu RAG integration (future)

### 5.5 Connection Status Check

```javascript
GET /api/chat/status

Response:
{
  "statuses": [
    {
      "endpoint": "http://10.99.99.116:11434",
      "status": "connected"
    },
    {
      "endpoint": "http://tkjskanesa.my.id:8085",
      "status": "disconnected",
      "error": "ETIMEDOUT"
    }
  ]
}
```

---

## 6. Receipt Scanning (OCR)

**Status:** Implemented in frontend, ready for backend integration

**Frontend Components:**
- `ScanReceipt.vue`: Camera interface
- `receiptParser.js`: Text parsing logic
- `ocr.js`: Tesseract.js integration

**How It Works:**
1. User takes photo of receipt
2. Tesseract.js extracts text dari image
3. Parser mencari patterns (amounts, dates, merchant names)
4. Auto-fill transaction form dengan extracted data
5. User review dan submit

**Future Enhancements:**
- Backend OCR service untuk better accuracy
- Template learning untuk specific merchants
- Multiple receipt items extraction
- Auto-categorization based on merchant

---

## Feature Access Control

**Public Routes (No Auth Required):**
- Landing page
- Login page
- Register page

**Protected Routes (Auth Required):**
- Dashboard
- Transactions
- Categories
- Reports
- Settings
- Chat

**Authentication Check:**
```javascript
// Vue Router beforeEach guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});
```

**API Authentication:**
- JWT token in Authorization header
- Middleware extracts userId dari token
- All queries scoped by userId
- 401 Unauthorized jika token invalid/missing

---

## User Experience Features

### Responsive Design
- Mobile-first approach
- Breakpoints: 480px (mobile), 768px (tablet), 1024px (desktop)
- Touch-friendly interface
- Swipe gestures untuk navigation (future)

### Dark Mode Support
- Automatic detection dari system preference
- Manual toggle in settings
- Persistent preference in localStorage
- Smooth theme transitions

### Offline Support (Future)
- Service worker untuk caching
- IndexedDB untuk offline storage
- Background sync saat online kembali
- Optimistic UI updates

### Performance
- Lazy loading untuk routes
- Image optimization
- Pagination untuk large datasets
- Debounced search inputs
- Memoized computed values

### Accessibility
- Semantic HTML
- ARIA labels
- Keyboard navigation
- Screen reader support
- High contrast mode

---

## Data Privacy & Security

### User Data Isolation
- Semua queries filtered by userId
- No cross-user data access
- User hanya bisa lihat/edit data mereka sendiri

### Sensitive Data Handling
- Passwords never logged atau returned
- JWT tokens have expiration
- HTTPS untuk production
- Environment variables untuk secrets

### Data Retention
- User data kept until account deletion
- Cascade delete saat delete account
- No automatic data archival
- User full control over their data
