// Antigravity Browser Controller Client Library
// High-level API for Antigravity IDE (Gemini) to control Google Chrome directly

const http = require("http");

const BRIDGE_BASE_URL = process.env.BRIDGE_URL || (process.env.BRIDGE_PORT ? `http://127.0.0.1:${process.env.BRIDGE_PORT}` : "http://127.0.0.1:8765");

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BRIDGE_BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        "Content-Type": "application/json"
      }
    };

    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", chunk => data += chunk);
      res.on("end", () => {
        try {
          const json = JSON.parse(data);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject(new Error(json.error || `HTTP ${res.statusCode}: ${data}`));
          }
        } catch (e) {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(data);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${data}`));
          }
        }
      });
    });

    req.on("error", (err) => {
      reject(new Error(`Could not connect to Antigravity Bridge at ${BRIDGE_BASE_URL}. Is bridge/server.js running? Details: ${err.message}`));
    });

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

const browser = {
  // Check if bridge server is running and extension is connected
  async getStatus() {
    return await request("GET", "/status");
  },

  // List all open tabs in Chrome
  async getTabs() {
    return await request("GET", "/tabs");
  },

  // Focus a specific tab by ID or partial URL / Title
  async focusTab(query = {}) {
    if (typeof query === "number") query = { tabId: query };
    if (typeof query === "string") {
      query = query.startsWith("http") ? { urlContains: query } : { titleContains: query };
    }
    return await request("POST", "/tab/focus", query);
  },

  // Navigate active or specified tab to URL
  async navigate(url, tabId = undefined) {
    return await request("POST", "/navigate", { url, tabId });
  },

  // Visual Click with laser cursor animation and native CDP event
  // Accepts: { x, y, text, selector, aria, actionLabel, tabId }
  async click(options = {}) {
    return await request("POST", "/click", options);
  },

  // Native CDP Keyboard typing
  // Accepts: { text, tabId }
  async type(text, tabId = undefined) {
    const payload = typeof text === "string" ? { text, tabId } : text;
    return await request("POST", "/type", payload);
  },

  // Extract semantic DOM (interactive elements: buttons, links, inputs, tables)
  async getDOM(tabId = undefined) {
    return await request("POST", "/dom", { tabId });
  },

  // Capture full tab screenshot as base64 PNG
  async screenshot(options = {}) {
    return await request("POST", "/screenshot", options);
  },

  // Evaluate arbitrary JavaScript inside the tab
  async evaluate(code, tabId = undefined) {
    const payload = typeof code === "string" ? { code, tabId } : code;
    const res = await request("POST", "/eval", payload);
    return res.result;
  }
};

module.exports = browser;
