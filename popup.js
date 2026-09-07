// Antigravity Popup Script
document.addEventListener("DOMContentLoaded", async () => {
  const statusBadge = document.getElementById("bridge-status");
  const statusText = document.getElementById("bridge-status-text");
  const tabTitleEl = document.getElementById("active-tab-title");
  const tabUrlEl = document.getElementById("active-tab-url");
  const btnTestCursor = document.getElementById("btn-test-cursor");
  const btnExtractDom = document.getElementById("btn-extract-dom");

  // 1. Get Active Tab Info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    tabTitleEl.textContent = tab.title || "Untitled Tab";
    tabUrlEl.textContent = tab.url || "";
  }

  // 2. Check Local Bridge Status
  async function checkBridge() {
    try {
      const res = await fetch("http://127.0.0.1:8765/status");
      if (res.ok) {
        statusBadge.classList.remove("offline");
        statusText.textContent = "Connected";
      } else {
        throw new Error();
      }
    } catch (e) {
      statusBadge.classList.add("offline");
      statusText.textContent = "Offline";
    }
  }

  checkBridge();

  // 3. Test Visual Laser Cursor
  btnTestCursor.addEventListener("click", async () => {
    if (!tab || !tab.id) return;

    try {
      const centerX = Math.round(window.screen.availWidth / 2);
      const centerY = 350;

      await chrome.tabs.sendMessage(tab.id, {
        action: "SHOW_ACTION",
        x: centerX,
        y: centerY,
        label: "✨ Antigravity Laser Cursor Active!",
        isClick: true
      });

      btnTestCursor.textContent = "✓ Laser Cursor Triggered!";
      setTimeout(() => {
        btnTestCursor.textContent = "✨ Test Visual Laser Cursor";
      }, 2000);
    } catch (err) {
      alert("Please refresh the active web page to enable content script overlay!");
    }
  });

  // 4. Extract Tab Elements
  btnExtractDom.addEventListener("click", async () => {
    if (!tab || !tab.id) return;

    try {
      const dom = await chrome.tabs.sendMessage(tab.id, { action: "EXTRACT_DOM" });
      if (dom) {
        btnExtractDom.textContent = `✓ Found ${dom.interactiveCount} Elements!`;
        setTimeout(() => {
          btnExtractDom.textContent = "🔍 Extract Active Tab Elements";
        }, 2500);
      }
    } catch (err) {
      alert("Please refresh the web page to inspect its elements!");
    }
  });
});
