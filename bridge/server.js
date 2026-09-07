// Antigravity Local Bridge Server: Zero-Dependency HTTP & WebSocket Gateway
// Connects Antigravity IDE (Gemini) directly to Google Chrome Extension via native CDP

const http = require("http");
const crypto = require("crypto");

const PORT = process.env.BRIDGE_PORT ? parseInt(process.env.BRIDGE_PORT, 10) : 8765;
let extensionWs = null;
const pendingRequests = new Map();

// --- Minimalist RFC 6455 WebSocket Implementation ---
function setupWebSocketServer(server) {
  server.on("upgrade", (req, socket, head) => {
    const key = req.headers["sec-websocket-key"];
    if (!key) {
      socket.destroy();
      return;
    }

    const acceptKey = crypto
      .createHash("sha1")
      .update(key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11")
      .digest("base64");

    const responseHeaders = [
      "HTTP/1.1 101 Switching Protocols",
      "Upgrade: websocket",
      "Connection: Upgrade",
      `Sec-WebSocket-Accept: ${acceptKey}`,
      "\r\n"
    ];

    socket.write(responseHeaders.join("\r\n"));

    // Replace or set active extension socket
    if (extensionWs) {
      try { extensionWs.destroy(); } catch (_) {}
    }
    extensionWs = socket;
    console.log("[Bridge] Chrome Extension successfully connected!");

    let buffer = Buffer.alloc(0);
    let messageFragments = [];

    socket.on("data", (chunk) => {
      buffer = Buffer.concat([buffer, chunk]);

      while (buffer.length >= 2) {
        const firstByte = buffer[0];
        const secondByte = buffer[1];
        const isFin = Boolean(firstByte & 0x80);
        const opcode = firstByte & 0x0f;
        const isMasked = Boolean(secondByte & 0x80);
        let payloadLen = secondByte & 0x7f;
        let offset = 2;

        if (payloadLen === 126) {
          if (buffer.length < 4) return;
          payloadLen = buffer.readUInt16BE(2);
          offset = 4;
        } else if (payloadLen === 127) {
          if (buffer.length < 10) return;
          payloadLen = Number(buffer.readBigUInt64BE(2));
          offset = 10;
        }

        const maskSize = isMasked ? 4 : 0;
        if (buffer.length < offset + maskSize + payloadLen) return;

        const mask = isMasked ? buffer.slice(offset, offset + 4) : null;
        const unmasked = Buffer.alloc(payloadLen);

        for (let i = 0; i < payloadLen; i++) {
          unmasked[i] = buffer[offset + maskSize + i] ^ (isMasked ? mask[i % 4] : 0);
        }

        buffer = buffer.slice(offset + maskSize + payloadLen);

        if (opcode === 0x8) {
          // Close frame
          socket.end();
          extensionWs = null;
          return;
        } else if (opcode === 0x9) {
          // Ping -> Pong
          sendWsFrame(socket, 0xa, unmasked);
        } else if (opcode === 0x1 || opcode === 0x0) {
          // Text or Continuation frame
          messageFragments.push(unmasked);
          if (isFin) {
            const fullMessage = Buffer.concat(messageFragments).toString("utf8");
            messageFragments = [];
            handleExtensionMessage(fullMessage);
          }
        }
      }
    });

    socket.on("close", () => {
      console.log("[Bridge] Extension connection disconnected.");
      if (extensionWs === socket) extensionWs = null;
    });

    socket.on("error", (err) => {
      console.error("[Bridge] Socket error:", err.message);
      if (extensionWs === socket) extensionWs = null;
    });
  });
}

function sendWsFrame(socket, opcode, payload) {
  if (!socket || socket.destroyed) return;
  const payloadBuf = Buffer.isBuffer(payload) ? payload : Buffer.from(payload, "utf8");
  const len = payloadBuf.length;

  let header;
  if (len <= 125) {
    header = Buffer.from([0x80 | opcode, len]);
  } else if (len <= 65535) {
    header = Buffer.alloc(4);
    header[0] = 0x80 | opcode;
    header[1] = 126;
    header.writeUInt16BE(len, 2);
  } else {
    header = Buffer.alloc(10);
    header[0] = 0x80 | opcode;
    header[1] = 127;
    header.writeBigUInt64BE(BigInt(len), 2);
  }

  socket.write(Buffer.concat([header, payloadBuf]));
}

function handleExtensionMessage(text) {
  try {
    const data = JSON.parse(text);
    if (data.type === "REGISTER") {
      console.log("[Bridge] Registered client:", data.client, "v" + data.version);
      return;
    }
    if (data.type === "PING") {
      sendWsFrame(extensionWs, 0x1, JSON.stringify({ type: "PONG" }));
      return;
    }

    if (data.id && pendingRequests.has(data.id)) {
      const { resolve, reject, timer } = pendingRequests.get(data.id);
      clearTimeout(timer);
      pendingRequests.delete(data.id);

      if (data.success) {
        resolve(data.result);
      } else {
        reject(new Error(data.error || "Extension command failed"));
      }
    }
  } catch (err) {
    console.error("[Bridge] Error parsing extension message:", err.message);
  }
}

function executeOnExtension(command, params = {}, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    if (!extensionWs || extensionWs.destroyed) {
      return reject(new Error("Chrome Extension is not connected. Please ensure Chrome is open with the Antigravity extension loaded."));
    }

    const id = crypto.randomUUID();
    const timer = setTimeout(() => {
      pendingRequests.delete(id);
      reject(new Error(`Command '${command}' timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    pendingRequests.set(id, { resolve, reject, timer });

    const payload = JSON.stringify({ id, command, params });
    sendWsFrame(extensionWs, 0x1, payload);
  });
}

// --- HTTP REST API Server ---
const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  res.setHeader("Content-Type", "application/json");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  const url = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const pathname = url.pathname;

  // Helper to read JSON body
  const readBody = () => new Promise((resolve) => {
    let body = "";
    req.on("data", chunk => body += chunk);
    req.on("end", () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch (_) { resolve({}); }
    });
  });

  try {
    if (req.method === "GET" && pathname === "/status") {
      res.writeHead(200);
      return res.end(JSON.stringify({
        status: "ok",
        connected: Boolean(extensionWs && !extensionWs.destroyed),
        port: PORT
      }));
    }

    if (req.method === "GET" && pathname === "/tabs") {
      const result = await executeOnExtension("list_tabs");
      res.writeHead(200);
      return res.end(JSON.stringify(result));
    }

    if (req.method === "POST" && pathname === "/tab/focus") {
      const body = await readBody();
      const result = await executeOnExtension("focus_tab", body);
      res.writeHead(200);
      return res.end(JSON.stringify(result));
    }

    if (req.method === "POST" && pathname === "/navigate") {
      const body = await readBody();
      const result = await executeOnExtension("navigate", body);
      res.writeHead(200);
      return res.end(JSON.stringify(result));
    }

    if (req.method === "POST" && pathname === "/click") {
      const body = await readBody();
      const result = await executeOnExtension("click", body);
      res.writeHead(200);
      return res.end(JSON.stringify(result));
    }

    if (req.method === "POST" && pathname === "/type") {
      const body = await readBody();
      const result = await executeOnExtension("type", body);
      res.writeHead(200);
      return res.end(JSON.stringify(result));
    }

    if (req.method === "POST" && pathname === "/dom") {
      const body = await readBody();
      const result = await executeOnExtension("get_dom", body);
      res.writeHead(200);
      return res.end(JSON.stringify(result));
    }

    if (req.method === "POST" && pathname === "/screenshot") {
      const body = await readBody();
      const result = await executeOnExtension("screenshot", body);
      res.writeHead(200);
      return res.end(JSON.stringify(result));
    }

    if (req.method === "POST" && pathname === "/eval") {
      const body = await readBody();
      const result = await executeOnExtension("eval", body);
      res.writeHead(200);
      return res.end(JSON.stringify({ result }));
    }

    res.writeHead(404);
    res.end(JSON.stringify({ error: "Endpoint not found" }));
  } catch (err) {
    res.writeHead(500);
    res.end(JSON.stringify({ error: err.message || String(err) }));
  }
});

setupWebSocketServer(server);

server.listen(PORT, "127.0.0.1", () => {
  console.log(`====================================================`);
  console.log(`🚀 Antigravity Browser Bridge Server Running!`);
  console.log(`📡 URL: http://127.0.0.1:${PORT}`);
  console.log(`⚡ WebSocket: ws://127.0.0.1:${PORT}`);
  console.log(`====================================================`);
});
