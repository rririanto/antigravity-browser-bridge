// Quick connection test for Antigravity Browser Bridge
const browser = require("./client.js");

async function main() {
  console.log("🔍 Checking Antigravity Bridge status...");
  try {
    const status = await browser.getStatus();
    console.log("✓ Bridge Server is running on port", status.port);

    if (!status.connected) {
      console.log("\n⚠️  Chrome Extension is NOT yet connected.");
      console.log("👉 Please open Chrome, go to chrome://extensions, enable 'Developer mode', and click 'Load unpacked' pointing to 'antigravity-browser-extension/'.");
      return;
    }

    console.log("✓ Chrome Extension is CONNECTED! 🟢");
    console.log("\n📑 Fetching open Chrome tabs...");
    const tabs = await browser.getTabs();
    console.log(`Found ${tabs.length} open tab(s):\n`);

    tabs.forEach((t, i) => {
      console.log(`  [${i + 1}] ${t.title}`);
      console.log(`      URL: ${t.url} (ID: ${t.id})${t.active ? " ⭐ [Active]" : ""}`);
    });

    console.log("\n🎉 Everything is ready! Antigravity can now control your Chrome browser!");
  } catch (err) {
    console.error("❌ Error:", err.message);
  }
}

main();
