// Antigravity Content Script: Visual Laser Cursor & DOM Engine
(function () {
  let container = null;
  let cursorEl = null;
  let badgeEl = null;
  let hideTimeout = null;

  function initOverlay() {
    if (container) return;
    container = document.createElement("div");
    container.id = "antigravity-cursor-container";

    cursorEl = document.createElement("div");
    cursorEl.id = "antigravity-laser-cursor";
    // Sleek, glowing laser cursor SVG (Google Colors inspired)
    cursorEl.innerHTML = `
      <svg viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="agLaserGrad" x1="0" y1="0" x2="28" y2="28" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#38bdf8"/>
            <stop offset="50%" stop-color="#818cf8"/>
            <stop offset="100%" stop-color="#c084fc"/>
          </linearGradient>
          <filter id="agGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur"/>
            <feComposite in="SourceGraphic" in2="blur" operator="over"/>
          </filter>
        </defs>
        <path d="M4 2L24 13L15 15L12 24L4 2Z" fill="url(#agLaserGrad)" filter="url(#agGlow)" stroke="#ffffff" stroke-width="1.5" stroke-linejoin="round"/>
      </svg>
    `;

    badgeEl = document.createElement("div");
    badgeEl.id = "antigravity-action-badge";

    container.appendChild(cursorEl);
    container.appendChild(badgeEl);

    if (document.body) {
      document.body.appendChild(container);
    } else {
      document.addEventListener("DOMContentLoaded", () => {
        document.body.appendChild(container);
      });
    }
  }

  function showAction(x, y, label, isClick = false) {
    initOverlay();
    if (!container || !cursorEl) return;

    if (hideTimeout) clearTimeout(hideTimeout);

    // Move cursor smoothly
    cursorEl.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    cursorEl.classList.add("active");

    if (label) {
      badgeEl.textContent = label;
      // Position badge slightly offset to bottom right
      const badgeX = Math.min(x + 22, window.innerWidth - 180);
      const badgeY = Math.max(12, y + 18);
      badgeEl.style.transform = `translate3d(${badgeX}px, ${badgeY}px, 0)`;
      badgeEl.classList.add("active");
    } else {
      badgeEl.classList.remove("active");
    }

    // Trigger ripple wave if click
    if (isClick) {
      const ripple = document.createElement("div");
      ripple.className = "antigravity-ripple";
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      container.appendChild(ripple);
      setTimeout(() => ripple.remove(), 650);
    }

    // Hide after 3.5 seconds of inactivity
    hideTimeout = setTimeout(() => {
      cursorEl.classList.remove("active");
      badgeEl.classList.remove("active");
    }, 3500);
  }

  function findElement(query) {
    if (!query) return null;
    let el = null;

    // 1. Exact CSS Selector
    if (query.selector) {
      try {
        el = document.querySelector(query.selector);
      } catch (e) {}
    }

    // 2. Search by Text Content (case-insensitive)
    if (!el && query.text) {
      const targetText = query.text.trim().toLowerCase();
      const candidates = Array.from(document.querySelectorAll("button, a, [role='button'], [role='menuitem'], [role='tab'], span, h1, h2, h3, h4, th, td, label"));
      el = candidates.find(item => {
        const t = (item.innerText || item.textContent || "").trim().toLowerCase();
        return t === targetText || (t.includes(targetText) && t.length <= targetText.length + 20);
      });
    }

    // 3. Search by aria-label / title
    if (!el && (query.text || query.aria)) {
      const term = (query.aria || query.text).toLowerCase();
      el = Array.from(document.querySelectorAll("[aria-label], [title]")).find(item => {
        const aria = (item.getAttribute("aria-label") || "").toLowerCase();
        const title = (item.getAttribute("title") || "").toLowerCase();
        return aria.includes(term) || title.includes(term);
      });
    }

    if (!el) return { found: false };

    el.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    const rect = el.getBoundingClientRect();
    const x = Math.round(rect.left + rect.width / 2);
    const y = Math.round(rect.top + rect.height / 2);

    return {
      found: true,
      x: x,
      y: y,
      rect: {
        top: Math.round(rect.top),
        left: Math.round(rect.left),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      },
      tag: el.tagName,
      text: (el.innerText || el.textContent || "").trim().slice(0, 100),
      aria: el.getAttribute("aria-label")
    };
  }

  function extractDOM() {
    function isVisible(e) {
      return !!(e.offsetWidth || e.offsetHeight || e.getClientRects().length) && window.getComputedStyle(e).visibility !== "hidden";
    }

    const interactiveSelectors = "button, a, input, select, textarea, [role='button'], [role='menuitem'], [role='tab'], [role='checkbox'], [role='link']";
    const elements = Array.from(document.querySelectorAll(interactiveSelectors)).filter(isVisible);

    const items = elements.slice(0, 75).map(el => {
      const rect = el.getBoundingClientRect();
      return {
        tag: el.tagName,
        type: el.getAttribute("type") || undefined,
        role: el.getAttribute("role") || undefined,
        text: (el.innerText || el.value || el.getAttribute("aria-label") || "").trim().slice(0, 80),
        aria: el.getAttribute("aria-label") || undefined,
        x: Math.round(rect.left + rect.width / 2),
        y: Math.round(rect.top + rect.height / 2),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      };
    });

    const headings = Array.from(document.querySelectorAll("h1, h2, h3")).filter(isVisible).map(h => h.innerText.trim().slice(0, 100)).filter(Boolean);

    return {
      title: document.title,
      url: window.location.href,
      headings: headings.slice(0, 10),
      interactiveCount: elements.length,
      elements: items
    };
  }

  // Chrome Runtime Message Listener
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "SHOW_ACTION") {
      showAction(request.x, request.y, request.label, request.isClick);
      sendResponse({ success: true });
    } else if (request.action === "FIND_ELEMENT") {
      const result = findElement(request.query);
      sendResponse(result);
    } else if (request.action === "EXTRACT_DOM") {
      const dom = extractDOM();
      sendResponse(dom);
    }
    return true;
  });

  initOverlay();
})();
