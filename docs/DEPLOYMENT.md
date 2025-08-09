# Deployment Guide

Complete guide for deploying MarkItUp PKM in production environments.

## 🎯 Deployment Options

### 1. Docker Compose (Recommended)
- **Complexity**: Low
- **Maintenance**: Easy
- **Scalability**: Medium
- **Cost**: Low
- **Best for**: Personal use, small teams

### 2. Docker Swarm
- **Complexity**: Medium
- **Maintenance**: Medium
- **Scalability**: High
- **Cost**: Medium
- **Best for**: Medium teams, high availability

### 3. Kubernetes
- **Complexity**: High
- **Maintenance**: High
- **Scalability**: Very High
- **Cost**: Variable
- **Best for**: Large organizations, enterprise

### 4. Cloud Platforms
- **Complexity**: Low-Medium
- **Maintenance**: Low
- **Scalability**: High
- **Cost**: Variable
- **Best for**: Managed services, scaling needs

### 5. VPS/Dedicated Server
- **Complexity**: Medium
- **Maintenance**: High
- **Scalability**: Limited
- **Cost**: Fixed
- **Best for**: Full control, custom requirements

## 🐳 Docker Deployment

### Docker Compose Setup

#### Basic Configuration

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  markitup:
    image: ghcr.io/xclusive36/markitup:latest
    container_name: markitup
    restart: unless-stopped
    ports:
      - "3000:3000"
    volumes:
      - ./markdown:/app/markdown
      - ./uploads:/app/uploads
    environment:
      - NODE_ENV=production
      - PORT=3000
      - HOSTNAME=0.0.0.0
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
```

#### Production Configuration

Enhanced `docker-compose.yml` with SSL and reverse proxy:

```yaml
version: '3.8'

services:
  markitup:
    image: ghcr.io/xclusive36/markitup:latest
    container_name: markitup
    restart: unless-stopped
    expose:
      - "3000"
    volumes:
      - ./markdown:/app/markdown
      - ./uploads:/app/uploads
      - ./config:/app/config
    environment:
      - NODE_ENV=production
      - PORT=3000
      - HOSTNAME=0.0.0.0
      - SECRET_KEY=${SECRET_KEY}
      - CORS_ORIGIN=${CORS_ORIGIN}
    networks:
      - markitup-network

  nginx:
    image: nginx:alpine
    container_name: markitup-nginx
    restart: unless-stopped
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - markitup
    networks:
      - markitup-network

networks:
  markitup-network:
    driver: bridge
```

#### Environment Variables

Create `.env` file:

```bash
# Application
NODE_ENV=production
SECRET_KEY=your-super-secret-key-here
CORS_ORIGIN=https://your-domain.com

# AI Configuration
OPENAI_API_KEY=sk-your-openai-key-here
DEFAULT_AI_MODEL=gpt-3.5-turbo

# Collaboration
ENABLE_COLLABORATION=true
MAX_PARTICIPANTS=25
SESSION_TIMEOUT=7200

# Security
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX=100
HELMET_ENABLED=true

# Monitoring
LOG_LEVEL=info
METRICS_ENABLED=true
```

### Nginx Configuration

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream markitup {
        server markitup:3000;
    }

    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req_zone $binary_remote_addr zone=general:10m rate=2r/s;

    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        # SSL Configuration
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
        ssl_prefer_server_ciphers off;

        # Security Headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
        add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload";

        # Gzip Compression
        gzip on;
        gzip_vary on;
        gzip_min_length 1024;
        gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

        # Main Application
        location / {
            limit_req zone=general burst=20 nodelay;
            proxy_pass http://markitup;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }

        # API Endpoints
        location /api/ {
            limit_req zone=api burst=50 nodelay;
            proxy_pass http://markitup;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # WebSocket for Collaboration
        location /socket.io/ {
            proxy_pass http://markitup;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## ☁️ Cloud Platform Deployment

### Vercel Deployment

#### Setup Steps

1. **Fork the repository** on GitHub
2. **Connect to Vercel**:
   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```
3. **Configure environment variables** in Vercel dashboard
4. **Deploy**:
   ```bash
   vercel --prod
   ```

#### Vercel Configuration

Create `vercel.json`:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next",
      "config": {
        "runtime": "nodejs18.x"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/$1"
    },
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Netlify Deployment

#### Build Configuration

Create `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_ENV = "production"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Railway Deployment

#### Railway Setup

1. **Connect GitHub repository**
2. **Configure environment variables**
3. **Deploy automatically** on push

Create `railway.json`:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "numReplicas": 1,
    "sleepApplication": false,
    "restartPolicyType": "ON_FAILURE"
  }
}
```

### AWS Deployment

#### ECS with Fargate

Create `docker-compose-aws.yml`:

```yaml
version: '3.8'
services:
  markitup:
    image: ghcr.io/xclusive36/markitup:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    deploy:
      replicas: 2
      resources:
        limits:
          cpus: '0.5'
          memory: 512M
        reservations:
          cpus: '0.25'
          memory: 256M
```

#### ECS Task Definition

```json
{
  "family": "markitup-task",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "512",
  "memory": "1024",
  "executionRoleArn": "arn:aws:iam::account:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "markitup",
      "image": "ghcr.io/xclusive36/markitup:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/markitup",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

## 🏗️ VPS Deployment

### Ubuntu Server Setup

#### Initial Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Nginx
sudo apt install nginx -y

# Install Certbot for SSL
sudo apt install certbot python3-certbot-nginx -y
```

#### Application Deployment

```bash
# Create application directory
sudo mkdir -p /opt/markitup
cd /opt/markitup

# Download configuration
wget https://raw.githubusercontent.com/xclusive36/MarkItUp/main/docker-compose.yml
wget https://raw.githubusercontent.com/xclusive36/MarkItUp/main/nginx.conf

# Configure environment
sudo nano .env

# Create data directories
sudo mkdir -p markdown uploads ssl

# Set permissions
sudo chown -R $USER:$USER /opt/markitup

# Start application
docker-compose up -d
```

#### SSL Certificate Setup

```bash
# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Test renewal
sudo certbot renew --dry-run

# Setup auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### CentOS/RHEL Setup

#### System Preparation

```bash
# Update system
sudo dnf update -y

# Install Docker
sudo dnf config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
sudo dnf install docker-ce docker-ce-cli containerd.io -y
sudo systemctl start docker
sudo systemctl enable docker
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Configure firewall
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload
```

## 🔧 Production Optimizations

### Performance Tuning

#### Node.js Optimizations

```bash
# Environment variables for production
NODE_ENV=production
NODE_OPTIONS="--max-old-space-size=2048"
UV_THREADPOOL_SIZE=128
```

#### Docker Optimizations

Multi-stage Dockerfile for smaller images:

```dockerfile
# Build stage
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY . .
RUN chown -R nextjs:nodejs /app
USER nextjs
EXPOSE 3000
CMD ["npm", "start"]
```

### Monitoring Setup

#### Prometheus Configuration

Create `prometheus.yml`:

```yaml
global:
  scrape_interval: 15s

scrape_configs:
  - job_name: 'markitup'
    static_configs:
      - targets: ['markitup:3000']
    metrics_path: '/api/metrics'
    scrape_interval: 30s
```

#### Docker Compose with Monitoring

```yaml
version: '3.8'

services:
  markitup:
    image: ghcr.io/xclusive36/markitup:latest
    # ... existing configuration ...

  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
    volumes:
      - grafana-data:/var/lib/grafana

volumes:
  grafana-data:
```

### Backup Strategies

#### Automated Backup Script

Create `backup.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/backups/markitup"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="markitup_backup_${DATE}.tar.gz"

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup application data
tar -czf "${BACKUP_DIR}/${BACKUP_FILE}" \
  -C /opt/markitup \
  markdown/ \
  uploads/ \
  .env \
  docker-compose.yml

# Keep only last 30 backups
find $BACKUP_DIR -name "markitup_backup_*.tar.gz" -mtime +30 -delete

echo "Backup completed: ${BACKUP_FILE}"
```

#### Cron Job Setup

```bash
# Add to crontab
0 2 * * * /opt/markitup/backup.sh
```

## 🔒 Security Hardening

### Firewall Configuration

#### UFW (Ubuntu)

```bash
# Reset firewall
sudo ufw --force reset

# Default policies
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Allow SSH
sudo ufw allow ssh

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable
```

#### firewalld (CentOS/RHEL)

```bash
# Configure zones
sudo firewall-cmd --permanent --zone=public --add-service=http
sudo firewall-cmd --permanent --zone=public --add-service=https
sudo firewall-cmd --permanent --zone=public --add-service=ssh

# Reload configuration
sudo firewall-cmd --reload
```

### SSL/TLS Security

#### Strong SSL Configuration

```nginx
# Modern SSL configuration
ssl_protocols TLSv1.3 TLSv1.2;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
ssl_prefer_server_ciphers off;

# OCSP Stapling
ssl_stapling on;
ssl_stapling_verify on;

# Session settings
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_session_tickets off;
```

### Application Security

#### Environment Security

```bash
# Secure environment file
chmod 600 .env
chown root:root .env

# Secure application directory
chmod 755 /opt/markitup
chown -R app:app /opt/markitup/markdown
```

## 📊 Monitoring and Logging

### Application Logging

#### Docker Logging

```yaml
services:
  markitup:
    image: ghcr.io/xclusive36/markitup:latest
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

#### Centralized Logging

```yaml
services:
  markitup:
    # ... existing configuration ...
    logging:
      driver: "fluentd"
      options:
        fluentd-address: localhost:24224
        tag: markitup

  fluentd:
    image: fluent/fluentd:v1.14-debian-1
    volumes:
      - ./fluentd.conf:/fluentd/etc/fluent.conf
    ports:
      - "24224:24224"
```

### Health Checks

#### Application Health Check

```bash
#!/bin/bash
# health-check.sh
curl -f http://localhost:3000/api/health || exit 1
```

#### Monitoring Script

```bash
#!/bin/bash
# monitor.sh
HEALTH_URL="http://localhost:3000/api/health"
LOG_FILE="/var/log/markitup-monitor.log"

if ! curl -f $HEALTH_URL > /dev/null 2>&1; then
    echo "$(date): MarkItUp health check failed" >> $LOG_FILE
    # Restart application
    docker-compose restart markitup
fi
```

## 🚀 Scaling Strategies

### Horizontal Scaling

#### Docker Swarm

```yaml
version: '3.8'
services:
  markitup:
    image: ghcr.io/xclusive36/markitup:latest
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 10s
      restart_policy:
        condition: on-failure
    networks:
      - markitup-network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    deploy:
      placement:
        constraints: [node.role == manager]
    networks:
      - markitup-network

networks:
  markitup-network:
    driver: overlay
```

#### Load Balancer Configuration

```nginx
upstream markitup_backend {
    least_conn;
    server markitup_1:3000;
    server markitup_2:3000;
    server markitup_3:3000;
}

server {
    location / {
        proxy_pass http://markitup_backend;
        # ... other proxy settings
    }
}
```

### Database Scaling

#### Redis for Session Storage

```yaml
services:
  markitup:
    environment:
      - REDIS_URL=redis://redis:6379
    depends_on:
      - redis

  redis:
    image: redis:7-alpine
    command: redis-server --appendonly yes
    volumes:
      - redis-data:/data

volumes:
  redis-data:
```

## 🔄 Maintenance Procedures

### Update Process

#### Rolling Updates

```bash
# 1. Backup current state
./backup.sh

# 2. Pull new image
docker-compose pull

# 3. Update with zero downtime
docker-compose up -d --no-deps markitup

# 4. Verify health
curl -f http://localhost:3000/api/health

# 5. Clean up old images
docker image prune -f
```

#### Database Migrations

```bash
# Run database migrations
docker-compose exec markitup npm run migrate

# Verify application
docker-compose exec markitup npm run health-check
```

### Troubleshooting

#### Common Issues

**Container Won't Start**
```bash
# Check logs
docker-compose logs markitup

# Check resource usage
docker stats

# Restart service
docker-compose restart markitup
```

**Performance Issues**
```bash
# Monitor resources
docker stats markitup

# Check application metrics
curl http://localhost:3000/api/metrics

# Scale up if needed
docker-compose up -d --scale markitup=2
```

**SSL Certificate Issues**
```bash
# Check certificate expiry
openssl x509 -in /etc/nginx/ssl/cert.pem -text -noout | grep "Not After"

# Renew certificate
sudo certbot renew

# Reload nginx
docker-compose exec nginx nginx -s reload
```

---

**Ready to deploy?** Start with the [Docker Compose setup](#docker-compose-setup) for the quickest path to production.
