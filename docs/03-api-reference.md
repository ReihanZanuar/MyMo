# MyMo - API Reference Documentation

## Base URL

```
Development: http://localhost:3000/api
Production: https://your-domain.com/api
```

## Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Response Format

### Success Response
```json
{
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

### Validation Error Response
```json
{
  "errors": [
    {
      "msg": "Email is invalid",
      "param": "email",
      "location": "body"
    }
  ]
}
```

---

## Authentication Endpoints

### POST /auth/register

Register new user dengan email dan password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

**Validation:**
- `email`: Valid email format, normalized
- `password`: Minimum 8 characters
- `name`: Not empty, trimmed

**Response (201):**
```json
{
  "message": "User registered successfully",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Errors:**
- `400`: Email already registered
- `500`: Registration failed

---

### POST /auth/login

Login dengan email dan password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
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

**Errors:**
- `401`: Invalid credentials
- `500`: Login failed

---

### POST /auth/google

Login atau register dengan Google OAuth.

**Request Body:**
```json
{
  "googleId": "1234567890",
  "email": "user@gmail.com",
  "name": "John Doe"
}
```

**Response (200):**
```json
{
  "message": "Google authentication successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "name": "John Doe"
  }
}
```

---

### POST /auth/logout

Logout user dan clear cached data.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "message": "Logout successful"
}
```

---

## User Endpoints

### GET /users/me

Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "avatar_url": "https://...",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

### PUT /users/me

Update user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "name": "John Smith",
  "email": "newemail@example.com"
}
```

**Response (200):**
```json
{
  "message": "Profile updated successfully",
  "user": {
    "id": 1,
    "email": "newemail@example.com",
    "name": "John Smith",
    "avatar_url": "https://..."
  }
}
```

---

### PUT /users/me/password

Change user password.

**Request Body:**
```json
{
  "oldPassword": "current123",
  "newPassword": "newpass123"
}
```

**Validation:**
- `oldPassword`: Not empty
- `newPassword`: Minimum 6 characters

**Response (200):**
```json
{
  "message": "Password changed successfully"
}
```

**Errors:**
- `401`: Invalid old password

---

### PUT /users/me/avatar

Update user avatar.

**Request Body:**
```json
{
  "avatarUrl": "https://example.com/avatar.jpg"
}
```

**Response (200):**
```json
{
  "message": "Avatar updated successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe",
    "avatar_url": "https://example.com/avatar.jpg"
  }
}
```

---

### DELETE /users/me

Delete user account (cascade delete).

**Response (200):**
```json
{
  "message": "Account deleted successfully"
}
```

---

## Transaction Endpoints

### GET /transactions

Get user's transactions dengan filtering dan pagination.

**Query Parameters:**
- `limit` (optional): Max 100, default 50
- `offset` (optional): Default 0
- `type` (optional): "income" or "expense"
- `startDate` (optional): ISO date format (YYYY-MM-DD)
- `endDate` (optional): ISO date format (YYYY-MM-DD)

**Example:**
```
GET /transactions?limit=20&offset=0&type=expense&startDate=2024-01-01&endDate=2024-01-31
```

**Response (200):**
```json
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
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ]
}
```

---

### GET /transactions/summary

Get summary (total income, expense, balance) untuk periode tertentu.

**Query Parameters:**
- `startDate` (required): ISO date format
- `endDate` (required): ISO date format

**Example:**
```
GET /transactions/summary?startDate=2024-01-01&endDate=2024-01-31
```

**Response (200):**
```json
{
  "income": 5000000,
  "expense": 3500000,
  "balance": 1500000
}
```

---

### POST /transactions

Create new transaction.

**Request Body:**
```json
{
  "categoryId": 5,
  "amount": 50000,
  "type": "expense",
  "description": "Makan siang",
  "paymentMethod": "cash",
  "date": "2024-01-15"
}
```

**Validation:**
- `categoryId`: Optional, must be integer
- `amount`: Required, must be >= 0
- `type`: Required, must be "income" or "expense"
- `description`: Optional, trimmed
- `paymentMethod`: Optional, trimmed
- `date`: Required, ISO date format

**Response (201):**
```json
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

---

### PUT /transactions/:id

Update existing transaction.

**URL Parameter:**
- `id`: Transaction ID (integer)

**Request Body:**
```json
{
  "categoryId": 6,
  "amount": 75000,
  "description": "Makan siang + kopi"
}
```

**Response (200):**
```json
{
  "message": "Transaction updated successfully",
  "transaction": { ... }
}
```

**Errors:**
- `404`: Transaction not found

---

### DELETE /transactions/:id

Delete transaction.

**Response (200):**
```json
{
  "message": "Transaction deleted successfully",
  "transaction": { ... }
}
```

---

## Category Endpoints

### GET /categories

Get all user's categories dengan transaction count.

**Response (200):**
```json
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

---

### POST /categories

Create new category.

**Request Body:**
```json
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

**Validation:**
- `name`: Required, not empty
- `type`: Required, must be "income", "expense", or "transfer"
- `color`: Optional, trimmed
- `icon`: Optional, trimmed
- `emoji`: Optional, trimmed
- `budget`: Optional, must be >= 0
- `description`: Optional, trimmed

**Response (201):**
```json
{
  "message": "Category created successfully",
  "category": { ... }
}
```

---

### PUT /categories/:id

Update category.

**Request Body:**
```json
{
  "budget": 1200000,
  "description": "Updated budget"
}
```

**Response (200):**
```json
{
  "message": "Category updated successfully",
  "category": { ... }
}
```

---

### DELETE /categories/:id

Delete category.

**Response (200):**
```json
{
  "message": "Category deleted successfully",
  "category": { ... }
}
```

**Note:** Transactions dengan category ini akan set category_id ke NULL, tidak dihapus.

---

## Chat Endpoints

### POST /chat

Send message ke Ollama AI.

**Request Body:**
```json
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
```

**Response (200):**
```json
{
  "reply": "Berdasarkan data yang ada...",
  "model": "deepseek-r1:14b",
  "endpoint": "http://10.99.99.116:11434"
}
```

**Errors:**
- `503`: Ollama server tidak dapat dijangkau
- `400`: Message is required

**Notes:**
- Timeout: 120 seconds untuk reasoning model
- Endpoint caching: First successful endpoint di-cache per user
- Cache cleared on logout

---

### GET /chat/status

Check koneksi ke semua Ollama endpoints.

**Response (200):**
```json
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
    },
    {
      "endpoint": "http://100.78.7.86:11434",
      "status": "connected"
    }
  ]
}
```

---

## HTTP Status Codes

- `200 OK`: Request berhasil
- `201 Created`: Resource berhasil dibuat
- `400 Bad Request`: Validation error atau invalid input
- `401 Unauthorized`: Token missing, invalid, atau expired
- `404 Not Found`: Resource tidak ditemukan
- `500 Internal Server Error`: Server error
- `503 Service Unavailable`: External service (Ollama) tidak tersedia

---

## Rate Limiting

Currently tidak ada rate limiting. Future implementation:
- Per-user rate limit
- Per-endpoint rate limit
- Sliding window algorithm

---

## CORS Configuration

Development: Allow all origins
Production: Whitelist specific domains

---

## Example API Usage (JavaScript)

### Using Fetch API

```javascript
// Login
const login = async (email, password) => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await response.json();
  localStorage.setItem('token', data.token);
  return data;
};

// Get transactions
const getTransactions = async () => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3000/api/transactions', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
};

// Create transaction
const createTransaction = async (transactionData) => {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:3000/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify(transactionData)
  });
  return response.json();
};
```

### Using Axios

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api'
});

// Request interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Usage
await api.post('/auth/login', { email, password });
await api.get('/transactions');
await api.post('/transactions', transactionData);
```
