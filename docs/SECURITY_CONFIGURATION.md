# Security Configuration Guide

## Overview

MarkItUp is designed as a self-hosted application with security features that can be configured based on your deployment environment. This guide explains the security options available to administrators.

## HTTPS Enforcement

### Default Behavior (Recommended for Local Deployments)

By default, HTTPS enforcement is **disabled** to support:
- Local development environments
- Internal network deployments without SSL/TLS
- Docker containers in private networks
- Home server setups

This allows you to run MarkItUp on `http://localhost:3000` or `http://192.168.1.100:3000` without any issues.

### Enabling HTTPS Enforcement (For Public Deployments)

If you're deploying MarkItUp on a public server with proper SSL/TLS certificates (via Let's Encrypt, CloudFlare, etc.), you can enable HTTPS enforcement:

**Step 1**: Set up SSL/TLS on your reverse proxy (nginx, Caddy, Traefik) or hosting platform

**Step 2**: Add to your `.env` file:
```bash
NODE_ENV=production
ENFORCE_HTTPS=true
```

**What this does:**
- Automatically redirects HTTP requests to HTTPS (301 redirect)
- Sets HSTS (Strict Transport Security) headers
- Tells browsers to only access your site via HTTPS for 1 year

**Important**: Only enable this AFTER you have SSL/TLS properly configured. Enabling it without SSL will break your deployment.

### Example Deployment Scenarios

#### Scenario 1: Local Home Server (HTTP OK)
```bash
NODE_ENV=production
ENFORCE_HTTPS=false  # or omit entirely
NEXT_PUBLIC_APP_URL=http://192.168.1.100:3000
```
✅ Perfect for home labs, personal servers, internal tools

#### Scenario 2: Docker on Private Network (HTTP OK)
```bash
NODE_ENV=production
ENFORCE_HTTPS=false
NEXT_PUBLIC_APP_URL=http://markitup.local:3000
```
✅ Ideal for containerized deployments in private networks

#### Scenario 3: Public VPS with Reverse Proxy (HTTPS Enforced)
```bash
NODE_ENV=production
ENFORCE_HTTPS=true
NEXT_PUBLIC_APP_URL=https://notes.yourdomain.com
```
✅ Recommended for public-facing deployments

#### Scenario 4: Behind Cloudflare/Nginx with SSL Termination
```bash
NODE_ENV=production
ENFORCE_HTTPS=false  # Cloudflare/Nginx handles HTTPS
NEXT_PUBLIC_APP_URL=https://notes.yourdomain.com
```
✅ Let your reverse proxy handle SSL termination

## Other Security Settings

### JWT Secret (Required for Production)

Generate a strong secret:
```bash
openssl rand -base64 32
```

Add to `.env`:
```bash
JWT_SECRET=your-generated-secret-here
```

**Why?** This signs authentication tokens. Without it, attackers could forge sessions.

### Encryption Key (Required for Production)

Generate an encryption key:
```bash
openssl rand -hex 16
```

Add to `.env`:
```bash
ENCRYPTION_KEY=your-generated-key-here
```

**Why?** Encrypts stored API keys and sensitive user data.

### Development Mode Authentication Bypass

For development only:
```bash
DISABLE_AUTH=true
```

**⚠️ NEVER use in production!** This bypasses all authentication.

## Security Headers

MarkItUp automatically sets these security headers:

| Header | Purpose | Always Enabled |
|--------|---------|----------------|
| Content-Security-Policy | Prevents XSS attacks | ✅ |
| X-Frame-Options | Prevents clickjacking | ✅ |
| X-Content-Type-Options | Prevents MIME sniffing | ✅ |
| X-XSS-Protection | Browser XSS filter | ✅ |
| Referrer-Policy | Controls referrer info | ✅ |
| Permissions-Policy | Limits browser features | ✅ |
| Strict-Transport-Security | Forces HTTPS | Only if ENFORCE_HTTPS=true |

## Rate Limiting

Built-in rate limiting protects against abuse:
- File reads: 100 requests/minute
- File creation: 20 requests/minute
- File operations: 50 requests/minute

These are automatically enforced and don't require configuration.

## Best Practices

### For Local/Internal Deployments
1. ✅ Use strong JWT_SECRET and ENCRYPTION_KEY
2. ✅ Keep ENFORCE_HTTPS=false
3. ✅ Run behind a firewall or VPN if needed
4. ✅ Regular backups of markdown files and database

### For Public Deployments
1. ✅ Use SSL/TLS certificates (Let's Encrypt is free)
2. ✅ Set ENFORCE_HTTPS=true
3. ✅ Use strong, unique secrets
4. ✅ Enable authentication (never use DISABLE_AUTH)
5. ✅ Consider setting up a reverse proxy (nginx, Caddy)
6. ✅ Regular security updates
7. ✅ Monitor logs for suspicious activity

## Questions?

- **Q: I get "too many redirects" errors**  
  A: You likely enabled ENFORCE_HTTPS without proper SSL setup. Disable it or fix SSL configuration.

- **Q: Can I run in production without HTTPS?**  
  A: Yes, for internal/private networks. HTTPS is only required for public internet deployments.

- **Q: What if I use Cloudflare or a reverse proxy?**  
  A: Let them handle SSL termination. Keep ENFORCE_HTTPS=false in MarkItUp.

- **Q: Is HTTP secure for local deployment?**  
  A: On a trusted local network, yes. For public internet, use HTTPS.

## Additional Resources

- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)
- [Let's Encrypt (Free SSL)](https://letsencrypt.org/)
- [Caddy (Auto HTTPS)](https://caddyserver.com/)
- [MarkItUp Deployment Guide](./DEPLOYMENT.md)
