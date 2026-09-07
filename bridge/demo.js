// Antigravity Visual Demonstration Script
const browser = require("./client.js");

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runDemo() {
  console.log("🚀 Starting Antigravity Visual Laser Cursor Demo...");

  // 1. Focus the Laporan Performa tab
  console.log("1. Focusing tab 'Laporan Performa Google Ads'...");
  const focusResult = await browser.focusTab({
    titleContains: "Laporan Performa"
  });
  console.log("   ✓ Tab focused:", focusResult.title);
  await sleep(1000);

  // 2. Click "90 Hari" in the location table
  console.log("2. Clicking '90 Hari' button in Location Table...");
  await browser.click({
    text: "90 Hari",
    actionLabel: "✨ Memilih Periode 90 Hari"
  });
  await sleep(1500);

  // 3. Click "Pantau" filter in Search Terms table
  console.log("3. Filtering Search Terms: 'Pantau'...");
  await browser.click({
    text: "Pantau",
    actionLabel: "🔍 Filter Kata Kunci yang Dipantau"
  });
  await sleep(1500);

  // 4. Click "Negatif" filter
  console.log("4. Filtering Search Terms: 'Negatif'...");
  await browser.click({
    text: "Negatif",
    actionLabel: "🚫 Filter Kata Kunci Kompetitor/Negatif"
  });
  await sleep(1500);

  // 5. Click "Semua" filter to reset
  console.log("5. Resetting Search Terms filter: 'Semua'...");
  await browser.click({
    text: "Semua",
    actionLabel: "✓ Mengembalikan Tampilan Semua Kata Kunci"
  });
  await sleep(1000);

  console.log("\n🎉 Demo completed successfully with visual laser cursor and real CDP events!");
}

runDemo().catch(err => console.error("❌ Demo Error:", err.message));
