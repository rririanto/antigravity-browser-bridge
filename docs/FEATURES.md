# Advanced Killer Features Guide 🚀

The **Antigravity Browser Bridge** introduces five game-changing architectural capabilities engineered to outcompete and leapfrog cloud-based AI browser tools like OpenAI Operator and standard ChatGPT browser extensions.

---

## 1. 🏷️ Set-of-Mark (SoM) Interactive Tagging

### The Problem with Vision-Only AI Agents
Cloud agents like OpenAI Operator take raw screenshots and use visual vision models to guess $(x, y)$ coordinate pixels. On high-DPI displays or dense enterprise user interfaces (e.g. Google Ads tables, Salesforce, AWS Console), this frequently causes **10–20px misclicks**, misses tiny toggle switches, and wastes thousands of image tokens per step.

### How Antigravity Solves It
With Set-of-Mark Tagging, the extension scans the active viewport for interactive elements and renders non-destructive, glowing numeric pill badges (`[1]`, `[2]`, `[3]`, etc.) directly over the elements.

```javascript
const browser = require("./bridge/client.js");

// 1. Tag all interactive elements in the viewport
const catalog = await browser.tagElements();
console.log(`Tagged ${catalog.taggedCount} elements!`);

// 2. Click element [4] deterministically
await browser.clickBadge(4, "Clicking Save Button");

// 3. Clear badges when finished
await browser.clearTags();
```

- **100% Deterministic Precision**: No pixel guessing, no misclicks.
- **80% Token Reduction**: Pass concise numeric lists to the LLM instead of multi-megabyte screenshots.
- **Works on Textless Icons**: Accurately targets gear icons, edit pencils, and trash cans with no visible text.

---

## 2. 🤝 Stealth Human Handshake (2FA & Anti-Bot Co-Pilot)

### The Cloud Agent Failure Mode
When cloud-hosted agents (OpenAI Operator) encounter a Cloudflare Turnstile challenge, Google reCAPTCHA, or SMS/Authenticator 2FA prompt, they hit an immediate brick wall. Datacenter IP addresses are permanently flagged by anti-bot engines.

### How Antigravity Solves It
Because Antigravity runs inside **your real, residential Google Chrome browser**, it treats human verification as a cooperative handoff:
1. When a CAPTCHA or 2FA challenge is detected in the DOM, execution **automatically pauses**.
2. The visual laser cursor docks at the top of the screen, turns pulsing amber, and displays:  
   `⚠️ Human Verification Required: Solve 2FA / CAPTCHA`
3. A gentle synthesized audio chime plays on your local speakers.
4. The user completes the 2FA or click challenge in 2 seconds.
5. The bridge detects the resolution and **automatically resumes** the automated workflow.

```javascript
// Query if active tab has an anti-bot or 2FA prompt
const status = await browser.detectChallenge();
if (status.challenged) {
  console.log("Anti-bot challenge detected:", status.type);
}
```

---

## 3. 💬 In-Page Floating AI Omnibar (`Cmd+Shift+K`)

Forget awkward sidebars that take up 30% of your screen width and squish modern responsive web apps.

Press **`Cmd+Shift+K`** (macOS) or **`Ctrl+Shift+K`** (Windows/Linux) on any webpage to summon the glassmorphic in-page Omnibar directly in your active viewport.

- Type natural language commands: *"Export this table to CSV"* or *"Change daily budget to $50"*.
- Built-in quick action chips: `[🏷️ Tag Viewport]`, `[⚡ Clear Badges]`, `[📸 Screenshot]`.
- Watch the neon laser cursor execute your prompt across the live webpage without ever leaving the screen.

---

## 4. ⏺️ One-Click CDP Macro Recorder ("Demonstrate & Automate")

Neither ChatGPT nor Operator can learn from your manual demonstrations. 

With the Antigravity CDP Macro Recorder:
1. Open the extension popup and click **"⏺️ Start Macro Recorder"**.
2. Perform your routine task manually in Chrome (e.g., navigating to Google Ads, applying date filters, downloading an invoice).
3. The bridge intercepts raw DevTools Protocol events and records clean selectors, coordinates, and typing actions.
4. Click **"⏹️ Stop Recording"** to export an executable, reusable Node.js automation recipe.

```javascript
// Programmatic Macro Recording
await browser.startRecording();

// ... perform manual or automated actions ...

const recipe = await browser.stopRecording();
console.log("Captured steps:", recipe.steps);
```

---

## 5. 🚨 Financial & Safety Guardrails ("Hover & Confirm")

AI hallucinations on production platforms can cost thousands of dollars (e.g. accidentally deleting an ad campaign or entering an extra zero in a budget).

Antigravity includes a client-side safety guardrail engine:
- If a target element contains high-risk terms (`Delete`, `Remove`, `Pay`, `Confirm Order`, `Transfer`), or budget values exceed predefined thresholds:
  - The laser cursor glides to the element, pulses glowing red, and holds in a stationary hover state.
  - An alert badge displays: `🚨 HIGH-STAKES ACTION: Press Space to Approve or Esc to Cancel`.
  - The click event is held until the human observer explicitly approves.

```javascript
// Safe click with guardrail check
await browser.click({
  text: "Delete Campaign",
  actionLabel: "Deleting test campaign"
}); // Holds for human confirmation unless force: true is provided
```
