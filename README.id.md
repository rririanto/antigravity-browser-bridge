# Antigravity Browser Bridge 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Chrome Manifest V3](https://img.shields.io/badge/Chrome-Manifest%20V3-emerald.svg)](manifest.json)
[![Node.js](https://img.shields.io/badge/Node.js-Zero--Dependencies-success.svg)](package.json)
[![Protocol](https://img.shields.io/badge/Protocol-Chrome%20DevTools%20(CDP)-orange.svg)](https://chromedevtools.github.io/devtools-protocol/)

> **Next-Generation Visual AI Browser Controller untuk Antigravity IDE, Claude Code, dan Agent AI Lokal.**  
> Mengontrol Google Chrome asli pengguna secara langsung dengan **Native Chrome DevTools Protocol (CDP)** dan **Visual Laser Cursor Animation**. Tanpa sandbox headless terisolasi, tanpa risiko membocorkan kredensial ke cloud, dan tanpa biaya langganan bulanan.

[🇬🇧 Read English Documentation](README.md)

---

## ⚡ Mengapa Antigravity Browser Bridge?

Memberikan AI kendali atas browser biasanya menuntut kompromi yang berat: membayar **$200/bulan untuk cloud VM** (seperti OpenAI Operator) sambil menyerahkan kata sandi perbankan/Google Ads ke cloud pihak ketiga, atau memakai **skrip headless yang rapuh** (seperti Puppeteer/Playwright) yang sering diblokir oleh anti-bot Cloudflare dan Google.

**Antigravity Browser Bridge menghilangkan kompromi tersebut.** Ekstensi ini menghubungkan agent AI lokal langsung ke Google Chrome harian Anda yang sudah login melalui server bridge lokal tanpa dependensi dan native Chrome DevTools Protocol.

### 📊 Tabel Perbandingan dengan ChatGPT & Alternatif Lain

| Fitur / Dimensi | 🚀 Antigravity Browser Bridge | 🌐 ChatGPT Plus Browsing | ☁️ OpenAI Operator / Cloud VMs | 💻 ChatGPT Desktop App | 🎭 Puppeteer / Playwright |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Lokasi Eksekusi** | **100% Localhost** (`127.0.0.1`) | Server cloud remote | Cloud Virtual Machine | Lokal macOS/Windows | Lokal / Cloud server |
| **Pakai Sesi Login Aktif** | **Langsung Aktif** (Pakai Chrome harian) | ❌ Tidak bisa (Tanpa sesi) | ⚠️ Harus ketik sandi di cloud VM | ⚠️ Terbatas jendela aktif | ❌ Butuh login ulang / impor cookies |
| **Jenis Event Input** | **True Native CDP** (`isTrusted: true`) | ❌ Hanya baca (Tanpa aksi) | Event sintetis remote VM | OS Accessibility API | Event sintetis JS / CDP |
| **Audit Visual Manusia** | **Laser Neon Animasi & Badge** | ❌ Tidak ada | Stream video jarak jauh | ❌ Tidak ada | Headless (Gelap/tanpa visual) |
| **Penanganan Anti-Bot & 2FA**| **Mulus** (Manusia bisa bantu 2FA) | ❌ Diblokir Cloudflare | Kerap terdeteksi bot | N/A | Sering terdeteksi bot |
| **Privasi Kredensial** | **Nol Kebocoran Cloud** (Socket lokal) | Data terkirim ke OpenAI | Kredensial terbuka di cloud | Tangkapan layar ke cloud | Lokal (Kode sendiri) |
| **Biaya & Batasan Kuota** | **100% Gratis & Bebas** (MIT) | $20/bulan + limit kuota | $200/bulan Pro + batas ketat | $20/bulan | Gratis (Hanya perkakas) |
| **Dukungan Agent AI** | **Universal** (Antigravity, Claude, Python) | Hanya antarmuka ChatGPT | Ekosistem OpenAI saja | Antarmuka ChatGPT saja | Semua bahasa pemrograman |

---

## 🌟 Fitur Utama

1. **Visual Laser Cursor & Action Badges:**
   - Kursor laser neon animasi meluncur mulus (*smooth glide*) ke elemen target di layar sebelum mengklik.
   - Efek gelombang riak (*ripple wave*) yang mengonfirmasi lokasi klik secara visual.
   - Badge aksi mengambang menampilkan apa yang sedang dilakukan AI (misal: *"Mengeklik Simpan"*, *"Mengetik budget"*).
2. **True Native CDP (`chrome.debugger`):**
   - Menggunakan `chrome.debugger` API (`Input.dispatchMouseEvent`, `Input.dispatchKeyEvent`).
   - Setiap klik adalah event *trusted* (`isTrusted: true`), sehingga tidak akan diabaikan oleh aplikasi SPA (Google Ads, Angular, React).
3. **Bekerja di Sesi Login Anda:**
   - Mengontrol Google Chrome harian tanpa perlu login ulang ke Google Ads, Google Analytics, Gmail, atau portal internal.
4. **Zero-Dependency Local Bridge:**
   - Server Node.js murni berjalan di `http://127.0.0.1:8765` tanpa butuh instalasi paket berat (`npm install`).
5. **Privasi 100% Lokal:**
   - Tidak ada data yang dikirim ke cloud pihak ketiga. Semua komunikasi murni di komputer Anda (*localhost*).

---

## 🚀 Cara Pemasangan Cepat (Kurang dari 1 Menit)

### Langkah 1: Jalankan Local Bridge Server
```bash
# Clone repository
git clone https://github.com/rririanto/antigravity-browser-bridge.git
cd antigravity-browser-bridge

# Jalankan bridge server
npm start
# Atau langsung: node bridge/server.js
```
*Server akan aktif di `http://127.0.0.1:8765`.*

---

### Langkah 2: Pasang Ekstensi di Google Chrome
1. Buka **Google Chrome** dan buka: `chrome://extensions`.
2. Aktifkan saklar **Developer mode** (Mode pengembang) di pojok kanan atas.
3. Klik tombol **Load unpacked** (Muat yang belum dibongkar) di pojok kiri atas.
4. Pilih folder repository `antigravity-browser-bridge`.
5. Ikon **Antigravity Browser Bridge** akan muncul di toolbar Chrome dengan badge hijau **ON**.

---

### Langkah 3: Uji Koneksi
Jalankan skrip tes cepat ini untuk memverifikasi koneksi dan melihat daftar tab Chrome Anda:
```bash
npm run status
# Atau: node bridge/test-connection.js
```

---

## 💻 Contoh Penggunaan dari Kode

### JavaScript / Node.js
```javascript
const browser = require("./bridge/client.js");

async function main() {
  // 1. Fokuskan tab Google Ads
  await browser.focusTab({ urlContains: "ads.google.com" });

  // 2. Klik dengan animasi kursor visual laser
  await browser.click({
    text: "Simpan",
    actionLabel: "Menyimpan pengaturan kampanye"
  });

  // 3. Mengetik teks via CDP native event
  await browser.type("50000");

  // 4. Ekstrak DOM elemen interaktif
  const dom = await browser.getDOM();
  console.log("Elemen ditemukan:", dom.elements);

  // 5. Ambil screenshot layar tab
  const shot = await browser.screenshot();
}

main();
```

---

## 📁 Struktur Folder

```
antigravity-browser-bridge/
├── manifest.json              # Konfigurasi Manifest V3
├── background.js              # Service worker (Klien WebSocket + pengendali CDP)
├── content.js                 # Laser cursor overlay + resolver koordinat
├── content.css                # Styling neon laser cursor, ripple, dan badge
├── popup.html                 # UI popup ekstensi
├── popup.js                   # Indikator status koneksi popup
├── icons/                     # Ikon ekstensi (16, 48, 128)
├── start-bridge.sh            # Skrip shell sekali klik
├── package.json               # Metadata paket dan skrip pengujian
├── LICENSE                    # Lisensi MIT
├── bridge/
│   ├── server.js              # Server bridge HTTP/WebSocket lokal tanpa dependensi
│   ├── client.js              # Client library tingkat tinggi untuk agent AI
│   ├── test-connection.js     # Skrip diagnostik koneksi dan tab
│   ├── demo.js                # Demonstrasi interaktif cepat
│   └── run-live-demo.js       # Demo eksekusi visual di browser langsung
├── test/
│   ├── sanitize-check.test.js # Tes sanitasi keamanan dan path
│   └── bridge-api.test.js     # Tes otomatis siklus hidup bridge
├── README.md                  # Dokumentasi Bahasa Inggris
└── README.id.md               # Dokumentasi Bahasa Indonesia
```

---

## 🧪 Pengujian Otomatis

Jalankan rangkaian tes untuk memastikan sanitasi dan fungsi API:
```bash
npm test
```

---

## 📄 Lisensi

Proyek ini dirilis di bawah lisensi [MIT License](LICENSE) &copy; 2026 Rahmat Ramadhan Irianto.
