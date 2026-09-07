# Antigravity Browser Bridge 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Chrome Manifest V3](https://img.shields.io/badge/Chrome-Manifest%20V3-emerald.svg)](manifest.json)
[![Node.js](https://img.shields.io/badge/Node.js-Zero--Dependencies-success.svg)](package.json)
[![Protocol](https://img.shields.io/badge/Protocol-Chrome%20DevTools%20(CDP)-orange.svg)](https://chromedevtools.github.io/devtools-protocol/)

> **Next-Generation Visual AI Browser Controller for Antigravity IDE, Claude Code, and Local AI Agents.**  
> Control your everyday Google Chrome browser directly using **Native Chrome DevTools Protocol (CDP)**, **Set-of-Mark (SoM) Tagging**, **In-Page AI Omnibar**, and an **Animated Visual Laser Cursor**. Zero headless sandboxes, zero credential exposure, and zero monthly subscription fees.

[🇮🇩 Baca Dokumentasi Bahasa Indonesia](README.id.md) | [📖 Complete Documentation Hub](docs/INSTALLATION.md)

---

## ⚡ Why Antigravity Browser Bridge?

Giving an AI agent access to a web browser usually forces a painful compromise: either pay **$200/month for cloud-hosted VMs** (like OpenAI Operator) while handing over your sensitive login credentials to third-party servers, or use **fragile headless scripts** (like Puppeteer/Playwright) that get blocked by Cloudflare and Google anti-bot systems.

**Antigravity Browser Bridge eliminates this trade-off.** It connects your local AI agent directly to your active, logged-in Google Chrome profile via a zero-dependency local bridge server and native Chrome DevTools Protocol.

### 📊 Comprehensive Comparison Matrix

| Feature / Dimension | 🚀 Antigravity Browser Bridge | 🌐 ChatGPT Plus Browsing | ☁️ OpenAI Operator / Cloud VMs | 💻 ChatGPT Desktop App | 🎭 Puppeteer / Playwright |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Execution Host** | **100% Localhost** (`127.0.0.1`) | Remote cloud server | Cloud Virtual Machine | Local macOS/Windows | Local / Cloud server |
| **Active Session Re-use** | **Instant** (Uses your logged-in Chrome) | ❌ None (No sessions) | ⚠️ Requires typing passwords in cloud VM | ⚠️ Limited to active window | ❌ Requires fresh login or cookie import |
| **Visual Grounding** | **Set-of-Mark (SoM) Badges** | ❌ None | ⚠️ Vision-only pixel guessing (10–20px misclicks) | Accessibility tree | CSS / XPath only |
| **Input Event Type** | **True Native CDP** (`isTrusted: true`) | ❌ Read-only (No actions) | Remote VM synthetic events | OS Accessibility API | Synthetic JS / CDP |
| **Anti-Bot / 2FA Handling** | **🤝 Stealth Human Handshake** (Chime + Auto-Resume) | ❌ Blocked by Cloudflare | Frequently flagged / blocked | N/A | High bot detection rate |
| **In-Page Command Bar** | **💬 Floating Omnibar (`Cmd+Shift+K`)** | ❌ None | ❌ None | ❌ None | ❌ None |
| **Workflow Learning** | **⏺️ CDP Macro Recorder** | ❌ None | ❌ None | ❌ None | Code recording only |
| **Safety Guardrails** | **🚨 Hover & Confirm Red Alert** | ❌ None | ❌ None | ❌ None | ❌ None |
| **Data & Credential Privacy**| **Zero Cloud Leakage** (Local socket) | Data sent to OpenAI | Credentials exposed to cloud VM | Screenshots sent to cloud | Local (Code only) |
| **Cost & Rate Limits** | **100% Free & Unlimited** (MIT) | $20/month + rate limits | $200/month Pro tier + strict caps | $20/month subscription | Free (Tool only) |
| **AI Framework Freedom** | **Universal** (Antigravity, Claude, Python) | ChatGPT UI only | OpenAI ecosystem only | ChatGPT UI only | Any programming language |

---

## 🌟 5 Advanced Superpowers

1. **🏷️ Set-of-Mark (SoM) Interactive Tagging:**
   - Injects glowing numbered badges (`[1]`, `[2]`, `[3]`) directly over viewport elements.
   - Eliminates vision model coordinate jitter and misclicks; click deterministically with `browser.clickBadge(4)`.
   - [Read the SoM Guide &rarr;](docs/FEATURES.md#1-set-of-mark-som-interactive-tagging)

2. **🤝 Stealth Human Handshake (Anti-Bot & 2FA Co-Pilot):**
   - Automatically detects Cloudflare Turnstiles, reCAPTCHAs, and 2FA challenges.
   - Pauses execution, sounds a soft synthesized audio chime, turns the laser cursor amber, and auto-resumes the moment you complete the challenge.
   - [Read the Handshake Guide &rarr;](docs/FEATURES.md#2-stealth-human-handshake-2fa--anti-bot-co-pilot)

3. **💬 In-Page Floating AI Omnibar (`Cmd+Shift+K`):**
   - Press `Cmd+Shift+K` (Mac) or `Ctrl+Shift+K` (Win/Linux) on any active tab to summon a glassmorphic command HUD.
   - Prompt your local AI directly without opening a screen-squishing sidebar.
   - [Read the Omnibar Guide &rarr;](docs/FEATURES.md#3-in-page-floating-ai-omnibar-cmdshiftk)

4. **⏺️ One-Click CDP Macro Recorder ("Demonstrate & Automate"):**
   - Record your manual clicks, navigations, and keystrokes in Chrome.
   - Exports clean, parameterized Node.js automation recipes.
   - [Read the Macro Recorder Guide &rarr;](docs/FEATURES.md#4-one-click-cdp-macro-recorder-demonstrate--automate)

5. **🚨 Financial & Safety Guardrails ("Hover & Confirm"):**
   - Automatically intercepts high-risk clicks (`Delete`, `Pay`, `Transfer`, high budget inputs).
   - Holds the laser cursor in a pulsing red alert state pending explicit human approval (`Spacebar` or click).
   - [Read the Guardrails Guide &rarr;](docs/FEATURES.md#5-financial--safety-guardrails-hover--confirm)

---

## 📚 Documentation Hub

- 🛠️ **[Installation & Setup Guide](docs/INSTALLATION.md)** — Step-by-step for macOS, Windows, and Linux.
- 🚀 **[Advanced Features Walkthrough](docs/FEATURES.md)** — Deep dive into SoM, Handshake, Omnibar, and Guardrails.
- 🔌 **[Agent Integrations](docs/INTEGRATIONS.md)** — Ready-to-use recipes for Antigravity IDE, Claude Code, Python, and REST.
- 🔧 **[Troubleshooting & FAQ](docs/TROUBLESHOOTING.md)** — Resolving port conflicts, debugger notices, and extension states.

---

## 🚀 60-Second Quickstart

### Step 1: Start the Bridge Server
```bash
# Clone the repository
git clone https://github.com/rririanto/antigravity-browser-bridge.git
cd antigravity-browser-bridge

# On macOS / Linux:
./start-bridge.sh

# On Windows:
start-bridge.bat

# Or run directly via npm:
npm start
```

### Step 2: Load the Extension into Google Chrome
1. Open Chrome and navigate to `chrome://extensions`.
2. Enable **Developer mode** (top-right toggle).
3. Click **Load unpacked** (top-left button).
4. Select the `antigravity-browser-bridge` folder.
5. The extension will activate with a green **ON** badge!

### Step 3: Test Connection
```bash
npm run status
```

---

## 💻 Code Example

```javascript
const browser = require("./bridge/client.js");

async function run() {
  // 1. Focus active Google Ads tab
  await browser.focusTab({ urlContains: "ads.google.com" });

  // 2. Tag elements with Set-of-Mark
  const catalog = await browser.tagElements();
  console.log(`Tagged ${catalog.taggedCount} buttons!`);

  // 3. Click Badge #1 with visual laser glide
  await browser.clickBadge(1, "Clicking Primary Action");

  // 4. Clear badges
  await browser.clearTags();
}

run();
```

---

## 🧪 Automated Testing

```bash
npm test
```
Runs the sanitization audit, bridge lifecycle tests, and advanced feature seam validations.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE) &copy; 2026 Rahmat Ramadhan Irianto.
