// Antigravity Background Service Worker: Bridge WebSocket Client, CDP Controller & Event Recorder
const BRIDGE_WS_URL = "ws://127.0.0.1:8765";
let ws = null;
let reconnectTimer = null;
const attachedTabs = new Set();

// Recorder state
let isRecording = false;
let recordedSteps = [];

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
      chrome.action.setBadgeBackgroundColor({ color: "#10b981" });
      startHeartbeat();

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
        if (message.type === "PONG") return;

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
      console.log("[Antigravity Bridge] Connection closed. Auto-reconnecting in 2.5s...");
      chrome.action.setBadgeText({ text: "" });
      stopHeartbeat();
      ws = null;
      scheduleReconnect();
    };

    ws.onerror = () => {
      console.warn("[Antigravity Bridge] Bridge server not reachable at ws://127.0.0.1:8765. Start the server with 'npm start' or './start-bridge.sh'. Retrying in 2.5s...");
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

chrome.debugger.onDetach.addListener((source) => {
  if (source.tabId) {
    attachedTabs.delete(source.tabId);
  }
});

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

async function executeCdpClick(tabId, x, y, label, isGuardrail = false) {
  await ensureDebuggerAttached(tabId);

  // Animate laser cursor on page
  const animLabel = label || `Click at (${x}, ${y})`;
  const badgeState = isGuardrail ? "guardrail" : "normal";

  try {
    await chrome.tabs.sendMessage(tabId, {
      action: "SHOW_ACTION",
      x: Number(x),
      y: Number(y),
      label: animLabel,
      isClick: true,
      state: badgeState
    });
  } catch (_) {
    // Fallback via CDP Runtime.evaluate
    const exprCursor = `(function() {
      let c = document.getElementById("antigravity-cdp-cursor");
      if (!c) {
        c = document.createElement("div");
        c.id = "antigravity-cdp-cursor";
        document.documentElement.appendChild(c);
      }
      c.style.cssText = "position: fixed !important; top: 0px !important; left: 0px !important; z-index: 2147483647 !important; pointer-events: none !important; width: 40px; height: 40px; transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.25s ease !important; transform: translate3d(${x}px, ${y}px, 0px) !important; display: block !important; opacity: 1 !important;";
      const rip = document.createElement("div");
      rip.style.cssText = "position: fixed !important; top: 0px !important; left: 0px !important; z-index: 2147483646 !important; pointer-events: none !important; width: 24px; height: 24px; border-radius: 50% !important; border: 2px solid #38bdf8 !important; background: rgba(56, 189, 248, 0.35) !important; box-shadow: 0 0 14px rgba(56, 189, 248, 0.8) !important; transform: translate3d(${x - 12}px, ${y - 12}px, 0px) scale(0.3) !important; transition: transform 0.55s cubic-bezier(0, 0.2, 0.8, 1), opacity 0.55s ease !important;";
      document.documentElement.appendChild(rip);
      requestAnimationFrame(() => {
        rip.style.transform = "translate3d(${x - 12}px, ${y - 12}px, 0px) scale(3.5)";
        rip.style.opacity = "0";
        setTimeout(() => rip.remove(), 600);
      });
      c.innerHTML = \`<div style="position:relative; width:40px; height:40px;"><div style="position:absolute; left:32px; top:22px; background:rgba(15,23,42,0.94); color:#ffffff; border:2px solid #38bdf8; padding:6px 14px; border-radius:20px; font-size:12.5px; font-weight:700; white-space:nowrap;">\${${JSON.stringify(animLabel)}}</div></div>\`;
      setTimeout(() => { if (c) c.style.opacity = "0"; }, 3000);
    })()`;
    await chrome.debugger.sendCommand({ tabId }, "Runtime.evaluate", { expression: exprCursor }).catch(() => {});
  }

  // Smooth glide delay
  await new Promise(r => setTimeout(r, 320));

  // Native DevTools Mouse Events
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

  if (isRecording) {
    recordedSteps.push({
      action: "click",
      x: Number(x),
      y: Number(y),
      label: animLabel,
      timestamp: Date.now()
    });
  }

  return { clicked: true, x, y, label: animLabel };
}

// Command Router
async function handleCommand(command, params) {
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

      if (isRecording) {
        recordedSteps.push({ action: "navigate", url: params.url, timestamp: Date.now() });
      }

      return { navigated: true, tabId: targetTabId, url: params.url };
    }

    case "tag_elements": {
      if (!tabId) throw new Error("No active tab to tag");
      await ensureContentScriptInjected(tabId);
      return await chrome.tabs.sendMessage(tabId, { action: "TAG_ELEMENTS" });
    }

    case "clear_tags": {
      if (!tabId) return { cleared: true };
      await ensureContentScriptInjected(tabId);
      return await chrome.tabs.sendMessage(tabId, { action: "CLEAR_TAGS" });
    }

    case "click_badge": {
      if (!tabId) throw new Error("No active tab for click");
      if (!params.badgeId) throw new Error("badgeId is required");
      await ensureContentScriptInjected(tabId);

      const badgeRes = await chrome.tabs.sendMessage(tabId, {
        action: "GET_BADGE",
        badgeId: params.badgeId
      });

      if (!badgeRes || !badgeRes.found) {
        throw new Error(`Badge [${params.badgeId}] was not found in active viewport`);
      }

      const label = params.actionLabel || `Click Badge [${params.badgeId}] ("${badgeRes.text || ""}")`;
      return await executeCdpClick(tabId, badgeRes.x, badgeRes.y, label);
    }

    case "detect_challenge": {
      if (!tabId) return { challenged: false };
      await ensureContentScriptInjected(tabId);
      return await chrome.tabs.sendMessage(tabId, { action: "DETECT_CHALLENGE" });
    }

    case "toggle_omnibar": {
      if (!tabId) throw new Error("No active tab for omnibar");
      await ensureContentScriptInjected(tabId);
      return await chrome.tabs.sendMessage(tabId, { action: "TOGGLE_OMNIBAR" });
    }

    case "start_recording": {
      isRecording = true;
      recordedSteps = [];
      return { recording: true, startedAt: Date.now() };
    }

    case "stop_recording": {
      isRecording = false;
      const steps = [...recordedSteps];
      return { recording: false, stepCount: steps.length, steps };
    }

    case "get_recorded_recipe": {
      return { isRecording, steps: recordedSteps };
    }

    case "click": {
      if (!tabId) throw new Error("No active tab available for click");
      await ensureDebuggerAttached(tabId);

      let x = params.x;
      let y = params.y;
      const label = params.actionLabel || params.label || "";

      // Guardrail Check
      const highStakesPattern = /delete|remove|drop|cancel campaign|pay|transfer|checkout|confirm order/i;
      const isHighStakes = (params.text && highStakesPattern.test(params.text)) ||
                           (label && highStakesPattern.test(label));

      if (isHighStakes && !params.force) {
        // Show red guardrail alert state
        if (x !== undefined && y !== undefined) {
          await executeCdpClick(tabId, x, y, `🚨 GUARDRAIL: Held for Approval (${label || params.text})`, true);
        }
      }

      // If selector or text provided, find coordinates
      if ((x === undefined || y === undefined) && (params.selector || params.text || params.aria)) {
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
        } catch (_) {}

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
            return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2) };
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

      return await executeCdpClick(tabId, x, y, label);
    }

    case "type": {
      if (!tabId) throw new Error("No active tab available for typing");
      await ensureDebuggerAttached(tabId);
      const text = params.text || "";

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

      if (isRecording) {
        recordedSteps.push({ action: "type", text, timestamp: Date.now() });
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
      } catch (_) {
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

connectToBridge();
