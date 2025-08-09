# Installation Guide

Complete setup and configuration guide for MarkItUp PKM.

## 📋 System Requirements

### Minimum Requirements
- **Node.js**: Version 18.0.0 or higher
- **npm**: Version 8.0.0 or higher (comes with Node.js)
- **Memory**: 512MB RAM available
- **Storage**: 100MB free disk space
- **Browser**: Modern browser (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

### Recommended Requirements
- **Node.js**: Version 20.0.0 or higher
- **npm**: Version 9.0.0 or higher
- **Memory**: 2GB RAM available
- **Storage**: 1GB free disk space
- **Browser**: Latest version of Chrome, Firefox, Safari, or Edge

## 🚀 Quick Installation

### 1. Clone the Repository

```bash
git clone https://github.com/xclusive36/MarkItUp.git
cd MarkItUp
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start Development Server

```bash
npm run dev
```

### 4. Access MarkItUp

Open your browser and navigate to [http://localhost:3000](http://localhost:3000)

## ⚙️ Configuration Options

### Environment Variables

Create a `.env.local` file in the root directory for custom configuration:

```bash
# Server Configuration
PORT=3000
HOSTNAME=0.0.0.0

# File Storage (optional)
MARKDOWN_DIR=./markdown

# AI Configuration (optional)
OPENAI_API_KEY=your_api_key_here
DEFAULT_AI_MODEL=gpt-3.5-turbo

# Collaboration (optional)
ENABLE_COLLABORATION=true
MAX_PARTICIPANTS=10
SESSION_TIMEOUT=3600

# Security (optional)
SECRET_KEY=your_secret_key_here
CORS_ORIGIN=*
```

### Basic Configuration

#### Port Configuration
```bash
# Change the default port
PORT=8080 npm run dev
```

#### Storage Directory
```bash
# Use custom markdown directory
MARKDOWN_DIR=/path/to/your/notes npm run dev
```

## 🐳 Docker Installation

### Using Docker Compose (Recommended)

1. **Clone the repository**:
   ```bash
   git clone https://github.com/xclusive36/MarkItUp.git
   cd MarkItUp
   ```

2. **Start with Docker Compose**:
   ```bash
   docker compose up -d
   ```

3. **Access MarkItUp**:
   Open [http://localhost:3000](http://localhost:3000)

### Using Docker CLI

```bash
docker run --name markitup \
  -p 3000:3000 \
  -v ./markdown:/app/markdown \
  --restart unless-stopped \
  -e PORT=3000 \
  -e HOSTNAME=0.0.0.0 \
  ghcr.io/xclusive36/markitup:latest
```

### Custom Docker Configuration

Create a custom `docker-compose.yml`:

```yaml
version: '3.8'
services:
  markitup:
    image: ghcr.io/xclusive36/markitup:latest
    container_name: markitup
    ports:
      - "3000:3000"
    volumes:
      - ./markdown:/app/markdown
      - ./config:/app/config
    environment:
      - PORT=3000
      - HOSTNAME=0.0.0.0
      - OPENAI_API_KEY=${OPENAI_API_KEY}
    restart: unless-stopped
```

## 🏗️ Production Deployment

### Build for Production

```bash
# Install dependencies
npm install

# Build the application
npm run build

# Start production server
npm start
```

### PM2 Process Manager

For production deployments, use PM2 for process management:

```bash
# Install PM2 globally
npm install -g pm2

# Build the application
npm run build

# Start with PM2
pm2 start npm --name "markitup" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
```

### Nginx Reverse Proxy

Configure Nginx as a reverse proxy:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔐 Security Setup

### Basic Security Configuration

1. **Change default secrets**:
   ```bash
   # Generate a random secret key
   SECRET_KEY=$(openssl rand -hex 32)
   ```

2. **Configure CORS**:
   ```bash
   # Restrict CORS to your domain
   CORS_ORIGIN=https://your-domain.com
   ```

3. **Enable HTTPS** (recommended for production):
   ```bash
   # Use Let's Encrypt with Certbot
   sudo certbot --nginx -d your-domain.com
   ```

### File System Permissions

Set appropriate permissions for the markdown directory:

```bash
# Create markdown directory with proper permissions
mkdir -p ./markdown
chmod 755 ./markdown

# Ensure the application can write to the directory
chown -R $USER:$USER ./markdown
```

## 🤖 AI Features Setup

### OpenAI Configuration

1. **Get an API Key**:
   - Visit [OpenAI API](https://platform.openai.com/api-keys)
   - Create an account and generate an API key
   - Copy the key (starts with `sk-`)

2. **Configure in MarkItUp**:
   - Method 1: Environment variable
     ```bash
     OPENAI_API_KEY=sk-your-api-key-here
     ```
   - Method 2: In-app configuration
     - Click the Brain icon (🧠) in the header
     - Click Settings in the AI chat panel
     - Enter your API key

3. **Choose a Model**:
   - **GPT-3.5 Turbo**: Fast and cost-effective
   - **GPT-4**: Most capable but more expensive
   - **GPT-4 Turbo**: Balanced option with larger context

### Local AI Setup (Future)

MarkItUp is planning support for local AI models via Ollama:

```bash
# Install Ollama (when supported)
curl -fsSL https://ollama.ai/install.sh | sh

# Download a model
ollama pull llama2

# Configure MarkItUp to use local model
AI_PROVIDER=ollama
OLLAMA_MODEL=llama2
```

## 🤝 Collaboration Setup

### Enable Real-time Collaboration

1. **Configure environment**:
   ```bash
   ENABLE_COLLABORATION=true
   MAX_PARTICIPANTS=10
   SESSION_TIMEOUT=3600
   ```

2. **WebSocket Configuration**:
   ```bash
   # For production with reverse proxy
   WEBSOCKET_PATH=/socket.io/
   WEBSOCKET_TRANSPORTS=websocket,polling
   ```

3. **Firewall Configuration**:
   ```bash
   # Allow WebSocket connections
   sudo ufw allow 3000/tcp
   ```

## 📱 Mobile and PWA Setup

### Progressive Web App (PWA)

MarkItUp includes PWA capabilities for mobile installation:

1. **Enable PWA features**:
   ```bash
   ENABLE_PWA=true
   PWA_THEME_COLOR=#1e293b
   PWA_BACKGROUND_COLOR=#ffffff
   ```

2. **Install on mobile**:
   - Open MarkItUp in mobile browser
   - Tap "Add to Home Screen" or "Install App"
   - Access like a native app

### Mobile Optimization

Configure for optimal mobile experience:

```bash
# Mobile-specific settings
MOBILE_BREAKPOINT=768
TOUCH_ENABLED=true
MOBILE_MENU_STYLE=bottom
```

## 🔧 Troubleshooting

### Common Issues

#### Node.js Version Issues
```bash
# Check Node.js version
node --version

# Update Node.js using nvm
nvm install 20
nvm use 20
```

#### Port Already in Use
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 PID

# Or use a different port
PORT=3001 npm run dev
```

#### Permission Denied Errors
```bash
# Fix npm permissions
sudo chown -R $USER:$GROUP ~/.npm
sudo chown -R $USER:$GROUP ~/.config

# Or use npm without sudo
npm config set prefix ~/.npm-global
export PATH=~/.npm-global/bin:$PATH
```

#### Docker Issues
```bash
# Check Docker status
docker --version
docker-compose --version

# Restart Docker service
sudo systemctl restart docker

# Clean Docker cache
docker system prune -f
```

### Performance Optimization

#### Memory Issues
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=4096" npm run dev
```

#### Slow Build Times
```bash
# Use faster package manager
npm install -g pnpm
pnpm install
pnpm dev
```

#### Database Performance
```bash
# Clear application cache
rm -rf .next/cache
npm run build
```

## 📊 Monitoring and Logging

### Application Logs

```bash
# View application logs
npm run dev 2>&1 | tee app.log

# With PM2
pm2 logs markitup

# Docker logs
docker logs markitup
```

### Health Checks

Create a health check endpoint:

```bash
# Check application health
curl http://localhost:3000/api/health

# Expected response
{"status":"ok","timestamp":"2025-01-06T12:00:00.000Z"}
```

## 🔄 Updates and Maintenance

### Updating MarkItUp

```bash
# Pull latest changes
git pull origin main

# Update dependencies
npm install

# Rebuild application
npm run build

# Restart application
pm2 restart markitup
```

### Backup and Restore

```bash
# Backup markdown files
tar -czf backup-$(date +%Y%m%d).tar.gz markdown/

# Restore from backup
tar -xzf backup-20250106.tar.gz
```

### Database Maintenance

```bash
# Clear temporary files
rm -rf .next/cache
rm -rf node_modules/.cache

# Rebuild node_modules if needed
rm -rf node_modules
npm install
```

## 🆘 Getting Help

### Documentation
- [Features Guide](FEATURES.md)
- [User Guide](USER_GUIDE.md)
- [API Reference](API_REFERENCE.md)
- [Plugin Development](PLUGIN_DEVELOPMENT.md)

### Community Support
- GitHub Issues: [Report bugs](https://github.com/xclusive36/MarkItUp/issues)
- Discussions: [Get help](https://github.com/xclusive36/MarkItUp/discussions)
- Documentation: [Browse docs](https://github.com/xclusive36/MarkItUp/tree/main/docs)

### Professional Support
For enterprise deployments and professional support, contact the maintainers through GitHub.

---

**Next Steps**: Once installed, check out the [User Guide](USER_GUIDE.md) to learn how to use MarkItUp PKM effectively.
