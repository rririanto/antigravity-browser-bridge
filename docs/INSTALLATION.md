# Complete Installation & Setup Guide 🛠️

This guide walks you through setting up **Antigravity Browser Bridge** on macOS, Windows, and Linux.

---

## 📋 Prerequisites

- **Google Chrome** (or Chromium-based browser like Brave, Edge, Arc).
- **Node.js 16.0+** installed on your system. Run `node -v` in your terminal to verify.

---

## ⚡ 3-Minute Quickstart

```
┌─────────────────┐       ┌─────────────────┐       ┌─────────────────┐
│  1. Start Local │       │  2. Load Chrome │       │  3. Verify Tab  │
│  Bridge Server  │ ────> │    Extension    │ ────> │   Connection    │
│  (Port 8765)    │       │ (chrome://ext)  │       │ (npm run status)│
└─────────────────┘       └─────────────────┘       └─────────────────┘
```

---

### Step 1: Clone the Repository & Start Bridge

#### On macOS / Linux:
```bash
git clone https://github.com/rririanto/antigravity-browser-bridge.git
cd antigravity-browser-bridge

# Start the zero-dependency bridge server
./start-bridge.sh
# Or run: npm start
```

#### On Windows (Command Prompt / PowerShell):
```cmd
git clone https://github.com/rririanto/antigravity-browser-bridge.git
cd antigravity-browser-bridge

:: Double click or run the Windows batch launcher
start-bridge.bat
:: Or run: npm start
```

*The server will start listening on `http://127.0.0.1:8765`.*

---

### Step 2: Load Extension into Google Chrome

1. Open **Google Chrome**.
2. In the address bar, navigate to:
   ```
   chrome://extensions
   ```
3. In the top-right corner, toggle **Developer mode** to **ON**.
4. In the top-left corner, click the **Load unpacked** button.
5. In the file picker dialog, select the `antigravity-browser-bridge` root repository folder.
6. The extension is now loaded! You will see the **Antigravity Browser Bridge** icon in your Chrome extensions bar with an emerald green **ON** badge.

---

### Step 3: Verify the Connection

In your terminal, run the diagnostic test:
```bash
npm run status
# Or run: node bridge/test-connection.js
```

**Expected Output:**
```
✓ Bridge Server is running on port 8765
✓ Chrome Extension is CONNECTED! 🟢

📑 Fetching open Chrome tabs...
Found 3 open tab(s):
  [1] Google Ads - Campaigns ⭐ [Active]
  [2] Google Analytics 4
  [3] GitHub

🎉 Everything is ready! Antigravity can now control your Chrome browser!
```

---

## ❓ What to Expect: Chrome "Debugging" Warning Banner

When the AI begins interacting with a tab, Google Chrome will display a standard notification banner across the top of your window:

> **"Antigravity Browser Bridge started debugging this browser"**

### Why does this appear?
This is Chrome's built-in security safeguard whenever an extension uses the official `chrome.debugger` API. It confirms that the bridge is dispatching **true native DevTools Protocol events** (`isTrusted: true`) rather than fake JavaScript DOM clicks. 

You can leave the banner alone or click the **"X"** on the right side once your automated task is complete.

---

## 🔧 Advanced Configuration

### Customizing the Port
If port `8765` is already in use by another service on your machine, launch the bridge with the `BRIDGE_PORT` environment variable:

```bash
# On macOS / Linux:
BRIDGE_PORT=9000 npm start

# On Windows (PowerShell):
$env:BRIDGE_PORT="9000"; npm start
```

Your client scripts will automatically connect to the custom port when `BRIDGE_PORT=9000` is set in your environment.
