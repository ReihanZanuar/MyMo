# Docker Deployment Guide - MyMo

Panduan lengkap untuk deploy MyMo web application menggunakan Docker.

## Prerequisites

- Docker Engine 20.10+ dan Docker Compose 2.0+
- Port 8080 available (atau ubah di docker-compose.yml)

## Quick Start

### Menggunakan Docker Compose (Recommended)

```bash
# Build dan run container
docker-compose up -d

# Akses aplikasi
# http://localhost:8080
```

### Menggunakan Docker CLI

```bash
# Build image
docker build -t mymo-web:latest .

# Run container
docker run -d \
  --name mymo-web \
  -p 8080:80 \
  --restart unless-stopped \
  mymo-web:latest

# Akses aplikasi
# http://localhost:8080
```

## Struktur Deployment

### Multi-Stage Build

Dockerfile menggunakan multi-stage build untuk optimasi ukuran image:

1. **Stage 1 (Builder)**: Build Vue.js app dengan Vite
   - Base image: `node:20-alpine`
   - Output: `dist/` folder dengan compiled Vue app

2. **Stage 2 (Production)**: Serve dengan nginx
   - Base image: `nginx:alpine`
   - Files: Static HTML + Built Vue app + Assets
   - Size: ~50-60MB (optimized)

### File Structure di Container

```
/usr/share/nginx/html/
├── index.html          # Landing page
├── login.html          # Login page
├── signup.html         # Signup page
├── styles.css          # Landing page styles
├── script.js           # Landing page script
├── login-styles.css    # Login styles
├── login-script.js     # Login script
├── signup-script.js    # Signup script
├── Attachment/         # Logo dan assets
│   └── logo-tansparan.png
└── dist/               # Built Vue app
    ├── index.html      # Vue app entry
    └── assets/         # Compiled JS/CSS
```

## Commands

### Build

```bash
# Build dengan docker-compose
docker-compose build

# Build dengan Docker CLI
docker build -t mymo-web:latest .

# Build dengan custom tag
docker build -t mymo-web:v1.0.0 .
```

### Run

```bash
# Start container
docker-compose up -d

# Start dengan custom port
docker run -d -p 3000:80 --name mymo-web mymo-web:latest
```

### Stop & Remove

```bash
# Stop container
docker-compose down

# Stop dan remove volumes
docker-compose down -v

# Stop dengan Docker CLI
docker stop mymo-web
docker rm mymo-web
```

### Logs

```bash
# View logs
docker-compose logs -f

# View logs (Docker CLI)
docker logs -f mymo-web
```

### Health Check

```bash
# Check container health
docker ps

# Manual health check
curl http://localhost:8080/health
```

## Configuration

### Port Mapping

Default port: `8080` (host) → `80` (container)

Ubah di `docker-compose.yml`:
```yaml
ports:
  - "3000:80"  # Ganti 8080 dengan port yang diinginkan
```

### Environment Variables

Tambahkan di `docker-compose.yml`:
```yaml
environment:
  - NODE_ENV=production
  - API_URL=https://api.mymo.com
```

## Accessing the Application

Setelah container running:

- **Landing Page**: http://localhost:8080/
- **Login**: http://localhost:8080/login.html
- **Signup**: http://localhost:8080/signup.html
- **Dashboard (Vue App)**: http://localhost:8080/index-vue.html
- **Health Check**: http://localhost:8080/health

## Production Deployment

### Recommended Practices

1. **Use HTTPS with Reverse Proxy**
   - Deploy nginx/Caddy/Traefik di depan container
   - Terminate SSL di reverse proxy
   - Forward ke container MyMo

2. **Update Google OAuth Client ID**
   - Edit `signup-script.js` dan `login-script.js`
   - Ganti `YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com`
   - Rebuild Docker image setelah perubahan

3. **Environment-Specific Builds**
   ```bash
   # Development
   docker build --build-arg NODE_ENV=development -t mymo-web:dev .
   
   # Production
   docker build --build-arg NODE_ENV=production -t mymo-web:prod .
   ```

4. **Resource Limits**
   ```yaml
   # docker-compose.yml
   deploy:
     resources:
       limits:
         cpus: '0.5'
         memory: 256M
   ```

### Container Registry

Push ke Docker Hub atau private registry:

```bash
# Tag image
docker tag mymo-web:latest username/mymo-web:latest

# Push
docker push username/mymo-web:latest

# Pull di server production
docker pull username/mymo-web:latest
```

## Troubleshooting

### Container tidak start

```bash
# Check logs
docker-compose logs

# Check container status
docker ps -a

# Inspect container
docker inspect mymo-web
```

### Port sudah digunakan

```bash
# Cek port yang digunakan
lsof -i :8080

# Kill process yang menggunakan port
kill -9 <PID>

# Atau ubah port di docker-compose.yml
```

### Build gagal

```bash
# Clean build (no cache)
docker-compose build --no-cache

# Remove dangling images
docker image prune

# Remove all unused resources
docker system prune -a
```

### File tidak terupdate

```bash
# Rebuild dan recreate container
docker-compose up -d --build --force-recreate

# Remove old image
docker rmi mymo-web:latest
docker-compose build
```

## Development with Docker

### Live Development

Untuk development dengan hot-reload, gunakan volume mount:

```yaml
# docker-compose.dev.yml
services:
  mymo-dev:
    build:
      context: .
      target: builder
    volumes:
      - ./src:/app/src
      - ./public:/app/public
    ports:
      - "3000:3000"
    command: npm run dev
```

Run dengan:
```bash
docker-compose -f docker-compose.dev.yml up
```

## Security Notes

⚠️ **Penting untuk Production:**

1. Google OAuth Client ID harus dikonfigurasi dengan authorized domains yang benar
2. Implementasi backend API untuk token verification
3. Gunakan HTTPS untuk semua production deployment
4. Set security headers di nginx (sudah included di nginx.conf)
5. Regularly update base images untuk security patches

## Performance

- Image size: ~50-60MB (Alpine-based)
- Startup time: ~2-3 seconds
- Memory usage: ~20-30MB idle
- Nginx gzip compression: Enabled
- Static asset caching: Enabled

## Monitoring

### Health Check Endpoint

Container health check otomatis berjalan setiap 30 detik:
```bash
# Manual check
curl http://localhost:8080/health
# Response: "healthy"
```

### Container Stats

```bash
# Real-time stats
docker stats mymo-web

# Check container health
docker inspect --format='{{.State.Health.Status}}' mymo-web
```

## Next Steps

1. Update Google OAuth Client ID di script files
2. Setup reverse proxy dengan SSL untuk production
3. Implementasi backend API untuk authentication
4. Setup monitoring dan logging
5. Configure automated backups jika ada data persistence

## Support

Untuk issue atau pertanyaan, cek dokumentasi di:
- Dockerfile comments
- nginx.conf configuration
- GOOGLE_OAUTH_SETUP.md untuk OAuth setup
