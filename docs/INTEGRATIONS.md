# AI Agent & Language Integrations Guide 🔌

The **Antigravity Browser Bridge** is agent-agnostic. Any local AI stack or programming language can control your active Chrome browser via simple HTTP requests or WebSocket messages.

---

## 1. Antigravity IDE (Gemini) Integration

In Antigravity IDE, you can directly import the client library inside your workspace scripts or agent routines:

```javascript
const browser = require("./bridge/client.js");

async function run() {
  // Focus Google Ads
  await browser.focusTab({ urlContains: "ads.google.com" });

  // Tag elements in viewport
  const tags = await browser.tagElements();

  // Find badge for 'Keywords'
  const kwBadge = tags.elements.find(e => e.text.includes("Keywords"));
  if (kwBadge) {
    await browser.clickBadge(kwBadge.badgeId, "Opening Keywords tab");
  }
}

run();
```

---

## 2. Claude Code Integration

When using **Claude Code** in your terminal, add the bridge commands to your custom instructions or run them via Node.js tool calls:

```bash
# In your terminal while Claude Code is running:
node -e '
  const b = require("./bridge/client.js");
  b.focusTab({ titleContains: "Google Ads" })
   .then(() => b.screenshot())
   .then(s => require("fs").writeFileSync("screen.png", Buffer.from(s.screenshot, "base64")));
'
```

---

## 3. Python Integration

You don't need Node.js to command the bridge—use standard `requests` in Python:

```python
import requests

BRIDGE_URL = "http://127.0.0.1:8765"

# 1. List tabs
tabs = requests.get(f"{BRIDGE_URL}/tabs").json()
print("Open Tabs:", [t["title"] for t in tabs])

# 2. Focus specific tab
requests.post(f"{BRIDGE_URL}/tab/focus", json={"urlContains": "google.com"})

# 3. Tag elements with Set-of-Mark
tags = requests.post(f"{BRIDGE_URL}/tags/create").json()
print(f"Tagged {tags.get('taggedCount')} elements!")

# 4. Click Badge #1
requests.post(f"{BRIDGE_URL}/click/badge", json={
    "badgeId": 1,
    "actionLabel": "Clicking First Element via Python"
})
```

---

## 4. REST API / cURL Reference

| Endpoint | Method | Payload Example | Description |
| :--- | :--- | :--- | :--- |
| `/status` | `GET` | None | Check bridge health and extension connection |
| `/tabs` | `GET` | None | List all open browser tabs |
| `/tab/focus` | `POST` | `{"urlContains": "ads"}` | Switch and focus matching tab |
| `/navigate` | `POST` | `{"url": "https://..."}` | Navigate active tab to URL |
| `/tags/create` | `POST` | None | Injects Set-of-Mark numeric tags |
| `/tags/clear` | `POST` | None | Removes numeric tags |
| `/click/badge` | `POST` | `{"badgeId": 2, "actionLabel": "Save"}` | Visual laser click on badge number |
| `/click` | `POST` | `{"x": 200, "y": 400, "label": "Save"}` | Visual laser click on coordinates |
| `/type` | `POST` | `{"text": "Hello World"}` | Dispatches native CDP keystrokes |
| `/dom` | `POST` | None | Extracts structured interactive elements |
| `/screenshot` | `POST` | `{"format": "png"}` | Captures tab as base64 string |
| `/handshake/detect`| `POST` | None | Detects Cloudflare/reCAPTCHA/2FA |
| `/omnibar/toggle` | `POST` | None | Toggles in-page floating Omnibar |
| `/record/start` | `POST` | None | Starts CDP Macro Recorder |
| `/record/stop` | `POST` | None | Stops recorder and returns steps |
| `/record/recipe` | `GET` | None | Retrieves recorded recipe |
