// Antigravity Background Service Worker: Bridge WebSocket Client & CDP Controller
const BRIDGE_WS_URL = "ws://127.0.0.1:8765";
let ws = null;
let reconnectTimer = null;
const attachedTabs = new Set();

// Connect to Local Bridge Server
function connectToBridge() {
  if (ws && (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)) {
    return;
  }

  try {
    ws = new WebSocket(BRIDGE_WS_URL);

let heartbeatTimer = null;

function startHeartbeat() {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = setInterval(() => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      sendToBridge({ type: "PING", timestamp: Date.now() });
    }
  }, 10000);
}

function stopHeartbeat() {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }
}

    ws.onopen = () => {
      console.log("[Antigravity] Connected to Bridge Server at", BRIDGE_WS_URL);
      chrome.action.setBadgeText({ text: "ON" });
      chrome.action.setBadgeBackgroundColor({ color: "#10b981" }); // Emerald green
      startHeartbeat();

      // Send initial registration
      sendToBridge({
        type: "REGISTER",
        client: "Antigravity Chrome Extension",
        version: "1.0.0",
        timestamp: Date.now()
      });
    };

    ws.onmessage = async (event) => {
      try {
        const message = JSON.parse(event.data);
        if (message.type === "PONG") return; // Heartbeat response

        const { id, command, params } = message;
        if (!command) return;

        const result = await handleCommand(command, params || {});
        sendToBridge({
          id,
          success: true,
          result
        });
      } catch (err) {
        console.error("[Antigravity] Command execution error:", err);
        try {
          const message = JSON.parse(event.data);
          sendToBridge({
            id: message.id,
            success: false,
            error: err.message || String(err)
          });
        } catch (_) {}
      }
    };

    ws.onclose = () => {
      console.log("[Antigravity] Bridge connection closed. Reconnecting in 2.5s...");
      chrome.action.setBadgeText({ text: "" });
      stopHeartbeat();
      ws = null;
      scheduleReconnect();
    };

    ws.onerror = (err) => {
      chrome.action.setBadgeText({ text: "ERR" });
      chrome.action.setBadgeBackgroundColor({ color: "#ef4444" });
      stopHeartbeat();
    };
  } catch (e) {
    scheduleReconnect();
  }
}

function scheduleReconnect() {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = setTimeout(connectToBridge, 2500);
}

// Keep Service Worker awake with chrome.alarms
try {
  chrome.alarms.create("antigravity-keepalive", { periodInMinutes: 0.25 });
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "antigravity-keepalive") {
      if (!ws || ws.readyState !== WebSocket.OPEN) {
        connectToBridge();
      }
    }
  });
} catch (_) {}

chrome.runtime.onInstalled?.addListener(() => connectToBridge());
chrome.runtime.onStartup?.addListener(() => connectToBridge());

function sendToBridge(data) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

// Attach Chrome Debugger (CDP) to a tab
async function ensureDebuggerAttached(tabId) {
  if (attachedTabs.has(tabId)) return;

  await chrome.debugger.attach({ tabId }, "1.3");
  attachedTabs.add(tabId);
  await chrome.debugger.sendCommand({ tabId }, "Page.enable").catch(() => {});
  await chrome.debugger.sendCommand({ tabId }, "DOM.enable").catch(() => {});
  await chrome.debugger.sendCommand({ tabId }, "Runtime.enable").catch(() => {});
}

chrome.debugger.onDetach.addListener((source, reason) => {
  if (source.tabId) {
    attachedTabs.delete(source.tabId);
  }
});

// Command Router
async function handleCommand(command, params) {
  // Resolve Target Tab
  let tabId = params.tabId;
  if (!tabId) {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    tabId = activeTab ? activeTab.id : null;
  }

  switch (command) {
    case "list_tabs": {
      const tabs = await chrome.tabs.query({});
      return tabs.map(t => ({
        id: t.id,
        windowId: t.windowId,
        title: t.title,
        url: t.url,
        active: t.active
      }));
    }

    case "focus_tab": {
      let targetTabId = params.tabId;
      if (!targetTabId && params.urlContains) {
        const tabs = await chrome.tabs.query({});
        const match = tabs.find(t => t.url && t.url.toLowerCase().includes(params.urlContains.toLowerCase()));
        if (match) targetTabId = match.id;
      }
      if (!targetTabId && params.titleContains) {
        const tabs = await chrome.tabs.query({});
        const match = tabs.find(t => t.title && t.title.toLowerCase().includes(params.titleContains.toLowerCase()));
        if (match) targetTabId = match.id;
      }

      if (!targetTabId) throw new Error("Target tab not found");

      const tab = await chrome.tabs.get(targetTabId);
      await chrome.windows.update(tab.windowId, { focused: true });
      await chrome.tabs.update(targetTabId, { active: true });
      return { focused: true, tabId: targetTabId, title: tab.title, url: tab.url };
    }

    case "navigate": {
      if (!params.url) throw new Error("URL is required");
      let targetTabId = tabId;
      if (!targetTabId) {
        const newTab = await chrome.tabs.create({ url: params.url });
        targetTabId = newTab.id;
      } else {
        await chrome.tabs.update(targetTabId, { url: params.url });
      }
      return { navigated: true, tabId: targetTabId, url: params.url };
    }

async function ensureContentScriptInjected(tabId) {
  try {
    await chrome.scripting.insertCSS({
      target: { tabId },
      files: ["content.css"]
    }).catch(() => {});
    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"]
    }).catch(() => {});
  } catch (_) {}
}

    case "click": {
      if (!tabId) throw new Error("No active tab available for click");
      await ensureDebuggerAttached(tabId);

      let x = params.x;
      let y = params.y;
      const label = params.actionLabel || params.label || "";

      // If selector or text provided, find coordinates
      if ((x === undefined || y === undefined) && (params.selector || params.text || params.aria)) {
        // 1. Try content script
        try {
          await ensureContentScriptInjected(tabId);
          const findRes = await chrome.tabs.sendMessage(tabId, {
            action: "FIND_ELEMENT",
            query: { selector: params.selector, text: params.text, aria: params.aria }
          });
          if (findRes && findRes.found) {
            x = findRes.x;
            y = findRes.y;
          }
        } catch (err) {}

        // 2. CDP Runtime fallback
        if (x === undefined || y === undefined) {
          const targetText = params.text || "";
          const targetSelector = params.selector || "";
          const targetAria = params.aria || "";
          const expr = `(function() {
            let el = null;
            if (${JSON.stringify(targetSelector)}) {
              try { el = document.querySelector(${JSON.stringify(targetSelector)}); } catch(e) {}
            }
            if (!el && ${JSON.stringify(targetText)}) {
              const t = ${JSON.stringify(targetText)}.trim().toLowerCase();
              const candidates = Array.from(document.querySelectorAll("button, a, [role='button'], [role='tab'], span, label, th, td"));
              el = candidates.find(item => {
                const s = (item.innerText || item.textContent || "").trim().toLowerCase();
                return s === t || s.includes(t);
              });
            }
            if (!el && (${JSON.stringify(targetAria)} || ${JSON.stringify(targetText)})) {
              const term = (${JSON.stringify(targetAria)} || ${JSON.stringify(targetText)}).toLowerCase();
              el = Array.from(document.querySelectorAll("[aria-label], [title]")).find(item => {
                const a = (item.getAttribute("aria-label") || "").toLowerCase();
                const ti = (item.getAttribute("title") || "").toLowerCase();
                return a.includes(term) || ti.includes(term);
              });
            }
            if (!el) return null;
            el.scrollIntoView({ block: "center", inline: "center" });
            const r = el.getBoundingClientRect();
            return {
              x: Math.round(r.left + r.width / 2),
              y: Math.round(r.top + r.height / 2)
            };
          })()`;

          const evalRes = await chrome.debugger.sendCommand({ tabId }, "Runtime.evaluate", {
            expression: expr,
            returnByValue: true
          });

          if (evalRes && evalRes.result && evalRes.result.value) {
            x = evalRes.result.value.x;
            y = evalRes.result.value.y;
          }
        }
      }

      if (x === undefined || y === undefined) {
        throw new Error(`Could not determine coordinates for target element (${params.text || params.selector || params.aria})`);
      }

      // Show visual laser cursor animation directly via CDP Runtime.evaluate
      const animLabel = label || `Click at (${x}, ${y})`;
      const exprCursor = `(function() {
        let c = document.getElementById("antigravity-cdp-cursor");
        if (!c) {
          c = document.createElement("div");
          c.id = "antigravity-cdp-cursor";
          document.documentElement.appendChild(c);
        }
        c.style.cssText = "position: fixed !important; top: 0px !important; left: 0px !important; z-index: 2147483647 !important; pointer-events: none !important; width: 40px; height: 40px; transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease !important; transform: translate3d(${x}px, ${y}px, 0px) !important; display: block !important; opacity: 1 !important;";

        // Click ripple wave
        const rip = document.createElement("div");
        rip.style.cssText = "position: fixed !important; top: 0px !important; left: 0px !important; z-index: 2147483646 !important; pointer-events: none !important; width: 24px; height: 24px; border-radius: 50% !important; border: 2px solid #38bdf8 !important; background: rgba(56, 189, 248, 0.35) !important; box-shadow: 0 0 14px rgba(56, 189, 248, 0.8) !important; transform: translate3d(${x - 12}px, ${y - 12}px, 0px) scale(0.3) !important; transition: transform 0.55s cubic-bezier(0, 0.2, 0.8, 1), opacity 0.55s ease !important;";
        document.documentElement.appendChild(rip);
        requestAnimationFrame(() => {
          rip.style.transform = "translate3d(${x - 12}px, ${y - 12}px, 0px) scale(3.5)";
          rip.style.opacity = "0";
          setTimeout(() => rip.remove(), 600);
        });

        const safeLabel = ${JSON.stringify(animLabel)};
        c.innerHTML = \`
          <div style="position:relative; width:40px; height:40px;">
            <svg width="38" height="38" viewBox="0 0 28 28" fill="none" style="filter: drop-shadow(0 2px 10px rgba(56,189,248,0.95));">
              <defs>
                <linearGradient id="laser" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#38bdf8"/>
                  <stop offset="50%" stop-color="#818cf8"/>
                  <stop offset="100%" stop-color="#ec4899"/>
                </linearGradient>
              </defs>
              <path d="M4 2L24 13L15 15L12 24L4 2Z" fill="url(#laser)" stroke="#ffffff" stroke-width="2" stroke-linejoin="round"/>
            </svg>
            <div style="position:absolute; left:32px; top:22px; background:rgba(15,23,42,0.94); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); color:#ffffff; border:2px solid #38bdf8; padding:6px 14px; border-radius:20px; font-size:12.5px; font-weight:700; font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; white-space:nowrap; box-shadow:0 8px 24px rgba(0,0,0,0.6), 0 0 12px rgba(56,189,248,0.4); display:flex; align-items:center; gap:8px;">
              <span style="width:7px; height:7px; background:#38bdf8; border-radius:50%; box-shadow:0 0 8px #38bdf8; display:inline-block;"></span>
              \${safeLabel}
            </div>
          </div>
        \`;

        clearTimeout(window.__agCursorTimer);
        window.__agCursorTimer = setTimeout(() => {
          if (c) c.style.opacity = "0";
        }, 3200);
      })()`;

      await chrome.debugger.sendCommand({ tabId }, "Runtime.evaluate", {
        expression: exprCursor,
        returnByValue: true
      }).catch(() => {});

      // Wait 350ms so user clearly sees the laser cursor gliding and badge
      await new Promise(r => setTimeout(r, 350));

      // Native CDP Trusted Mouse Events
      await chrome.debugger.sendCommand({ tabId }, "Input.dispatchMouseEvent", {
        type: "mouseMoved",
        x: Number(x),
        y: Number(y)
      });
      await chrome.debugger.sendCommand({ tabId }, "Input.dispatchMouseEvent", {
        type: "mousePressed",
        x: Number(x),
        y: Number(y),
        button: "left",
        clickCount: 1
      });
      await new Promise(r => setTimeout(r, 60));
      await chrome.debugger.sendCommand({ tabId }, "Input.dispatchMouseEvent", {
        type: "mouseReleased",
        x: Number(x),
        y: Number(y),
        button: "left",
        clickCount: 1
      });

      return { clicked: true, x, y, label };
    }

    case "type": {
      if (!tabId) throw new Error("No active tab available for typing");
      await ensureDebuggerAttached(tabId);
      const text = params.text || "";

      // Native CDP Key Events
      for (const char of text) {
        await chrome.debugger.sendCommand({ tabId }, "Input.dispatchKeyEvent", {
          type: "keyDown",
          text: char,
          unmodifiedText: char
        });
        await chrome.debugger.sendCommand({ tabId }, "Input.dispatchKeyEvent", {
          type: "keyUp"
        });
        await new Promise(r => setTimeout(r, 20));
      }

      return { typed: true, textLength: text.length };
    }

    case "screenshot": {
      if (!tabId) throw new Error("No active tab for screenshot");
      await ensureDebuggerAttached(tabId);

      const res = await chrome.debugger.sendCommand({ tabId }, "Page.captureScreenshot", {
        format: params.format || "png",
        quality: params.quality || undefined
      });

      return { screenshot: res.data };
    }

    case "get_dom": {
      if (!tabId) throw new Error("No active tab to read DOM");
      try {
        const dom = await chrome.tabs.sendMessage(tabId, { action: "EXTRACT_DOM" });
        return dom;
      } catch (err) {
        // Fallback via CDP Runtime.evaluate
        await ensureDebuggerAttached(tabId);
        const evalRes = await chrome.debugger.sendCommand({ tabId }, "Runtime.evaluate", {
          expression: "document.title + ' | ' + window.location.href",
          returnByValue: true
        });
        return { title: evalRes.result?.value };
      }
    }

    case "eval": {
      if (!tabId) throw new Error("No active tab for evaluation");
      await ensureDebuggerAttached(tabId);
      const evalRes = await chrome.debugger.sendCommand({ tabId }, "Runtime.evaluate", {
        expression: params.code || params.expression,
        returnByValue: true
      });
      return evalRes.result?.value;
    }

    default:
      throw new Error(`Unknown command: ${command}`);
  }
}

// Initial start
connectToBridge();
