# Troubleshooting & FAQ 🔧

Common issues, security questions, and diagnostic steps for Antigravity Browser Bridge.

---

## 🔍 Diagnostic Checklist

When encountering connection issues, run through this 30-second checklist:

1. **Is the bridge server running?**
   Run `curl http://127.0.0.1:8765/status`. It should return `{"status":"ok",...}`.
2. **Is Developer mode enabled in Chrome?**
   Navigate to `chrome://extensions` and verify the toggle in the top-right corner is **ON**.
3. **Does the extension toolbar badge show `ON`?**
   - **Green `ON`**: Connected and ready.
   - **Red `ERR`**: Bridge server is down or port is blocked.
   - **Blank**: Extension service worker is reconnecting (retries automatically every 2.5s).

---

## ❓ Frequently Asked Questions

### 1. Chrome shows "Antigravity Browser Bridge started debugging this browser". Is this safe?
**Yes, 100% safe.**  
This is Google Chrome's standard security banner whenever any extension uses the official Chrome DevTools Protocol (`chrome.debugger` API). It guarantees that:
- Inputs carry genuine OS-level trust (`isTrusted: true`), allowing interactions with complex SPAs like Google Ads.
- All debugger commands are driven locally from your machine (`127.0.0.1`).
- No data is sent to external servers or third-party cloud VMs.

### 2. Error: `EADDRINUSE: address already in use :::8765`
This means another process is already using port 8765.

**Fix on macOS/Linux:**
```bash
# Find and kill the previous process
lsof -ti :8765 | xargs kill -9
```
Or start on a custom port:
```bash
BRIDGE_PORT=9000 npm start
```

**Fix on Windows:**
```cmd
netstat -ano | findstr :8765
taskkill /F /PID <PID_NUMBER>
```

### 3. Content script overlay not appearing on active tab
If the laser cursor or Set-of-Mark badges do not appear when triggered:
- **Refresh the webpage once** after first loading the unpacked extension. Chrome extensions only inject content scripts into pages opened or refreshed after installation.
- Note that Chrome restricts content script injection on internal browser URLs (`chrome://`, `chrome-extension://`, and the Chrome Web Store). Test on a regular website like `https://google.com` or your local dashboard.

### 4. How do I test the connection?
Run:
```bash
npm run status
```
This tests both HTTP and WebSocket layers and returns a live list of your open Chrome tabs.
