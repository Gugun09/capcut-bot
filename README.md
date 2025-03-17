# 🤖 CapCut Account Creator Bot

Bot otomatis untuk membuat akun CapCut menggunakan Puppeteer dan Temp-Mail API.

## 📌 Fitur
- 🔹 **Membuat akun CapCut otomatis** menggunakan email dari Temp-Mail.
- 🔹 **Menggunakan Puppeteer Extra** dengan plugin Stealth untuk menghindari deteksi bot.
- 🔹 **User-Agent Acak** agar setiap akun dibuat dengan fingerprint browser yang berbeda.
- 🔹 **Membaca password dari file** `password.txt` agar mudah dikonfigurasi.
- 🔹 **Menyimpan akun yang berhasil didaftarkan** ke dalam file `accounts.txt`.

## 🚀 Instalasi
Pastikan kamu sudah menginstal **Node.js** di sistemmu.

```sh
# Clone repository ini
git clone https://github.com/Gugun09/capcut-bot.git
cd capcut-bot

# Install dependensi
npm install
```

## 🔧 Konfigurasi
1. **Buat file `password.txt`** di dalam folder project dan isi dengan password yang ingin digunakan.
2. **Jalankan bot:**

```sh
npm start
```

## 📄 Struktur File
```
capcut-bot/
├── accounts.txt          # Menyimpan akun yang berhasil dibuat
├── password.txt          # Menyimpan password untuk akun
├── main.js               # File utama bot
├── package.json          # Dependensi proyek
├── README.md             # Dokumentasi proyek
```

## 📜 Lisensi
Proyek ini dirilis di bawah lisensi **MIT**. Silakan gunakan dengan bebas! 😊

