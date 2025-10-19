# Debug Commands - Run on Debian Container

Please SSH to your Ollama container and run these commands one by one, then share the output:

## 1. Check if Ollama service is running
```bash
sudo systemctl status ollama
```

## 2. Check what IP/port Ollama is listening on (CRITICAL)
```bash
sudo ss -tlnp | grep 11434
```
**Look for:** Should show `0.0.0.0:11434` not `127.0.0.1:11434`

## 3. Check if environment variables were applied
```bash
sudo systemctl show ollama | grep Environment
```
**Look for:** Should show OLLAMA_HOST=0.0.0.0:11434

## 4. Check if override file exists and has content
```bash
cat /etc/systemd/system/ollama.service.d/override.conf
```
**Look for:** Should show the Environment lines

## 5. Test from INSIDE the container
```bash
curl http://localhost:11434/api/tags
curl http://127.0.0.1:11434/api/tags
curl http://192.168.50.30:11434/api/tags
```
**All three should work if Ollama is running**

## 6. Check iptables firewall rules
```bash
sudo iptables -L INPUT -n -v | grep 11434
```
**If nothing shows, the firewall might be blocking it**

## 7. Check if ufw is enabled
```bash
sudo ufw status
```

## 8. Check Proxmox container firewall
**In Proxmox web UI:**
- Go to your container
- Click "Firewall" tab
- Check if it's enabled and if there are any rules blocking port 11434

---

## Based on the results, try this:

### If `ss -tlnp` shows `127.0.0.1:11434` (localhost only):
The environment variable didn't take effect. Try stopping and manually running:
```bash
sudo systemctl stop ollama
sudo -u ollama OLLAMA_HOST=0.0.0.0:11434 OLLAMA_ORIGINS=* /usr/local/bin/ollama serve
```
(Leave this running, test from Mac, then Ctrl+C and fix the service file)

### If `ss -tlnp` shows `0.0.0.0:11434` but still can't connect from Mac:
It's a firewall issue. Run:
```bash
# Allow the port
sudo iptables -I INPUT -p tcp --dport 11434 -j ACCEPT

# Test immediately from Mac
```

### If iptables doesn't work:
```bash
# If using ufw
sudo ufw allow 11434/tcp
sudo ufw reload
```

---

## Quick All-in-One Test Script

Run this on the container:
```bash
#!/bin/bash
echo "=== Ollama Status ==="
sudo systemctl status ollama | grep Active

echo -e "\n=== What Ollama is listening on ==="
sudo ss -tlnp | grep 11434

echo -e "\n=== Environment Variables ==="
sudo systemctl show ollama | grep Environment

echo -e "\n=== Override File ==="
cat /etc/systemd/system/ollama.service.d/override.conf 2>/dev/null || echo "Override file not found"

echo -e "\n=== Firewall Rules ==="
sudo iptables -L INPUT -n | grep 11434

echo -e "\n=== UFW Status ==="
sudo ufw status 2>/dev/null || echo "UFW not installed"

echo -e "\n=== Test Local Connection ==="
curl -s http://localhost:11434/api/tags || echo "Local connection failed"
```

Save this as `debug-ollama.sh`, run `chmod +x debug-ollama.sh`, then `./debug-ollama.sh` and share the output.
