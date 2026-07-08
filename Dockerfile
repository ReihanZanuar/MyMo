# Multi-stage Dockerfile for MyMo Web App
# Stage 1: Build Vue application
FROM node:20-alpine AS builder

WORKDIR /app

# Accept build argument for API URL
ARG VITE_API_URL=http://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL

# Copy package files for dependency installation
COPY package*.json ./

# Install dependencies (including devDependencies for build)
RUN npm ci

# Copy source files for Vue app
COPY src ./src
COPY public ./public
COPY index-vue.html ./
COPY vite.config.js ./

# Copy Attachment folder to public so Vite can resolve it during build
COPY Attachment ./public/Attachment

# Copy root-level CSS/JS files that may be imported by Vue app
COPY styles.css ./
COPY login-styles.css ./

# Build Vue application
RUN npm run build

# Stage 2: Production nginx server
FROM nginx:alpine

# Accept build argument for API URL substitution
ARG VITE_API_URL=http://localhost:5000/api

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built Vue app from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html/dist

# Copy static HTML pages
COPY index.html /usr/share/nginx/html/
COPY login.html /usr/share/nginx/html/
COPY signup.html /usr/share/nginx/html/

# Copy static assets (CSS, JS, and PWA files)
COPY styles.css /usr/share/nginx/html/
COPY script.js /usr/share/nginx/html/
COPY login-styles.css /usr/share/nginx/html/
COPY login-script.js /usr/share/nginx/html/
COPY signup-script.js /usr/share/nginx/html/
COPY manifest.json /usr/share/nginx/html/
COPY service-worker.js /usr/share/nginx/html/

# Replace API_BASE_URL placeholder with actual value from build arg
RUN sed -i "s|__API_BASE_URL__|${VITE_API_URL}|g" \
    /usr/share/nginx/html/login-script.js \
    /usr/share/nginx/html/signup-script.js

# Copy assets folder (logo, etc.)
COPY Attachment /usr/share/nginx/html/Attachment

# Copy nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
