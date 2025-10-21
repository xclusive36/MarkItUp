# Browser vs Terminal Connection Mystery - Debug Script

## Summary
- ✅ Browser CAN access: http://192.168.50.30:11434/api/tags
- ❌ Terminal curl CANNOT
- ❌ Node.js fetch CANNOT (this is what MarkItUp uses)
- ❌ Ping CANNOT

## Possible Causes

### 1. Browser Using Different Network Path
Your browser might be:
- Connected to a different network/VPN
- Using a browser-specific proxy
- Accessing through a cached/stale connection

### 2. macOS Firewall Blocking Terminal Apps
The macOS firewall might be blocking outbound connections from terminal apps but allowing browsers.

## Diagnostic Test

Run this test to see what's different:

\`\`\`bash
# Test 1: Check which network interface browser is using
# Open your browser, visit http://192.168.50.30:11434/api/tags
# Then immediately run:
lsof -i TCP:11434 | grep ESTABLISHED

# Test 2: Try telnet to see if port is reachable
nc -zv 192.168.50.30 11434

# Test 3: Try from a different terminal
# If using iTerm2, try from Terminal.app or vice versa

# Test 4: Bypass application firewall temporarily (requires sudo)
# sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off
# curl http://192.168.50.30:11434/api/tags
# sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on

# Test 5: Check if VPN or network filtering software is running
ps aux | grep -i "vpn\|filter\|little.*snitch\|lulu"
\`\`\`

## Browser Check

Please check in your browser:
1. Open DevTools (Cmd+Option+I)
2. Go to Network tab
3. Visit http://192.168.50.30:11434/api/tags
4. Look at the request details:
   - Is it really going to 192.168.50.30?
   - Check the "Remote Address" field
   - Any redirects or proxies shown?

## Workaround for MarkItUp

Since the browser can access it, we could modify MarkItUp to make the Ollama connection from the **frontend** instead of the **backend proxy**.

This would change:
```
Browser → Next.js Server → Ollama (FAILS)
```

To:
```
Browser → Ollama directly (WORKS)
```

But this would require Ollama to have CORS headers configured.

Would you like me to:
1. Help debug why terminal apps are blocked?
2. Modify MarkItUp to connect from frontend instead of backend?
3. Set up a local Ollama instance instead?
