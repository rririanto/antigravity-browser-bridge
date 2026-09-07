// Live Cursor Demonstration Script
const browser = require("./client.js");

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log("1. Bringing Chrome tab to front...");
  await browser.focusTab({ titleContains: "Laporan Performa" });
  await sleep(600);

  console.log("2. Moving laser cursor to (400, 250)...");
  await browser.click({
    x: 400,
    y: 250,
    actionLabel: "✨ Antigravity Laser Cursor Active!"
  });
  await sleep(1200);

  console.log("3. Moving laser cursor to (650, 420)...");
  await browser.click({
    x: 650,
    y: 420,
    actionLabel: "🚀 Gliding across screen..."
  });
  await sleep(1200);

  console.log("4. Clicking 'Pantau' button with visual cursor...");
  await browser.click({
    text: "Pantau",
    actionLabel: "🔍 Filter: Pantau"
  });
  await sleep(1200);

  console.log("✓ Done! Look at your Chrome screen!");
}

run().catch(err => console.error("Error:", err.message));
