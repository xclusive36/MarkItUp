# HTTPS + Ollama Setup Guide

## Problem
When running MarkItUp over HTTPS (via reverse proxy), browsers block HTTP requests to Ollama due to **Mixed Content Policy**. 

**Error symptoms:**
- Console shows "blocked by CORS policy" or "Mixed Content" errors
- AI Chat fails to connect even though Ollama is running
- Works fine on HTTP localhost but fails on HTTPS deployment

## Why Server-Side Proxy Won't Work
- MarkItUp's Next.js server is in a DMZ/public-facing network
- Ollama is on an internal/private network (e.g., `192.168.50.30`)
- Server cannot reach Ollama due to network segmentation (this is intentional for security)
- **Browser CAN reach Ollama** (same internal network), but **HTTPS blocks HTTP requests**

## Solution: Make Ollama Accessible via HTTPS

You have **three options**:

---

### Option 1: Reverse Proxy for Ollama (Recommended)

Set up a reverse proxy (Nginx/Caddy/Traefik) with SSL for Ollama on the same server where Ollama runs.

#### Using Nginx + Let's Encrypt

**1. Install Nginx and Certbot:**
```bash
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx
```

**2. Create Nginx config for Ollama:**
```bash
sudo nano /etc/nginx/sites-available/ollama
```

Add this configuration:
```nginx
server {
    listen 443 ssl http2;
    server_name ollama.yourdomain.com;  # Use your domain or subdomain
    
    # SSL certificates (will be added by certbot)
    ssl_certificate /etc/letsencrypt/live/ollama.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/ollama.yourdomain.com/privkey.pem;
    
    # Proxy to Ollama
    location / {
        proxy_pass http://localhost:11434;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # Important for streaming
        proxy_buffering off;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
    }
}
```

**3. Enable the site:**
```bash
sudo ln -s /etc/nginx/sites-available/ollama /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
```

**4. Get SSL certificate:**
```bash
sudo certbot --nginx -d ollama.yourdomain.com
```

**5. Restart Nginx:**
```bash
sudo systemctl restart nginx
```

**6. Update MarkItUp settings:**
- Ollama URL: `https://ollama.yourdomain.com`
- Everything else stays the same

---

### Option 2: Cloudflare Tunnel (Easiest, No Domain Required)

If you're already using Cloudflare Tunnel for MarkItUp, add Ollama too:

**1. Add Ollama to your tunnel config:**
```yaml
tunnel: your-tunnel-id
credentials-file: /path/to/credentials.json

ingress:
  - hostname: markitup.yourdomain.com
    service: http://localhost:3000
  
  # Add Ollama
  - hostname: ollama.yourdomain.com
    service: http://localhost:11434
  
  - service: http_status:404
```

**2. Restart the tunnel:**
```bash
cloudflared tunnel run your-tunnel-name
```

**3. Update MarkItUp settings:**
- Ollama URL: `https://ollama.yourdomain.com`

**Benefits:**
- Free SSL certificates
- No port forwarding needed
- Works behind NAT/firewall
- Automatic HTTPS

---

### Option 3: Self-Signed Certificate (Development Only)

⚠️ **NOT recommended for production** - browsers will show security warnings.

**1. Generate self-signed certificate:**
```bash
openssl req -x509 -newkey rsa:4096 -keyout ollama-key.pem -out ollama-cert.pem -days 365 -nodes
```

**2. Configure Ollama with HTTPS** (if Ollama supports it directly), or use Nginx as in Option 1 with self-signed certs.

**3. Accept the certificate in your browser** (you'll get security warnings)

---

## Recommended Setup

For most users:
- **Production**: Option 1 (Nginx + Let's Encrypt) - Most secure, professional
- **Already using Cloudflare**: Option 2 (Cloudflare Tunnel) - Easiest integration
- **Development only**: Option 3 (Self-signed) - Quick testing

## Security Considerations

### ✅ DO:
- Use Let's Encrypt certificates (free and auto-renewing)
- Keep Ollama on internal network
- Use firewall rules to restrict access
- Consider authentication if exposing Ollama publicly

### ❌ DON'T:
- Expose Ollama directly to the internet without SSL
- Use self-signed certificates in production
- Share your Ollama endpoint publicly without authentication

## Testing Your Setup

After configuring HTTPS for Ollama:

1. **Test from browser console:**
```javascript
fetch('https://ollama.yourdomain.com/api/tags')
  .then(r => r.json())
  .then(data => console.log('Models:', data))
  .catch(err => console.error('Error:', err));
```

2. **In MarkItUp:**
- Go to AI Chat settings (Brain icon → Settings)
- Set Ollama URL to `https://ollama.yourdomain.com`
- Click "Test Connection"
- Should show "✓ Connected! Found X models"

3. **Try a chat message:**
- Open a note
- Open AI Chat
- Send a message
- Should stream response without errors

## Troubleshooting

### "SSL certificate problem"
- Make sure your domain DNS is pointed correctly
- Let's Encrypt needs to verify domain ownership
- Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`

### "Connection refused"
- Check Ollama is running: `systemctl status ollama`
- Check Nginx is running: `systemctl status nginx`
- Verify firewall allows HTTPS (port 443)

### Still getting Mixed Content errors
- Make sure you're using `https://` in the Ollama URL, not `http://`
- Clear browser cache and reload MarkItUp
- Check browser console for actual error message

### Streaming doesn't work
- Make sure `proxy_buffering off` is in Nginx config
- Check timeout values are high enough
- Test with non-streaming first (disable streaming in settings)

## Alternative: Use API Keys Instead

If setting up HTTPS for Ollama is too complex, consider using a cloud AI provider instead:
- **OpenAI**: Most reliable, pay-as-you-go
- **Anthropic**: Claude models, good for long context
- **Gemini**: Google's models, competitive pricing

These work directly over HTTPS and don't require local setup.

---

**Summary**: The browser needs HTTPS to talk to Ollama when your app is HTTPS. Set up a reverse proxy with SSL certificates for Ollama, then update the Ollama URL in MarkItUp settings to use `https://`.

**Date**: October 21, 2025  
**Issue**: HTTPS app cannot connect to HTTP Ollama  
**Solution**: Use reverse proxy with SSL for Ollama
