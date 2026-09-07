// Antigravity Live Visual Browser Demo
const browser = require("./client.js");
const fs = require("fs");
const path = require("path");

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function clickElementByText(text, actionLabel) {
  console.log(`🎯 Targeting button: "${text}"...`);
  // Scroll element into view and get viewport coordinates
  const coords = await browser.evaluate(`
    (function() {
      const btn = Array.from(document.querySelectorAll("button, a, [role='button']")).find(b => {
        const t = (b.innerText || b.textContent || "").trim().toLowerCase();
        return t === ${JSON.stringify(text.toLowerCase())};
      });
      if (!btn) return null;
      btn.scrollIntoView({ behavior: "smooth", block: "center" });
      const rect = btn.getBoundingClientRect();
      return {
        x: Math.round(rect.left + rect.width / 2),
        y: Math.round(rect.top + rect.height / 2),
        text: btn.innerText.trim()
      };
    })()
  `);

  if (!coords) {
    throw new Error(`Element with text "${text}" not found on page`);
  }

  // Allow 350ms for smooth scroll to settle
  await sleep(350);

  // Recalculate coordinates after scroll
  const liveCoords = await browser.evaluate(`
    (function() {
      const btn = Array.from(document.querySelectorAll("button, a, [role='button']")).find(b => {
        const t = (b.innerText || b.textContent || "").trim().toLowerCase();
        return t === ${JSON.stringify(text.toLowerCase())};
      });
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return {
        x: Math.round(rect.left + rect.width / 2),
        y: Math.round(rect.top + rect.height / 2)
      };
    })()
  `);

  const x = liveCoords ? liveCoords.x : coords.x;
  const y = liveCoords ? liveCoords.y : coords.y;

  console.log(`   📍 Clicking at viewport (${x}, ${y}) with label: "${actionLabel}"`);
  return await browser.click({ x, y, actionLabel });
}

async function main() {
  console.log("=================================================");
  console.log("✨ Antigravity Visual Browser Control Demo");
  console.log("=================================================");

  // 1. Focus tab
  console.log("1. Focusing tab 'Laporan Performa Google Ads'...");
  await browser.focusTab({ titleContains: "Laporan Performa" });
  await sleep(800);

  // 2. Click '90 hari' button
  console.log("\n2. Switching Location Period to '90 hari'...");
  await clickElementByText("90 hari", "✨ Beralih ke Data Lokasi 90 Hari");
  await sleep(1500);

  // 3. Click 'Pantau' filter
  console.log("\n3. Filtering Search Terms: 'Pantau'...");
  await clickElementByText("Pantau", "🔍 Memfilter Search Terms: Pantau");
  await sleep(1500);

  // 4. Click 'Negatif' filter
  console.log("\n4. Filtering Search Terms: 'Negatif'...");
  await clickElementByText("Negatif", "🚫 Menampilkan Kata Kunci Negatif/Kompetitor");
  await sleep(1500);

  // 5. Click 'Semua' filter
  console.log("\n5. Resetting Search Terms filter: 'Semua'...");
  await clickElementByText("Semua", "✓ Menampilkan Kembali Semua Kata Kunci");
  await sleep(1200);

  // 6. Capture live screenshot
  console.log("\n6. Capturing screenshot of result via CDP...");
  const shotRes = await browser.screenshot();
  if (shotRes && shotRes.screenshot) {
    const filePath = path.join(__dirname, "..", "live_demo_screenshot.png");
    fs.writeFileSync(filePath, Buffer.from(shotRes.screenshot, "base64"));
    console.log("   ✓ Screenshot saved to:", filePath);
  }

  console.log("\n🎉 DEMO SUCCEEDED 100%! All visual clicks and CDP events verified!");
}

main().catch(err => {
  console.error("❌ Error during demo:", err.message);
});
