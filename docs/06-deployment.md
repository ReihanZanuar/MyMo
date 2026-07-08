# MyMo - Deployment Documentation

## Deployment Overview

MyMo menggunakan **Docker containerization** dengan **docker-compose** untuk orchestration. Deployment mencakup 3 containers utama:

1. **PostgreSQL** - Database container
2. **Backend** - Node.js/Express API container
3. **Frontend** - Nginx serving Vue.js app container

---

## Docker Architecture

```
┌─────────────────────────────────────────┐
│  Frontend Container (nginx:alpine)      │
│  Port 80 → /usr/share/nginx/html        │
└──────────────┬──────────────────────────┘
               │
               │ Reverse proxy /api
               ↓
┌─────────────────────────────────────────┐
│  Backend Container (node:18-alpine)     │
│  Port 3000 → Express API                │
└──────────────┬──────────────────────────┘
               │
               │ PostgreSQL client
               ↓
┌─────────────────────────────────────────┐
│  PostgreSQL Container (postgres:15)     │
│  Port 5432 → PostgreSQL server          │
│  Volume: pgdata (persistent)            │
└─────────────────────────────────────────┘
```

---

## docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    container_name: mymo-postgres
    environment:
      POSTGRES_DB: mymo_db
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    networks:
      - mymo-network
    restart: unless-stopped
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: mymo-backend
    environment:
      NODE_ENV: production
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: mymo_db
      DB_USER: postgres
      DB_PASSWORD: ${DB_PASSWORD}
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRES_IN: 24h
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    networks:
      - mymo-network
    restart: unless-stopped

  frontend:
    build:
      context: .
      dockerfile: Dockerfile
    container_name: mymo-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - mymo-network
    restart: unless-stopped

networks:
  mymo-network:
    driver: bridge

volumes:
  pgdata:
    driver: local
```

---

## Backend Dockerfile

**Multi-stage build** untuk optimized image size.

```dockerfile
# Stage 1: Build dependencies
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Stage 2: Production image
FROM node:18-alpine

WORKDIR /app

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["node", "server.js"]
```

**Benefits:**
- Smaller final image (no dev dependencies)
- Faster builds (cached layers)
- Security (minimal attack surface)

---

## Frontend Dockerfile

```dockerfile
# Stage 1: Build Vue.js app
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build production bundle
RUN npm run build

# Stage 2: Nginx serving
FROM nginx:alpine

# Copy built assets from builder
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
```

---

## Nginx Configuration

**File:** `nginx.conf`

```nginx
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    # Logging
    access_log /var/log/nginx/access.log;
    error_log /var/log/nginx/error.log;

    # Performance
    sendfile on;
    tcp_nopush on;
    tcp_nodelay on;
    keepalive_timeout 65;
    types_hash_max_size 2048;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript 
               application/json application/javascript application/xml+rss;

    server {
        listen 80;
        server_name localhost;

        root /usr/share/nginx/html;
        index index.html;

        # Frontend routes (SPA)
        location / {
            try_files $uri $uri/ /index.html;
        }

        # API proxy to backend
        location /api {
            proxy_pass http://backend:3000;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
            proxy_read_timeout 120s;
        }

        # Cache static assets
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
}
```

**Key Features:**
- SPA routing support (`try_files`)
- API reverse proxy to backend
- Gzip compression
- Static asset caching
- Extended timeout for Ollama requests (120s)

---

## Environment Variables

### Backend .env

```bash
# Database
DB_HOST=postgres
DB_PORT=5432
DB_NAME=mymo_db
DB_USER=postgres
DB_PASSWORD=your_secure_password

# JWT
JWT_SECRET=your_jwt_secret_key_min_32_chars
JWT_EXPIRES_IN=24h

# Node
NODE_ENV=production
PORT=3000
```

### Frontend .env.production

```bash
VITE_API_URL=http://localhost/api
```

**Security Notes:**
- Never commit `.env` files to git
- Use strong passwords and secrets
- Rotate secrets regularly
- Use environment-specific values

---

## Deployment Steps

### 1. Prepare Environment

```bash
# Clone repository
git clone https://github.com/yourusername/mymo.git
cd mymo

# Create .env files
cp backend/.env.example backend/.env
nano backend/.env  # Edit with your values
```

### 2. Build Images

```bash
# Build all images
docker-compose build

# Or build individually
docker-compose build postgres
docker-compose build backend
docker-compose build frontend
```

### 3. Start Services

```bash
# Start all services
docker-compose up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
```

### 4. Verify Deployment

```bash
# Check backend health
curl http://localhost:3000/health

# Check database connection
docker exec mymo-backend npm run test:db

# Check frontend
curl http://localhost/
```

### 5. Initialize Database

Database tables are automatically created on first backend startup via `initDb.js`.

```bash
# Check database tables
docker exec -it mymo-postgres psql -U postgres -d mymo_db -c "\dt"

# Expected output:
# users, categories, transactions
```

---

## Docker Commands Cheat Sheet

### Container Management

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Restart service
docker-compose restart backend

# View logs
docker-compose logs -f

# Execute command in container
docker exec -it mymo-backend sh
docker exec -it mymo-postgres psql -U postgres -d mymo_db
```

### Image Management

```bash
# List images
docker images

# Remove unused images
docker image prune

# Rebuild without cache
docker-compose build --no-cache
```

### Volume Management

```bash
# List volumes
docker volume ls

# Backup database volume
docker run --rm -v mymo_pgdata:/data -v $(pwd):/backup \
  ubuntu tar czf /backup/pgdata-backup.tar.gz /data

# Restore database volume
docker run --rm -v mymo_pgdata:/data -v $(pwd):/backup \
  ubuntu tar xzf /backup/pgdata-backup.tar.gz -C /
```

### Network Management

```bash
# List networks
docker network ls

# Inspect network
docker network inspect mymo_mymo-network
```

---

## Production Considerations

### SSL/TLS Setup

For production, add SSL certificate dengan Let's Encrypt:

```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # ... rest of configuration
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

### Monitoring

Add health check endpoints:

```javascript
// backend/server.js
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

app.get('/health/db', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'error', database: 'disconnected' });
  }
});
```

### Logging

Configure structured logging:

```yaml
# docker-compose.yml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

### Backup Strategy

```bash
# Automated daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec mymo-postgres pg_dump -U postgres mymo_db | \
  gzip > /backups/mymo_db_$DATE.sql.gz

# Keep only last 7 days
find /backups -name "mymo_db_*.sql.gz" -mtime +7 -delete
```

### Resource Limits

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
```

---

## Troubleshooting

### Backend won't connect to database

```bash
# Check if postgres is ready
docker exec mymo-postgres pg_isready -U postgres

# Check backend logs
docker-compose logs backend

# Verify environment variables
docker exec mymo-backend env | grep DB_
```

### Frontend can't reach backend API

```bash
# Check nginx configuration
docker exec mymo-frontend nginx -t

# Check if backend is accessible from frontend container
docker exec mymo-frontend wget -O- http://backend:3000/health
```

### Database data lost after restart

```bash
# Verify volume is mounted
docker volume inspect mymo_pgdata

# Check if volume is used by container
docker inspect mymo-postgres | grep -A 10 Mounts
```

---

## Updating Deployment

### Update Application Code

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build

# Zero-downtime update (if using multiple backend instances)
docker-compose up -d --build --no-deps --scale backend=2 backend
```

### Update Dependencies

```bash
# Update npm packages
cd backend && npm update
cd ../frontend && npm update

# Rebuild images
docker-compose build --no-cache
```

### Database Migrations

```bash
# Run migration script
docker exec mymo-backend node scripts/migrate.js

# Or manual SQL
docker exec -it mymo-postgres psql -U postgres -d mymo_db
# Then run SQL commands
```

---

## Scaling Considerations

### Horizontal Scaling

```yaml
# docker-compose.yml
services:
  backend:
    deploy:
      replicas: 3
```

Add load balancer di depan backend instances.

### Database Replication

Setup PostgreSQL primary-replica untuk read scaling:

```yaml
services:
  postgres-primary:
    # ... primary config

  postgres-replica:
    image: postgres:15
    environment:
      POSTGRES_PRIMARY_HOST: postgres-primary
    # ... replica config
```

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build images
        run: docker-compose build
      
      - name: Run tests
        run: docker-compose run backend npm test
      
      - name: Deploy to production
        run: |
          docker-compose -f docker-compose.prod.yml up -d
```

---

## Security Checklist

- ✅ Use environment variables untuk secrets
- ✅ Enable HTTPS dengan valid SSL certificate
- ✅ Set proper CORS configuration
- ✅ Use strong JWT secret (min 32 characters)
- ✅ Regular security updates untuk base images
- ✅ Limit exposed ports (only 80/443 public)
- ✅ Use non-root user dalam containers
- ✅ Enable Docker content trust
- ✅ Regular backups dengan encryption
- ✅ Monitor logs untuk suspicious activity

---

## Performance Optimization

### Docker Image Size

```bash
# Check image sizes
docker images | grep mymo

# Optimize:
# - Use alpine base images
# - Multi-stage builds
# - .dockerignore file
# - Remove unnecessary dependencies
```

### Container Resources

Monitor resource usage:

```bash
# Real-time stats
docker stats

# Historical data
docker-compose top
```

---

## Summary

MyMo deployment menggunakan Docker dengan:
- **3 containers**: PostgreSQL, Backend (Node.js), Frontend (Nginx)
- **Multi-stage builds** untuk optimized images
- **Docker Compose** untuk orchestration
- **Volume persistence** untuk database
- **Health checks** untuk monitoring
- **Nginx** sebagai reverse proxy dan static server

Deployment process: Build → Configure → Start → Verify → Monitor
