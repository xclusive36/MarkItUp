# Ollama Configuration Fix - Alternative Methods

## Problem: systemctl edit gets overwritten

If `systemctl edit ollama` reverts after save, try these alternative methods:

---

## Method 1: Create Override Directory Manually

```bash
# On your Debian container (SSH to 192.168.50.30)

# Create override directory
sudo mkdir -p /etc/systemd/system/ollama.service.d/

# Create override file
sudo nano /etc/systemd/system/ollama.service.d/override.conf

# Add these lines:
[Service]
Environment="OLLAMA_HOST=0.0.0.0:11434"
Environment="OLLAMA_ORIGINS=*"

# Save: Ctrl+X, Y, Enter

# Reload and restart
sudo systemctl daemon-reload
sudo systemctl restart ollama

# Verify it took effect
sudo systemctl show ollama | grep Environment
```

---

## Method 2: Edit Main Service File Directly

```bash
# Find the service file location
systemctl status ollama | grep Loaded

# Usually it's at /etc/systemd/system/ollama.service
# Edit it
sudo nano /etc/systemd/system/ollama.service

# Find the [Service] section and add:
Environment="OLLAMA_HOST=0.0.0.0:11434"
Environment="OLLAMA_ORIGINS=*"

# Example of what it should look like:
[Service]
ExecStart=/usr/local/bin/ollama serve
Environment="OLLAMA_HOST=0.0.0.0:11434"
Environment="OLLAMA_ORIGINS=*"
User=ollama
Group=ollama
Restart=always
RestartSec=3

# Save and restart
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

---

## Method 3: Use Environment File

```bash
# Create environment file
sudo nano /etc/default/ollama

# Add these lines:
OLLAMA_HOST=0.0.0.0:11434
OLLAMA_ORIGINS=*

# Save: Ctrl+X, Y, Enter

# Now edit the service to use this file
sudo nano /etc/systemd/system/ollama.service

# Find [Service] section and add:
EnvironmentFile=/etc/default/ollama

# Save, reload, restart
sudo systemctl daemon-reload
sudo systemctl restart ollama
```

---

## Method 4: Stop Service & Run Manually (Quick Test)

If you just want to test if this fixes the issue:

```bash
# Stop the service
sudo systemctl stop ollama

# Run manually with correct settings
sudo -u ollama env OLLAMA_HOST=0.0.0.0:11434 OLLAMA_ORIGINS=* ollama serve
```

Leave this running in the terminal, then test from your Mac:
```bash
curl http://192.168.50.30:11434/api/tags
```

If this works, you know the configuration is correct and just need to make it permanent using one of the methods above.

---

## Method 5: Docker Compose (If Using Docker)

If Ollama is in a Docker container:

```yaml
# docker-compose.yml
version: '3'
services:
  ollama:
    image: ollama/ollama
    ports:
      - "11434:11434"
    environment:
      - OLLAMA_HOST=0.0.0.0:11434
      - OLLAMA_ORIGINS=*
    volumes:
      - ollama_data:/root/.ollama
    restart: unless-stopped

volumes:
  ollama_data:
```

Then:
```bash
docker-compose down
docker-compose up -d
```

---

## Verification Commands

After applying any method, verify with:

```bash
# 1. Check if environment variables are set
sudo systemctl show ollama | grep Environment

# Should show:
# Environment=OLLAMA_HOST=0.0.0.0:11434 OLLAMA_ORIGINS=*

# 2. Check what Ollama is listening on
sudo ss -tlnp | grep 11434

# Should show:
# LISTEN 0  4096  0.0.0.0:11434  0.0.0.0:*  users:(("ollama",pid=1234,fd=3))
#                ^^^^^^^ - This is important! Should be 0.0.0.0, not 127.0.0.1

# 3. Test from container itself
curl http://localhost:11434/api/tags

# 4. Test from container's external IP
curl http://192.168.50.30:11434/api/tags
```

---

## If Still Reverting: Check for Package Manager Overrides

```bash
# Check if Ollama is installed via package manager
which ollama
dpkg -l | grep ollama
apt list --installed | grep ollama

# If installed via apt/dpkg, there might be a package config
ls -la /etc/ollama/
cat /etc/ollama/ollama.env  # If exists

# Package manager configs might override systemd
```

---

## Firewall Rules (Don't Forget!)

After getting Ollama to listen on 0.0.0.0:11434, make sure firewall allows it:

```bash
# Check current rules
sudo iptables -L -n -v | grep 11434

# If not allowed, add rule
sudo iptables -I INPUT -p tcp --dport 11434 -j ACCEPT

# Make persistent (Debian/Ubuntu)
sudo apt-get install iptables-persistent
sudo netfilter-persistent save

# Or if using ufw
sudo ufw allow 11434/tcp
sudo ufw reload
```

---

## Quick Debug: Why is systemctl edit reverting?

```bash
# Check if there's a drop-in directory
ls -la /etc/systemd/system/ollama.service.d/

# Check if the override file exists and has content
cat /etc/systemd/system/ollama.service.d/override.conf

# Check file permissions
ls -la /etc/systemd/system/ollama.service.d/override.conf

# Should be:
# -rw-r--r-- 1 root root ... override.conf

# If file is empty or missing, the issue is with how you're saving
# Try Method 1 above (manually create the file)
```

---

## Test from Your Mac After Fix

```bash
# These should all work now:
curl http://192.168.50.30:11434/api/tags
nc -zv 192.168.50.30 11434
ping 192.168.50.30  # Might still fail if ICMP is blocked, that's OK

# Test from MarkItUp:
# Visit: http://localhost:3000/test-ollama.html
# Or use MarkItUp AI Settings → Test Connection
```

---

## Recommended Approach

Try **Method 1** (Create Override Directory Manually) first - it's the most reliable and follows systemd best practices. The override directory won't be touched by package updates.

Let me know which method you try and if you're still having issues! 🚀
