# Antigravity Browser Bridge 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Chrome Manifest V3](https://img.shields.io/badge/Chrome-Manifest%20V3-emerald.svg)](manifest.json)
[![Node.js](https://img.shields.io/badge/Node.js-Zero--Dependencies-success.svg)](package.json)
[![Protocol](https://img.shields.io/badge/Protocol-Chrome%20DevTools%20(CDP)-orange.svg)](https://chromedevtools.github.io/devtools-protocol/)

> **Next-Generation Visual AI Browser Controller untuk Antigravity IDE, Claude Code, dan Agent AI Lokal.**  
> Mengontrol Google Chrome asli pengguna secara langsung dengan **Native Chrome DevTools Protocol (CDP)**, **Set-of-Mark (SoM) Tagging**, **In-Page AI Omnibar**, dan **Visual Laser Cursor Animation**. Tanpa sandbox headless terisolasi, tanpa risiko membocorkan kredensial ke cloud, dan tanpa biaya langganan bulanan.

[🇬🇧 Read English Documentation](README.md) | [📖 Pusat Dokumentasi Lengkap](docs/INSTALLATION.md)

---

## ⚡ Mengapa Antigravity Browser Bridge?

Memberikan AI kendali atas browser biasanya menuntut kompromi yang berat: membayar **$200/bulan untuk cloud VM** (seperti OpenAI Operator) sambil menyerahkan kata sandi perbankan/Google Ads ke cloud pihak ketiga, atau memakai **skrip headless yang rapuh** (seperti Puppeteer/Playwright) yang sering diblokir oleh anti-bot Cloudflare dan Google.

**Antigravity Browser Bridge menghilangkan kompromi tersebut.** Ekstensi ini menghubungkan agent AI lokal langsung ke Google Chrome harian Anda yang sudah login melalui server bridge lokal tanpa dependensi dan native Chrome DevTools Protocol.

### 📊 Tabel Perbandingan dengan ChatGPT & Alternatif Lain

| Fitur / Dimensi | 🚀 Antigravity Browser Bridge | 🌐 ChatGPT Plus Browsing | ☁️ OpenAI Operator / Cloud VMs | 💻 ChatGPT Desktop App | 🎭 Puppeteer / Playwright |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Lokasi Eksekusi** | **100% Localhost** (`127.0.0.1`) | Server cloud remote | Cloud Virtual Machine | Lokal macOS/Windows | Lokal / Cloud server |
| **Pakai Sesi Login Aktif** | **Langsung Aktif** (Pakai Chrome harian) | ❌ Tidak bisa (Tanpa sesi) | ⚠️ Harus ketik sandi di cloud VM | ⚠️ Terbatas jendela aktif | ❌ Butuh login ulang / impor cookies |
| **Akurasi Penargetan** | **Set-of-Mark (SoM) Badge Angka** | ❌ Tidak ada | ⚠️ Tebakan koordinat piksel (meleset 10–20px) | Accessibility tree | CSS / XPath saja |
| **Jenis Event Input** | **True Native CDP** (`isTrusted: true`) | ❌ Hanya baca (Tanpa aksi) | Event sintetis remote VM | OS Accessibility API | Event sintetis JS / CDP |
| **Penanganan Anti-Bot & 2FA**| **🤝 Stealth Human Handshake** (Chime + Auto-Resume) | ❌ Diblokir Cloudflare | Kerap terdeteksi bot | N/A | Sering terdeteksi bot |
| **Command Bar di Halaman** | **💬 Floating Omnibar (`Cmd+Shift+K`)** | ❌ Tidak ada | ❌ Tidak ada | ❌ Tidak ada | ❌ Tidak ada |
| **Perekam Alur Kerja** | **⏺️ CDP Macro Recorder** | ❌ Tidak ada | ❌ Tidak ada | ❌ Tidak ada | Rekam kode saja |
| **Pencegah Kesalahan** | **🚨 Guardrail Hover & Confirm** | ❌ Tidak ada | ❌ Tidak ada | ❌ Tidak ada | ❌ Tidak ada |
| **Privasi Kredensial** | **Nol Kebocoran Cloud** (Socket lokal) | Data terkirim ke OpenAI | Kredensial terbuka di cloud | Tangkapan layar ke cloud | Lokal (Kode sendiri) |
| **Biaya & Batasan Kuota** | **100% Gratis & Bebas** (MIT) | $20/bulan + limit kuota | $200/bulan Pro + batas ketat | $20/bulan | Gratis (Hanya perkakas) |
| **Dukungan Agent AI** | **Universal** (Antigravity, Claude, Python) | Hanya antarmuka ChatGPT | Ekosistem OpenAI saja | Antarmuka ChatGPT saja | Semua bahasa pemrograman |

---

## 🌟 5 Fitur Tercanggih (Killer Features)

1. **🏷️ Set-of-Mark (SoM) Interactive Tagging:**
   - Menempelkan badge angka bercahaya (`[1]`, `[2]`, `[3]`) langsung di atas tombol pada layar.
   - Menghilangkan salah klik dan koordinat meleset; klik pasti dengan `browser.clickBadge(4)`.
2. **🤝 Stealth Human Handshake (Anti-Bot & 2FA Co-Pilot):**
   - Mendeteksi otomatis Cloudflare Turnstile, reCAPTCHA, atau kode OTP 2FA.
   - Menjeda eksekusi sementara, membunyikan nada lembut, mengubah kursor menjadi amber, dan otomatis lanjut seketika Anda menyelesaikan verifikasi.
3. **💬 In-Page Floating AI Omnibar (`Cmd+Shift+K`):**
   - Tekan `Cmd+Shift+K` (Mac) atau `Ctrl+Shift+K` (Windows) pada tab manapun untuk membuka HUD bar melayang tanpa perlu membuka sidebar.
4. **⏺️ Perekam Makro CDP Sekali Klik ("Demonstrate & Automate"):**
   - Rekam aksi klik dan ketik manual Anda di Chrome, lalu ekspor menjadi skrip otomatisasi yang siap diulang oleh AI.
5. **🚨 Financial & Safety Guardrails ("Hover & Confirm"):**
   - Mencegah klik berbahaya (`Delete`, `Bayar`, budget tinggi) dengan kursor merah berkedip yang menunggu konfirmasi spasi/klik dari manusia.

---

## 📚 Pusat Panduan (Docs Hub)

- 🛠️ **[Panduan Pemasangan & Setup](docs/INSTALLATION.md)** — Langkah lengkap untuk macOS, Windows, dan Linux.
- 🚀 **[Panduan Fitur Lanjutan](docs/FEATURES.md)** — Pembahasan detail SoM, Handshake, Omnibar, dan Guardrail.
- 🔌 **[Integrasi Agent AI](docs/INTEGRATIONS.md)** — Contoh kode untuk Antigravity, Claude Code, Python, dan REST.
- 🔧 **[Troubleshooting & FAQ](docs/TROUBLESHOOTING.md)** — Mengatasi kendala port, banner debugger, dan status ekstensi.

---

## 🚀 Cara Pemasangan Cepat

### Langkah 1: Jalankan Bridge Server
```bash
git clone https://github.com/rririanto/antigravity-browser-bridge.git
cd antigravity-browser-bridge

# macOS / Linux:
./start-bridge.sh

# Windows:
start-bridge.bat

# Atau via npm:
npm start
```

### Langkah 2: Pasang Ekstensi di Chrome
1. Buka `chrome://extensions` di Google Chrome.
2. Aktifkan saklar **Developer mode** di pojok kanan atas.
3. Klik tombol **Load unpacked** di pojok kiri atas.
4. Pilih folder `antigravity-browser-bridge`.
5. Ikon ekstensi akan aktif dengan badge hijau **ON**!

### Langkah 3: Uji Koneksi
```bash
npm run status
```

---

## 🧪 Pengujian Otomatis

```bash
npm test
```
Menjalankan audit sanitasi, uji siklus hidup server, dan pengujian API fitur baru.

---

## 📄 Lisensi

Proyek ini dirilis di bawah lisensi [MIT License](LICENSE) &copy; 2026 Rahmat Ramadhan Irianto.
