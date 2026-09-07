// Test Seam 3: Advanced Feature API & Client Interface Seam
const { spawn } = require("child_process");
const http = require("http");
const path = require("path");
const browser = require("../bridge/client.js");

const TEST_PORT = 8998;
const serverPath = path.resolve(__dirname, "../bridge/server.js");

console.log("🧪 Testing 5 Killer Feature Seams & Client Interface...");

// 1. Verify Client Methods Interface
const requiredMethods = [
  "tagElements",
  "clearTags",
  "clickBadge",
  "detectChallenge",
  "toggleOmnibar",
  "startRecording",
  "stopRecording",
  "getRecipe",
  "focusTab",
  "click",
  "type",
  "getDOM",
  "screenshot"
];

for (const method of requiredMethods) {
  if (typeof browser[method] !== "function") {
    console.error(`❌ Missing client method: browser.${method}`);
    process.exit(1);
  }
}
console.log(`✓ All ${requiredMethods.length} client library methods verified.`);

// 2. Test Server Endpoints Seam
const serverProcess = spawn("node", [serverPath], {
  env: { ...process.env, BRIDGE_PORT: String(TEST_PORT) },
  stdio: "pipe"
});

function cleanup(code) {
  try { serverProcess.kill("SIGTERM"); } catch (_) {}
  process.exit(code);
}

serverProcess.on("error", (err) => {
  console.error("❌ Failed to start test server:", err.message);
  cleanup(1);
});

setTimeout(() => {
  // Test Omnibar prompt endpoint
  const postData = JSON.stringify({ prompt: "Filter negative search terms", url: "https://ads.google.com" });
  const req = http.request({
    hostname: "127.0.0.1",
    port: TEST_PORT,
    path: "/omnibar/prompt",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(postData)
    }
  }, (res) => {
    let data = "";
    res.on("data", chunk => data += chunk);
    res.on("end", () => {
      try {
        if (res.statusCode !== 200) throw new Error(`HTTP ${res.statusCode}: ${data}`);
        const parsed = JSON.parse(data);
        if (!parsed.received || parsed.prompt !== "Filter negative search terms") {
          throw new Error("Invalid response from /omnibar/prompt: " + data);
        }
        console.log("✓ Omnibar Prompt endpoint verified:", JSON.stringify(parsed));
        console.log("✓ Test Seam 3: Advanced Features API passed successfully!\n");
        cleanup(0);
      } catch (e) {
        console.error("❌ Assertion error:", e.message);
        cleanup(1);
      }
    });
  });

  req.on("error", (e) => {
    console.error("❌ HTTP request failed:", e.message);
    cleanup(1);
  });

  req.write(postData);
  req.end();
}, 500);

setTimeout(() => {
  console.error("❌ Test timed out");
  cleanup(1);
}, 4000);
