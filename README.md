# Antigravity Browser Bridge 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Chrome Manifest V3](https://img.shields.io/badge/Chrome-Manifest%20V3-emerald.svg)](manifest.json)
[![Node.js](https://img.shields.io/badge/Node.js-Zero--Dependencies-success.svg)](package.json)
[![Protocol](https://img.shields.io/badge/Protocol-Chrome%20DevTools%20(CDP)-orange.svg)](https://chromedevtools.github.io/devtools-protocol/)

> **Next-Generation Visual AI Browser Controller for Antigravity IDE, Claude Code, and Local AI Agents.**  
> Control your everyday Google Chrome browser directly using **Native Chrome DevTools Protocol (CDP)** and an **Animated Visual Laser Cursor**. Zero headless sandboxes, zero credential exposure, and zero monthly subscription fees.

[🇮🇩 Baca Dokumentasi Bahasa Indonesia](README.id.md)

---

## ⚡ Why Antigravity Browser Bridge?

Giving an AI agent access to a web browser usually forces a painful compromise: either pay **$200/month for cloud-hosted VMs** (like OpenAI Operator) while handing over your sensitive login credentials to third-party servers, or use **fragile headless scripts** (like Puppeteer/Playwright) that get blocked by Cloudflare and Google anti-bot systems.

**Antigravity Browser Bridge eliminates this trade-off.** It connects your local AI agent directly to your active, logged-in Google Chrome profile via a zero-dependency local bridge server and native Chrome DevTools Protocol.

### 📊 Comprehensive Comparison Matrix

| Feature / Dimension | 🚀 Antigravity Browser Bridge | 🌐 ChatGPT Plus Browsing | ☁️ OpenAI Operator / Cloud VMs | 💻 ChatGPT Desktop App | 🎭 Puppeteer / Playwright |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Execution Host** | **100% Localhost** (`127.0.0.1`) | Remote cloud server | Cloud Virtual Machine | Local macOS/Windows | Local / Cloud server |
| **Active Session Re-use** | **Instant** (Uses your logged-in Chrome) | ❌ None (No sessions) | ⚠️ Requires typing passwords in cloud VM | ⚠️ Limited to active window | ❌ Requires fresh login or cookie import |
| **Input Event Type** | **True Native CDP** (`isTrusted: true`) | ❌ Read-only (No actions) | Remote VM synthetic events | OS Accessibility API | Synthetic JS / CDP |
| **Visual Human Audit** | **Animated Laser Cursor & Badges** | ❌ None | Remote video stream | ❌ None | Headless (Blind by default) |
| **Anti-Bot / 2FA Handling** | **Seamless** (Human can solve 2FA anytime) | ❌ Blocked by Cloudflare | Frequently flagged / blocked | N/A | High bot detection rate |
| **Data & Credential Privacy** | **Zero Cloud Leakage** (Local socket) | Data sent to OpenAI | Credentials exposed to cloud VM | Screenshots sent to cloud | Local (Code only) |
| **Cost & Rate Limits** | **100% Free & Unlimited** (MIT) | $20/month + rate limits | $200/month Pro tier + strict caps | $20/month subscription | Free (Tool only) |
| **AI Framework Freedom** | **Universal** (Antigravity, Claude, Python) | ChatGPT UI only | OpenAI ecosystem only | ChatGPT UI only | Any programming language |

---

## 🌟 Key Features

1. **Visual Laser Cursor & Action Badges:**
   - Smooth animated neon laser cursor glides to target coordinates before clicking.
   - Expanding ripple wave animation visually confirms click locations.
   - Floating action badges show real-time agent intentions (*"Clicking Save"*, *"Updating budget"*).
2. **True Native CDP (`chrome.debugger`):**
   - Emits hardware-level input events via `Input.dispatchMouseEvent` and `Input.dispatchKeyEvent`.
   - All interactions carry `isTrusted: true`, preventing clicks from being dropped by complex SPAs (React, Angular, Google Ads).
3. **Works Directly in Your Daily Chrome Profile:**
   - Controls your existing tabs without incognito windows or re-authenticating with Google Ads, Analytics, AWS, or Gmail.
4. **Zero-Dependency Local Bridge:**
   - Pure Node.js HTTP & RFC 6455 WebSocket gateway running on `http://127.0.0.1:8765`. No bloated `npm install` needed.
5. **100% Local Privacy:**
   - DOM trees, tab queries, and screenshots stay strictly on your local machine.

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│             Your AI Agent Stack                             │
│   (Antigravity IDE / Gemini, Claude Code, Custom Script)    │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / WebSocket REST calls
                               ▼
┌─────────────────────────────────────────────────────────────┐
│          Local Bridge Server (`bridge/server.js`)           │
│             http://127.0.0.1:8765 (Zero-Dependencies)       │
└──────────────────────────────┬──────────────────────────────┘
                               │ WebSocket (RFC 6455)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│         Chrome Extension (Manifest V3 Service Worker)       │
│        - Injects Visual Laser Cursor (content.js)           │
│        - Executes Native CDP Input Commands (debugger API)  │
└──────────────────────────────┬──────────────────────────────┘
                               │ Trusted Hardware-Level Events
                               ▼
┌─────────────────────────────────────────────────────────────┐
│            Active Google Chrome Browser Tab                 │
│      (Google Ads, Meta Ads, Custom Dashboards, etc.)        │
└─────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quickstart (Under 60 Seconds)

### Step 1: Start the Local Bridge Server
```bash
# Clone the repository
git clone https://github.com/rririanto/antigravity-browser-bridge.git
cd antigravity-browser-bridge

# Start the zero-dependency bridge server
npm start
# Or run: node bridge/server.js
```
*The server will start listening on `http://127.0.0.1:8765`.*

---

### Step 2: Load the Extension into Google Chrome
1. Open **Google Chrome** and navigate to `chrome://extensions`.
2. Enable **Developer mode** using the toggle switch in the top-right corner.
3. Click **Load unpacked** in the top-left corner.
4. Select the `antigravity-browser-bridge` repository folder.
5. The **Antigravity Browser Bridge** icon will appear on your Chrome toolbar with a green **ON** badge.

---

### Step 3: Test the Connection
Run the connection verification script:
```bash
npm run status
# Or run: node bridge/test-connection.js
```
You will see all your currently open Chrome tabs listed directly in the terminal!

---

## 💻 Code Examples

### JavaScript / Node.js
```javascript
const browser = require("./bridge/client.js");

async function main() {
  // 1. Focus your open Google Ads tab
  await browser.focusTab({ urlContains: "ads.google.com" });

  // 2. Click a button with visual laser cursor feedback
  await browser.click({
    text: "Save",
    actionLabel: "Saving campaign changes"
  });

  // 3. Type text via native DevTools keyboard events
  await browser.type("50000");

  // 4. Extract structured semantic DOM elements
  const dom = await browser.getDOM();
  console.log("Found interactive elements:", dom.elements);

  // 5. Capture a full tab screenshot
  const shot = await browser.screenshot();
}

main();
```

### Direct HTTP REST API (Any Language / `curl`)
```bash
# Focus tab
curl -X POST http://127.0.0.1:8765/tab/focus \
  -H "Content-Type: application/json" \
  -d '{"urlContains": "google"}'

# Visual Click
curl -X POST http://127.0.0.1:8765/click \
  -H "Content-Type: application/json" \
  -d '{"text": "Search", "actionLabel": "Executing Search"}'

# Native Key Typing
curl -X POST http://127.0.0.1:8765/type \
  -H "Content-Type: application/json" \
  -d '{"text": "Artificial Intelligence"}'
```

---

## 📁 Repository Structure

```
antigravity-browser-bridge/
├── manifest.json              # Chrome Manifest V3 configuration
├── background.js              # Service worker (WebSocket client + CDP controller)
├── content.js                 # Laser cursor overlay + coordinate resolver
├── content.css                # Styling for neon laser cursor, ripple, and badges
├── popup.html                 # Extension popup interface
├── popup.js                   # Popup connection status indicator
├── icons/                     # Extension icons (16, 48, 128)
├── start-bridge.sh            # One-click startup shell script
├── package.json               # Package metadata and test scripts
├── LICENSE                    # MIT License
├── bridge/
│   ├── server.js              # Zero-dependency local HTTP/WebSocket bridge
│   ├── client.js              # High-level client library for AI agents
│   ├── test-connection.js     # Connection and tab discovery diagnostic
│   ├── demo.js                # Quick interactive demonstration
│   └── run-live-demo.js       # Live visual browser execution demo
├── test/
│   ├── sanitize-check.test.js # Security and path sanitization test
│   └── bridge-api.test.js     # Automated bridge lifecycle test
├── README.md                  # English Documentation
└── README.id.md               # Dokumentasi Bahasa Indonesia
```

---

## 🔒 Security & Privacy

- **No Remote Telemetry:** The bridge server binds exclusively to `127.0.0.1`. No external network requests are made.
- **Permission Transparency:**
  - `debugger`: Required by `chrome.debugger` to dispatch native CDP input events (`Input.dispatchMouseEvent`, `Input.dispatchKeyEvent`).
  - `tabs` & `activeTab`: Required to focus, switch, and query open tabs.
  - `<all_urls>`: Required to inject the visual laser cursor overlay on any tab you automate.

---

## 🧪 Automated Testing

Run the test suite to verify code sanitization and API health:
```bash
npm test
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) &copy; 2026 Rahmat Ramadhan Irianto.
