# MyMo - System Architecture Documentation

## Architecture Overview

MyMo menggunakan arsitektur **three-tier** modern dengan pemisahan yang jelas antara presentation layer (frontend), application layer (backend API), dan data layer (database).

```
┌─────────────────────────────────────────────┐
│          Client Browser                      │
│  (Vue.js 3 SPA - Port 5173/80)              │
└────────────────┬────────────────────────────┘
                 │ HTTP/HTTPS
                 │ REST API Calls
                 │
┌────────────────▼────────────────────────────┐
│       Backend API Server                     │
│   (Node.js + Express - Port 3000)           │
│                                              │
│  ┌─────────────────────────────────────┐   │
│  │  Routes Layer                        │   │
│  │  /api/auth, /api/transactions, etc   │   │
│  └──────────────┬──────────────────────┘   │
│                 │                            │
│  ┌──────────────▼──────────────────────┐   │
│  │  Controllers Layer                   │   │
│  │  Business Logic                      │   │
│  └──────────────┬──────────────────────┘   │
│                 │                            │
│  ┌──────────────▼──────────────────────┐   │
│  │  Models Layer                        │   │
│  │  Database Operations                 │   │
│  └──────────────┬──────────────────────┘   │
└─────────────────┼──────────────────────────┘
                  │ SQL Queries
                  │ pg Pool
┌─────────────────▼────────────────────────────┐
│       PostgreSQL Database                     │
│          (Port 5432)                          │
│                                               │
│  Tables: users, categories, transactions     │
└───────────────────────────────────────────────┘

         External Integration:
┌───────────────────────────────────────────────┐
│       Ollama AI Server                        │
│   (DeepSeek R1:14B Model)                    │
│                                               │
│   Endpoints:                                  │
│   - http://10.99.99.116:11434                │
│   - http://tkjskanesa.my.id:8085             │
│   - http://100.78.7.86:11434                 │
└───────────────────────────────────────────────┘
```

## Frontend Architecture (Vue.js 3)

### Technology Stack

```javascript
{
  "vue": "^3.4.21",           // Core framework
  "vue-router": "^4.3.0",      // Routing
  "pinia": "^2.1.7",           // State management
  "axios": "^1.6.8",           // HTTP client
  "vite": "^5.2.0"             // Build tool
}
```

### Directory Structure

```
src/
├── main.js                    # Application entry point
├── App.vue                    # Root component
├── router/
│   └── index.js              # Route definitions
├── stores/
│   └── auth.js               # Pinia auth store
├── views/                    # Page components
│   ├── Dashboard.vue
│   ├── Transactions.vue
│   ├── Categories.vue
│   ├── Reports.vue
│   └── Settings.vue
├── components/               # Reusable components
│   ├── ChatBox.vue
│   └── ScanReceipt.vue
├── services/                 # API service layer
│   ├── api.js               # Axios instance
│   ├── auth.js
│   ├── transactions.js
│   ├── categories.js
│   ├── users.js
│   ├── chat.js
│   └── ocr.js
├── data/                     # Static data
│   ├── categoryIcons.js
│   └── categoryEmojis.js
└── utils/                    # Helper functions
    └── receiptParser.js
```

### Routing Architecture

```javascript
// router/index.js structure
const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/transactions',
    name: 'transactions',
    component: Transactions,
    meta: { requiresAuth: true }
  },
  // ... other routes
];

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});
```

### State Management (Pinia)

```javascript
// stores/auth.js - Authentication state
export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: localStorage.getItem('token') || null
  }),
  
  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user
  },
  
  actions: {
    setAuth(token, user) {
      this.token = token;
      this.user = user;
      localStorage.setItem('token', token);
    },
    
    logout() {
      this.token = null;
      this.user = null;
      localStorage.removeItem('token');
    }
  }
});
```

### API Service Layer

```javascript
// services/api.js - Axios configuration
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - add JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

## Backend Architecture (Node.js + Express)

### Technology Stack

```javascript
{
  "express": "^4.19.2",        // Web framework
  "pg": "^8.11.5",             // PostgreSQL client
  "jsonwebtoken": "^9.0.2",    // JWT authentication
  "bcryptjs": "^2.4.3",        // Password hashing
  "express-validator": "^7.0.1", // Input validation
  "axios": "^1.6.8",           // HTTP client (Ollama)
  "dotenv": "^16.4.5",         // Environment variables
  "cors": "^2.8.5"             // CORS middleware
}
```

### Directory Structure

```
backend/
├── server.js                  # Server entry point
├── src/
│   ├── app.js                # Express app configuration
│   ├── config/
│   │   ├── database.js       # PostgreSQL pool config
│   │   └── initDb.js         # Database initialization
│   ├── middleware/
│   │   ├── auth.js           # JWT authentication
│   │   └── validation.js     # Request validation
│   ├── models/               # Database models
│   │   ├── User.js
│   │   ├── Category.js
│   │   └── Transaction.js
│   ├── controllers/          # Request handlers
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── categoryController.js
│   │   ├── transactionController.js
│   │   └── chatController.js
│   ├── routes/               # Route definitions
│   │   ├── auth.js
│   │   ├── users.js
│   │   ├── categories.js
│   │   ├── transactions.js
│   │   └── chat.js
│   └── data/
│       └── defaultCategories.js
└── .env                      # Environment variables
```

### Express Application Setup

```javascript
// src/app.js
const express = require('express');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes mounting
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/chat', require('./routes/chat'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
```

### Database Connection Pool

```javascript
// src/config/database.js
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'mymo_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  max: 20,                    // Maximum connections in pool
  idleTimeoutMillis: 30000,   // Close idle clients after 30s
  connectionTimeoutMillis: 2000, // Return error after 2s if no connection
});

module.exports = pool;
```

### Authentication Middleware

```javascript
// src/middleware/auth.js
const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

### Request Validation Middleware

```javascript
// src/middleware/validation.js
const { validationResult } = require('express-validator');

exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};
```

## Database Architecture (PostgreSQL)

### Connection Management

- **Connection Pooling**: pg Pool dengan max 20 connections
- **Query Interface**: Parameterized queries untuk SQL injection prevention
- **Transaction Support**: ACID compliance untuk data consistency

### Schema Design Philosophy

1. **User Isolation**: Semua data scoped by user_id
2. **Soft References**: Optional foreign keys (categoryId nullable)
3. **Timestamps**: created_at dan updated_at untuk audit trail
4. **Indexes**: Primary keys dan user_id untuk query performance

## Ollama AI Integration Architecture

### Endpoint Management

```javascript
// Multiple endpoints with fallback
const OLLAMA_ENDPOINTS = [
  'http://10.99.99.116:11434',      // Primary: Local network
  'http://tkjskanesa.my.id:8085',   // Secondary: Internet
  'http://100.78.7.86:11434'        // Tertiary: Tailscale
];
```

### Session-Based Caching

```javascript
// In-memory cache structure
const userEndpointCache = new Map();
// Format: { userId: 'http://working-endpoint' }

// Cache lifecycle:
// 1. User sends first message → try all endpoints
// 2. First successful endpoint → cache for this userId
// 3. Subsequent messages → use cached endpoint directly
// 4. User logs out → clear cache for this userId
// 5. User logs back in → restart endpoint discovery
```

### Request Flow

```
User sends chat message
         ↓
Check userEndpointCache for this userId
         ↓
    ┌────┴────┐
    │ Cached? │
    └────┬────┘
         │
    Yes  │  No
    ↓    │   ↓
Use cached│ Try all endpoints sequentially
endpoint  │ until one succeeds
    ↓     │   ↓
    │←────┘ Cache successful endpoint
    ↓
Return AI response to user
```

### Error Handling

- **Timeout**: 120 seconds untuk DeepSeek R1 reasoning model
- **Fallback**: Automatic retry pada endpoint berikutnya
- **Cache Invalidation**: Clear cache jika cached endpoint gagal
- **User Feedback**: Return endpoint URL yang digunakan dalam response

## Deployment Architecture (Docker)

### Container Structure

```yaml
# docker-compose.yml structure
services:
  postgres:
    image: postgres:15
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]
    
  backend:
    build: ./backend
    ports: ["3000:3000"]
    depends_on: [postgres]
    environment:
      - DB_HOST=postgres
      
  frontend:
    build: .
    ports: ["80:80"]
    depends_on: [backend]
```

### Multi-Stage Build Strategy

```dockerfile
# Frontend Dockerfile
FROM node:18 AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
```

### Network Architecture

```
Internet → Port 80 → Nginx (Frontend Container)
              ↓
         API Proxy to Backend Container:3000
              ↓
         Backend queries PostgreSQL Container:5432
```

## Security Architecture

### Authentication Flow

```
1. User submits credentials
2. Backend validates credentials
3. Backend generates JWT token (includes userId, expires in 24h)
4. Frontend stores token in localStorage
5. Frontend includes token in Authorization header
6. Backend middleware verifies token
7. Backend extracts userId from token
8. Backend uses userId to scope all queries
```

### Data Access Control

- **Row-Level Security**: WHERE user_id = $userId pada setiap query
- **Model Layer Enforcement**: userId parameter required di semua model methods
- **Controller Layer**: userId extracted dari JWT, bukan dari request body

### Password Security

```javascript
// Registration/Password Change
password → bcrypt.hash(password, 10) → stored hash

// Login
input password → bcrypt.compare(input, storedHash) → boolean
```

## Performance Considerations

### Frontend Optimization

- **Code Splitting**: Vue Router lazy loading
- **Build Optimization**: Vite production build dengan minification
- **Asset Optimization**: Image compression, CSS/JS minification
- **Caching**: Browser caching untuk static assets

### Backend Optimization

- **Connection Pooling**: Reuse database connections
- **Query Optimization**: Indexed queries, efficient JOINs
- **Response Compression**: Gzip compression via nginx
- **Endpoint Caching**: Ollama endpoint caching mengurangi retry overhead

### Database Optimization

- **Indexes**: Primary keys + user_id indexes
- **Query Patterns**: Limit + offset untuk pagination
- **Connection Management**: Pool management untuk concurrent requests

## Scalability Patterns

### Current State (Single Instance)

```
Client → Nginx → Backend (single) → PostgreSQL (single)
```

### Horizontal Scaling Path

```
                  ┌→ Backend Instance 1 ┐
Client → Load     ├→ Backend Instance 2 ├→ PostgreSQL Primary
         Balancer ├→ Backend Instance 3 ┘      ↓
                  └→ Backend Instance N      PostgreSQL Replica
```

### Considerations for Scale

- **Stateless Backend**: JWT auth allows any instance to handle request
- **Database Scaling**: Read replicas untuk read-heavy workload
- **Session Storage**: Redis untuk shared session cache jika diperlukan
- **File Storage**: S3 atau CDN untuk user uploads (future feature)

## Monitoring Architecture (Future)

### Proposed Stack

- **Application Metrics**: Prometheus + Grafana
- **Logging**: Winston → ELK Stack (Elasticsearch, Logstash, Kibana)
- **Error Tracking**: Sentry untuk error monitoring
- **Uptime Monitoring**: External health check service
- **Database Monitoring**: pg_stat_statements untuk query analysis

### Health Check Endpoints

```javascript
// Backend health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// Database health check
app.get('/health/db', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});

// Ollama health check
app.get('/api/chat/status', chatController.checkConnection);
```

## Development vs Production

### Development Environment

- Frontend: Vite dev server (HMR enabled) pada port 5173
- Backend: nodemon untuk auto-restart pada port 3000
- Database: Local PostgreSQL atau Docker container
- Hot Module Replacement untuk instant feedback

### Production Environment

- Frontend: Static build served by nginx pada port 80
- Backend: PM2 atau Docker container pada port 3000
- Database: Persistent PostgreSQL container dengan volume
- Environment variables dari .env files
- Reverse proxy untuk SSL termination

## Technology Decision Rationale

### Why Vue.js?
- Lightweight dan fast
- Excellent documentation
- Composition API untuk reusable logic
- Great DX dengan Vite

### Why Express?
- Minimalist dan flexible
- Large ecosystem
- Proven track record
- Easy to understand dan maintain

### Why PostgreSQL?
- ACID compliance
- Relational data model cocok untuk finance app
- Robust dan reliable
- Excellent query optimizer

### Why JWT?
- Stateless authentication
- Easy horizontal scaling
- Self-contained tokens
- Industry standard

### Why Docker?
- Consistent environments
- Easy deployment
- Isolation
- Portable across platforms
