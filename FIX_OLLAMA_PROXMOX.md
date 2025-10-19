# Fix: Ollama in Proxmox/Debian Container Not Accessible from Terminal

## The Problem

Your Ollama server is running in a Debian container in Proxmox at `192.168.50.30:11434`.
- ✅ Browsers (Brave, Safari) CAN connect
- ❌ Terminal tools (curl, Node.js, Python) CANNOT connect
- ❌ Error: "No route to host"

This means the Ollama server is **filtering connections** based on how they connect.

---

## Solution: Configure Ollama to Accept All Connections

### Step 1: Access Your Debian Container

From Proxmox host or via SSH:
```bash
# If using Proxmox CT:
pct enter <container-id>

# Or via SSH:
ssh user@192.168.50.30
```

### Step 2: Check Current Ollama Configuration

```bash
# Check if Ollama is running
ps aux | grep ollama

# Check what port/interface it's listening on
ss -tlnp | grep 11434
# or
netstat -tlnp | grep 11434
```

**Look for:**
- If it shows `127.0.0.1:11434` - that's the problem (localhost only)
- Should show `0.0.0.0:11434` or `*:11434` (all interfaces)

### Step 3: Configure Ollama Environment Variables

Edit the Ollama service configuration:

```bash
# If using systemd service
sudo systemctl edit ollama
```

Add these lines in the editor that opens:
```ini
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
Environment="OLLAMA_ORIGINS=*"
```

Save and exit (Ctrl+X, Y, Enter if using nano).

**Or if starting Ollama manually:**
```bash
# Kill current Ollama
pkill ollama

# Start with proper configuration
export OLLAMA_HOST=0.0.0.0:11434
export OLLAMA_ORIGINS=*
ollama serve
```

### Step 4: Restart Ollama Service

```bash
# If using systemd
sudo systemctl daemon-reload
sudo systemctl restart ollama

# Verify it's listening on all interfaces
ss -tlnp | grep 11434
# Should show: 0.0.0.0:11434 or :::11434
```

### Step 5: Check Debian Container Firewall

```bash
# Check if iptables is blocking
sudo iptables -L -n | grep 11434

# If there are blocking rules, allow port 11434
sudo iptables -A INPUT -p tcp --dport 11434 -j ACCEPT

# Make it persistent (if using iptables-persistent)
sudo netfilter-persistent save

# Or if using ufw
sudo ufw allow 11434/tcp
sudo ufw reload
```

### Step 6: Check Proxmox Firewall

In Proxmox web interface:
1. Go to your container → **Firewall** tab
2. Check if firewall is enabled
3. If enabled, add a rule:
   - **Direction:** IN
   - **Action:** ACCEPT
   - **Protocol:** tcp
   - **Dest. port:** 11434
   - **Source:** Your Mac's IP (192.168.50.103) or leave empty for all

### Step 7: Test from Your Mac

After making changes, test from your Mac terminal:

```bash
# Should now work!
curl http://192.168.50.30:11434/api/tags

# Should return:
# {"models":[]}
```

---

## Why Browsers Worked But Terminal Didn't

Possible reasons:
1. **Ollama was only listening on localhost** and Proxmox was doing port forwarding for HTTP but not raw TCP
2. **Container firewall** was allowing HTTP (port 80/443) forwarding but blocking direct port access
3. **Proxmox NAT/port forwarding** was configured to only forward specific types of traffic
4. **iptables rules** in the container were allowing established connections but blocking new connections from non-browser sources

---

## Alternative: Use Proxmox Port Forwarding

If you don't want to expose Ollama directly, you can set up proper port forwarding in Proxmox:

### Option A: SSH Tunnel (Quick & Secure)

From your Mac:
```bash
# Create tunnel
ssh -L 11434:localhost:11434 user@192.168.50.30

# Then in MarkItUp use:
http://localhost:11434
```

### Option B: Nginx Reverse Proxy in Proxmox

Install nginx in the container or Proxmox host:
```nginx
server {
    listen 11434;
    location / {
        proxy_pass http://localhost:11434;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Quick Diagnostic Commands

Run these **in the Debian container** to diagnose:

```bash
# 1. Check Ollama is running
systemctl status ollama

# 2. Check what it's listening on
ss -tlnp | grep 11434

# 3. Check firewall rules
sudo iptables -L -v -n

# 4. Check Ollama environment
systemctl show ollama | grep Environment

# 5. Test from container itself
curl http://localhost:11434/api/tags

# 6. Test from container's external IP
curl http://192.168.50.30:11434/api/tags
```

---

## Expected Results After Fix

✅ **From Debian container:**
```bash
curl http://localhost:11434/api/tags
# {"models":[]}
```

✅ **From your Mac:**
```bash
curl http://192.168.50.30:11434/api/tags
# {"models":[]}
```

✅ **From MarkItUp:**
- Test Connection button shows: "✓ Connected! Found 0 models"
- Can pull models through MarkItUp interface
- AI features work with Ollama

---

## Need More Help?

If still not working after these steps, please provide:
1. Output of `ss -tlnp | grep 11434` from container
2. Output of `sudo iptables -L -n` from container
3. Proxmox firewall settings screenshot
4. Output of `systemctl show ollama | grep Environment`

---

## Summary

The fix is to make Ollama listen on `0.0.0.0:11434` (all interfaces) instead of `127.0.0.1:11434` (localhost only), and ensure container/Proxmox firewalls allow traffic on port 11434.

After this, both browsers AND terminal tools (including MarkItUp's backend) will be able to connect! 🚀
