# Ollama Connection Troubleshooting

## Issue: "Test fails but URL is correct"

If you're seeing a failed test even though your Ollama URL is correct, here are the debugging steps:

## 🔍 Diagnostic Steps

### 1. Verify Ollama is Actually Running

**Test from terminal:**
```bash
# Check if Ollama process is running
ps aux | grep ollama

# Test with curl (replace URL with your actual URL)
curl http://localhost:11434/api/tags

# Should return JSON with "models" array
```

**Expected output:**
```json
{
  "models": [
    {
      "name": "llama3.2:latest",
      "modified_at": "2024-10-15T12:30:00Z",
      ...
    }
  ]
}
```

### 2. Check Browser Console for Actual Error

1. Open Browser DevTools (F12 or Cmd+Option+I)
2. Go to Console tab
3. Click "Test Connection" in MarkItUp
4. Look for the actual error message

**Common errors and solutions:**

| Error | Meaning | Solution |
|-------|---------|----------|
| `ECONNREFUSED` | Ollama not running | Run `ollama serve` |
| `ENOTFOUND` | Wrong hostname | Check URL spelling |
| `ETIMEDOUT` | Firewall blocking | Check firewall settings |
| `404` | Wrong endpoint | Make sure URL doesn't include `/api/tags` |
| `Mixed Content` | HTTP vs HTTPS | Use `https://` or configure mixed content |

### 3. Common URL Mistakes

**❌ Wrong:**
```
http://localhost:11434/api/tags    ← Don't include /api/tags
http://localhost:11434/            ← Don't include trailing slash
localhost:11434                     ← Missing http://
https://localhost:11434             ← Use http:// not https:// (unless you configured SSL)
```

**✅ Correct:**
```
http://localhost:11434
http://192.168.1.100:11434
http://my-ollama-server.local:11434
```

### 4. Test the Proxy Endpoint Directly

**Create this test file:** `test-ollama-proxy.html`

```html
<!DOCTYPE html>
<html>
<head>
    <title>Ollama Proxy Test</title>
</head>
<body>
    <h1>Ollama Proxy Test</h1>
    <input type="text" id="url" value="http://localhost:11434" style="width: 300px">
    <button onclick="testConnection()">Test</button>
    <pre id="result"></pre>

    <script>
        async function testConnection() {
            const url = document.getElementById('url').value;
            const resultEl = document.getElementById('result');
            resultEl.textContent = 'Testing...';

            try {
                const response = await fetch('/api/ai/ollama-proxy', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        ollamaUrl: url,
                        endpoint: '/api/tags',
                        method: 'GET'
                    })
                });

                const result = await response.json();
                resultEl.textContent = JSON.stringify(result, null, 2);

                if (result.success) {
                    resultEl.style.color = 'green';
                } else {
                    resultEl.style.color = 'red';
                }
            } catch (error) {
                resultEl.textContent = 'Error: ' + error.message;
                resultEl.style.color = 'red';
            }
        }
    </script>
</body>
</html>
```

Save this to `/Users/xclusive36/MarkItUp/public/test-ollama.html` and visit:
```
http://localhost:3000/test-ollama.html
```

### 5. Check Network Tab

1. Open DevTools → Network tab
2. Click "Test Connection"
3. Find the request to `/api/ai/ollama-proxy`
4. Click it and check:
   - **Request Payload:** Is `ollamaUrl` correct?
   - **Response:** What's the actual error?

### 6. Verify Ollama Server Settings

**Check Ollama environment:**
```bash
# See what port Ollama is using
lsof -i :11434

# Check Ollama environment variables
env | grep OLLAMA

# View Ollama service status (if using systemd)
systemctl status ollama

# Check Ollama logs
journalctl -u ollama -n 50
```

**Common issues:**
- Ollama running on different port (check with `lsof`)
- Ollama bound to different interface (check `OLLAMA_HOST`)
- Firewall blocking requests

### 7. Test with Different URLs

If running Ollama on same machine as MarkItUp:
```
http://localhost:11434     ← Try first
http://127.0.0.1:11434     ← Try if localhost fails
http://0.0.0.0:11434       ← Don't use this
```

If running Ollama on different machine:
```
http://192.168.1.100:11434  ← Use actual IP
http://ollama-server:11434   ← Use hostname if DNS works
```

## 🐛 Debugging the Proxy Endpoint

If the proxy itself has issues, check server logs:

**In your Next.js terminal (where `npm run dev` is running):**
Look for errors like:
```
Ollama proxy error: [Error details]
```

**Add debug logging:**

Edit `/Users/xclusive36/MarkItUp/src/app/api/ai/ollama-proxy/route.ts`:

```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ollamaUrl, endpoint, method = 'GET', data } = body;

    // ADD THIS DEBUG LOG
    console.log('🔍 Ollama Proxy Request:', { ollamaUrl, endpoint, method });

    // ... rest of code
```

Then check your terminal for the debug output.

## 📋 Information to Gather

If still not working, gather this info:

1. **Your Ollama URL:** `_________________`
2. **Ollama running?** `[ ] Yes [ ] No`
3. **curl test works?** `[ ] Yes [ ] No`
4. **Browser console error:** `_________________`
5. **Network tab response:** `_________________`
6. **Server terminal error:** `_________________`
7. **OS:** `[ ] macOS [ ] Linux [ ] Windows`
8. **Ollama version:** `_________________` (run `ollama --version`)

## 🎯 Quick Fixes to Try

### Fix 1: Restart Everything
```bash
# Kill Ollama
pkill ollama

# Start Ollama
ollama serve

# In another terminal, verify it's running
curl http://localhost:11434/api/tags

# Restart MarkItUp dev server
# Ctrl+C in npm run dev terminal, then:
npm run dev
```

### Fix 2: Use Explicit IP Instead of localhost
If `localhost` doesn't work, try `127.0.0.1`:
```
http://127.0.0.1:11434
```

### Fix 3: Check for Port Conflicts
```bash
# See what's on port 11434
lsof -i :11434

# Should show ollama process
```

### Fix 4: Verify Ollama CORS Settings (Probably Not Needed)
The proxy should handle CORS, but if you want to be sure:

```bash
# Set Ollama to allow requests from MarkItUp
export OLLAMA_ORIGINS="http://localhost:3000"
ollama serve
```

### Fix 5: Try the Built-in Test
1. Open terminal
2. Run this test script:

```bash
# Create test script
cat > test-ollama.sh << 'EOF'
#!/bin/bash
URL="${1:-http://localhost:11434}"
echo "Testing Ollama at: $URL"
echo "---"
curl -s "$URL/api/tags" | python3 -m json.tool
echo "---"
if [ $? -eq 0 ]; then
  echo "✓ Connection successful!"
else
  echo "✗ Connection failed!"
fi
EOF

chmod +x test-ollama.sh
./test-ollama.sh http://localhost:11434
```

## 🔧 Known Issues

### Issue: Mixed Content (HTTPS → HTTP)
If MarkItUp is served over HTTPS but Ollama is HTTP, browsers may block the request.

**Solution:**
- Use HTTPS for Ollama (configure SSL)
- Or serve MarkItUp over HTTP during development
- Or use browser's "Allow insecure content" for localhost

### Issue: Docker/Container Network
If Ollama is in Docker and MarkItUp is not (or vice versa):

**Solution:**
```bash
# From inside container, use host.docker.internal
http://host.docker.internal:11434

# Or use host network mode
docker run --network host ...
```

### Issue: WSL/Windows
If running Ollama in WSL:

**Solution:**
```bash
# From Windows, access WSL Ollama
http://localhost:11434

# From WSL, might need to use Windows IP
http://$(cat /etc/resolv.conf | grep nameserver | awk '{print $2}'):11434
```

## 📞 Still Not Working?

**Create a minimal reproduction:**

1. Save the test HTML above to `public/test-ollama.html`
2. Visit `http://localhost:3000/test-ollama.html`
3. Enter your Ollama URL
4. Click Test
5. Copy the full result (including error details)

**Then report with:**
- Full error message from test page
- Output of `curl http://localhost:11434/api/tags`
- Output of `ollama --version`
- Your OS and setup (Docker? WSL? etc.)

---

## ✅ Success Checklist

When working correctly, you should see:

- [ ] `curl http://localhost:11434/api/tags` returns JSON with models
- [ ] Test page shows `"success": true` with green text
- [ ] MarkItUp settings show: "✓ Connected (v0.1.47)! Found X models"
- [ ] Model dropdown populates automatically
- [ ] No errors in browser console
- [ ] No errors in Next.js terminal

If all checked: Connection is good! The AI features should work.
