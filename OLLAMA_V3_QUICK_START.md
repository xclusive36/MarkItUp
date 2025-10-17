# Ollama Enhanced Integration v3.0 - Quick Start Guide

## 🚀 What's New in v3.0?

Three game-changing features that complete the Ollama experience:

1. **🌊 Real-Time Streaming** - Watch AI responses appear as they're generated
2. **💾 Server Presets** - Save and switch between multiple Ollama servers instantly
3. **🔍 Smart Error Messages** - Get actionable troubleshooting hints

---

## ⚡ Quick Start

### 1. Enable Streaming (Already On!)

Streaming is enabled by default. Just send a message and watch it stream!

**To toggle:**
1. Open AI Chat → Click ⚙️ Settings
2. Select "Ollama (Local)" provider
3. Find "🌊 Enable Streaming" toggle
4. Switch ON/OFF as preferred

**What you'll see:**
```
You: Explain machine learning

AI: 🔄 Machine learning is a branch of
     artificial intelligence that enables
     computers to learn from data... ▌
```

---

### 2. Save Your First Server Preset

**Steps:**
1. Open AI Chat → Click ⚙️ Settings
2. Select "Ollama (Local)" provider
3. Enter server URL (e.g., `http://localhost:11434`)
4. Click **💾 Save** button next to the URL
5. Enter a name (e.g., "Local Mac")
6. Preset appears as a pill button above the URL field

**Switch servers:**
- Click any preset pill to instantly switch
- Active preset is highlighted in blue
- Server URL updates automatically

**Example setup:**
```
[Local] [Work] [GPU Server] ← Click to switch

Server URL: http://localhost:11434
```

---

### 3. Test Your Connection

**Steps:**
1. Open AI Chat → Click ⚙️ Settings
2. Select "Ollama (Local)" provider
3. Click **🔌 Test** button next to URL
4. Read connection status below

**Success looks like:**
```
✓ Connected (v0.1.47)! Found 5 models
```

**Failure shows hints:**
```
✗ ECONNREFUSED → Make sure Ollama is running: `ollama serve`
```

---

## 📋 Common Tasks

### Start Ollama Server

**Mac/Linux:**
```bash
ollama serve
```

**Check if running:**
```bash
ps aux | grep ollama
# or
curl http://localhost:11434/api/tags
```

**Using systemd:**
```bash
sudo systemctl start ollama
sudo systemctl enable ollama  # Auto-start on boot
```

---

### Pull a Model

**From Terminal:**
```bash
ollama pull llama3.2
ollama pull mistral
ollama pull codellama
```

**From MarkItUp UI:**
1. Go to AI Settings → Ollama
2. Find "📥 Download New Model" section
3. Enter model name (e.g., `llama3.2`)
4. Click **Pull** button
5. Watch progress percentage
6. Models refresh automatically when done

---

### Configure Remote Server

**Scenario:** You have Ollama running on a different machine

**Steps:**
1. Find remote machine's IP/hostname
2. In MarkItUp AI Settings:
   - Enter: `http://192.168.1.100:11434`
   - Click **🔌 Test** to verify
   - Click **💾 Save** with name "GPU Server"
3. Done! Switch anytime by clicking the preset

**Firewall Note:**
Ensure port 11434 is open on the remote machine:
```bash
# Linux
sudo ufw allow 11434/tcp

# Mac
# System Settings → Network → Firewall → Allow incoming connections
```

---

### Disable Streaming

**Why?** You might prefer to see complete responses at once.

**Steps:**
1. AI Chat → ⚙️ Settings
2. Scroll to "🌊 Enable Streaming"
3. Toggle OFF (gray)
4. Responses now appear all at once

**Note:** Change takes effect on next message.

---

## 🔧 Troubleshooting

### Error: ECONNREFUSED

**Meaning:** Cannot connect to Ollama server

**Solutions:**
1. Check if Ollama is running:
   ```bash
   ps aux | grep ollama
   ```
2. Start Ollama:
   ```bash
   ollama serve
   ```
3. Verify port not blocked:
   ```bash
   lsof -i :11434
   ```

---

### Error: ENOTFOUND

**Meaning:** Hostname/URL cannot be resolved

**Solutions:**
1. Check URL spelling
2. Verify hostname in `/etc/hosts` or DNS
3. Try IP address instead:
   ```
   http://192.168.1.100:11434
   ```
4. Ping the hostname:
   ```bash
   ping your-hostname
   ```

---

### Error: ETIMEDOUT

**Meaning:** Network connection timed out

**Solutions:**
1. Check network connectivity
2. Verify firewall settings
3. Test from command line:
   ```bash
   curl -v http://server-ip:11434/api/tags
   ```
4. Check Ollama server logs:
   ```bash
   journalctl -u ollama -f
   ```

---

### Streaming Stopped Mid-Response

**Possible causes:**
- Network interruption
- Ollama server crashed
- Browser memory issue

**What to do:**
1. Check connection status
2. Try disabling streaming temporarily
3. Restart Ollama server if needed
4. Reduce model context size

---

### No Models Found

**After connection succeeds:**

**Solutions:**
1. Pull a model:
   ```bash
   ollama pull llama3.2
   ```
2. Refresh models list:
   - Click **🔌 Test** button again
   - Or restart MarkItUp
3. Verify models exist:
   ```bash
   ollama list
   ```

---

## 💡 Pro Tips

### Tip 1: Keyboard Shortcuts

- **Send message:** `Enter`
- **New line:** `Shift + Enter`
- **Quick settings:** Click ⚙️ icon
- **Close chat:** Click X or `Escape`

---

### Tip 2: Preset Organization

Name presets descriptively:
- ✅ "Local Mac", "Work GPU", "Home Server"
- ❌ "Server1", "Test", "Ollama"

This makes switching quick and intuitive!

---

### Tip 3: Monitor Streaming

Watch the animated cursor (▌) to know when streaming is active.

If it stops blinking, the response is complete.

---

### Tip 4: Test Before Using

Always **🔌 Test** connection after:
- Changing server URL
- Switching presets
- Restarting Ollama
- Network changes

---

### Tip 5: Save Frequently Used Servers

Create presets for all your Ollama installations:
- Local development machine
- Remote GPU server
- Work computer
- Home lab NAS
- Cloud instance

Switch instantly without remembering URLs!

---

## 📊 Feature Comparison

| Feature | v2.0 | v3.0 |
|---------|------|------|
| **Streaming Display** | ❌ | ✅ Real-time |
| **Server Presets** | ❌ | ✅ Save & Switch |
| **Error Hints** | Basic | ✅ Actionable |
| **Connection Test** | ✅ | ✅ Enhanced |
| **Model Download** | ✅ | ✅ Same |
| **Advanced Options** | ✅ | ✅ Same |

---

## 🎯 Next Steps

1. **Try streaming** - Send a long message and watch it flow
2. **Save presets** - Add all your Ollama servers
3. **Test connection** - Verify everything works
4. **Enjoy!** - Experience the best local AI integration

---

## 📚 More Documentation

- [Complete v3.0 Documentation](OLLAMA_V3_COMPLETE.md) - Comprehensive guide
- [Changelog](OLLAMA_V3_CHANGELOG.md) - All technical changes
- [v2.0 Docs](OLLAMA_ENHANCED_V2_COMPLETE.md) - Previous version reference

---

## 🆘 Need Help?

- 💬 [GitHub Discussions](https://github.com/xclusive36/MarkItUp/discussions)
- 🐛 [Report Issues](https://github.com/xclusive36/MarkItUp/issues)
- 📧 Contact maintainers

---

**Happy Streaming! 🎉**

v3.0 - Making local AI feel magical ✨
