// Antigravity Popup Script
document.addEventListener("DOMContentLoaded", async () => {
  const statusBadge = document.getElementById("bridge-status");
  const statusText = document.getElementById("bridge-status-text");
  const tabTitleEl = document.getElementById("active-tab-title");
  const tabUrlEl = document.getElementById("active-tab-url");
  const btnTestCursor = document.getElementById("btn-test-cursor");
  const btnTagSom = document.getElementById("btn-tag-som");
  const btnToggleOmnibar = document.getElementById("btn-toggle-omnibar");
  const btnRecordMacro = document.getElementById("btn-record-macro");

  let isRecording = false;

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
    } catch (_) {
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

      btnTestCursor.textContent = "✓ Laser Triggered!";
      setTimeout(() => {
        btnTestCursor.textContent = "✨ Test Visual Laser Cursor";
      }, 2000);
    } catch (_) {
      alert("Please refresh the active web page to enable content script overlay!");
    }
  });

  // 4. Tag Elements (Set-of-Mark)
  btnTagSom.addEventListener("click", async () => {
    if (!tab || !tab.id) return;
    try {
      const res = await chrome.tabs.sendMessage(tab.id, { action: "TAG_ELEMENTS" });
      if (res && res.taggedCount !== undefined) {
        btnTagSom.textContent = `✓ Tagged ${res.taggedCount} Badges!`;
        setTimeout(() => {
          btnTagSom.textContent = "🏷️ Tag Elements (Set-of-Mark)";
        }, 2500);
      }
    } catch (_) {
      alert("Please refresh the web page to tag elements!");
    }
  });

  // 5. Toggle In-Page Omnibar
  btnToggleOmnibar.addEventListener("click", async () => {
    if (!tab || !tab.id) return;
    try {
      await chrome.tabs.sendMessage(tab.id, { action: "TOGGLE_OMNIBAR" });
      window.close(); // Close popup so user sees the in-page Omnibar
    } catch (_) {
      alert("Please refresh the web page to open Omnibar!");
    }
  });

  // 6. Macro Recorder
  btnRecordMacro.addEventListener("click", async () => {
    isRecording = !isRecording;
    if (isRecording) {
      btnRecordMacro.classList.add("recording");
      btnRecordMacro.textContent = "⏹️ Stop Recording";
      try {
        await fetch("http://127.0.0.1:8765/record/start", { method: "POST" });
      } catch (_) {}
    } else {
      btnRecordMacro.classList.remove("recording");
      btnRecordMacro.textContent = "⏺️ Start Macro Recorder";
      try {
        const res = await fetch("http://127.0.0.1:8765/record/stop", { method: "POST" });
        const data = await res.json();
        alert(`Macro recorded! Captured ${data.stepCount || 0} user action(s).`);
      } catch (_) {}
    }
  });
});
