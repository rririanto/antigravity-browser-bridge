// Test Seam 1: Sanitization & Hygiene Verification
const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "..");
const FORBIDDEN_PATTERNS = [
  { pattern: /\/Users\/[a-zA-Z0-9_-]+\//, label: "Hardcoded absolute user home path" },
  { pattern: /client_secret_[a-zA-Z0-9_-]+/, label: "Google OAuth client secret" },
  { pattern: /ghp_[a-zA-Z0-9]+/, label: "GitHub Personal Access Token" },
  { pattern: /AIza[0-9A-Za-z-_]{35}/, label: "Google API Key" }
];

const IGNORE_DIRS = new Set([".git", "node_modules"]);
const IGNORE_FILES = new Set(["sanitize-check.test.js"]); // Don't flag regex patterns in this test file

let errors = [];
let scannedCount = 0;

function scanDir(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath = path.relative(ROOT_DIR, fullPath);

    if (entry.isDirectory()) {
      if (!IGNORE_DIRS.has(entry.name)) {
        scanDir(fullPath);
      }
    } else if (entry.isFile()) {
      if (IGNORE_FILES.has(entry.name)) continue;

      scannedCount++;
      const content = fs.readFileSync(fullPath, "utf8");
      
      for (const { pattern, label } of FORBIDDEN_PATTERNS) {
        if (pattern.test(content)) {
          errors.push(`[VIOLATION] Found ${label} in ${relPath}`);
        }
      }
    }
  }
}

console.log("🔒 Running Sanitization & Credential Hygiene Audit...");
scanDir(ROOT_DIR);

// Also verify manifest.json syntax
try {
  const manifestRaw = fs.readFileSync(path.join(ROOT_DIR, "manifest.json"), "utf8");
  const manifest = JSON.parse(manifestRaw);
  if (manifest.manifest_version !== 3) {
    errors.push("[MANIFEST] manifest_version must be 3");
  }
  if (!manifest.permissions.includes("debugger")) {
    errors.push("[MANIFEST] missing 'debugger' permission");
  }
} catch (e) {
  errors.push(`[MANIFEST] Invalid JSON in manifest.json: ${e.message}`);
}

if (errors.length > 0) {
  console.error(`\n❌ Sanitization Audit FAILED (${errors.length} issue(s) detected):`);
  errors.forEach(err => console.error("  -", err));
  process.exit(1);
} else {
  console.log(`✓ Sanitization Audit PASSED! Scanned ${scannedCount} file(s) with 0 path leaks or exposed credentials.\n`);
  process.exit(0);
}
