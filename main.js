import puppeteer from 'puppeteer-extra';
import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import randomUserAgent from 'user-agents';
import fs from 'fs';

// Gunakan stealth mode agar tidak terdeteksi sebagai bot
puppeteer.use(StealthPlugin());

// Fungsi untuk membaca password dari file password.txt
const getPassword = () => {
    try {
        console.log(chalk.blue('🔑 Membaca password dari file password.txt...'));
        const password = fs.readFileSync('password.txt', 'utf8').trim();
        return password || 'password123';
    } catch (error) {
        console.warn(chalk.yellow('⚠️ File password.txt tidak ditemukan! Menggunakan password default.'));
        return 'password123';
    }
};

// Fungsi untuk membuat akun CapCut
const createCapCutAccount = async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Gunakan User-Agent random
    await page.setUserAgent(new randomUserAgent().toString());

    // Atur viewport secara acak
    await page.setViewport({
        width: Math.floor(Math.random() * (1920 - 1280) + 1280),
        height: Math.floor(Math.random() * (1080 - 720) + 720),
        deviceScaleFactor: 1,
        hasTouch: false,
        isMobile: false
    });

    // Ambil email dari Temp-Mail
    const emailSpinner = ora(chalk.blue('Mendapatkan email dari Temp-Mail...')).start();
    let email = '';

    try {
        const response = await axios.post('https://api.internal.temp-mail.io/api/v3/email/new', {
            min_name_length: 10,
            max_name_length: 10
        }, { headers: { 'Content-Type': 'application/json' } });

        email = response.data.email;
        emailSpinner.succeed(chalk.green(`Email yang digunakan: ${email}`));
    } catch (error) {
        emailSpinner.fail(chalk.red('Gagal mendapatkan email!'));
        console.error(error);
        return;
    }

    // Dapatkan password dari file password.txt
    const password = getPassword();

    // Mulai proses pendaftaran di CapCut
    const signupSpinner = ora(chalk.blue('Membuka halaman signup CapCut...')).start();
    await page.goto('https://www.capcut.com/id-id/signup', { waitUntil: 'networkidle2' });
    signupSpinner.succeed(chalk.green('Halaman signup dibuka!'));

    const inputSpinner = ora(chalk.blue('Mengisi email...')).start();
    // Isi email
    await page.type('input[name="signUsername"]', email, { delay: 100 });

    // Klik tombol lanjut
    await page.waitForSelector('.lv_sign_in_panel_wide-primary-button', { visible: true });
    await page.click('.lv_sign_in_panel_wide-primary-button');

    inputSpinner.succeed(chalk.green('Berhasil mengisi email!'));

    // Isi password
    await page.waitForSelector('input[type="password"]', { visible: true });
    await page.type('input[type="password"]', password, { delay: 100 });

    // Klik tombol daftar
    await page.waitForSelector('.lv_sign_in_panel_wide-sign-in-button', { visible: true });
    await page.click('.lv_sign_in_panel_wide-sign-in-button');

    // Tunggu hingga input tanggal lahir muncul
    await page.waitForSelector('.gate_birthday-picker-input', { visible: true });

    // Fungsi untuk mendapatkan angka acak dalam rentang tertentu
    const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

    // Tahun acak antara 1990 - 2005
    const randomYear = getRandomInt(1990, 2005);

    // Daftar bulan dan jumlah hari
    const months = [
        { name: "Januari", days: 31 },
        { name: "Februari", days: 28 },
        { name: "Maret", days: 31 },
        { name: "April", days: 30 },
        { name: "Mei", days: 31 },
        { name: "Juni", days: 30 },
        { name: "Juli", days: 31 },
        { name: "Agustus", days: 31 },
        { name: "September", days: 30 },
        { name: "Oktober", days: 31 },
        { name: "November", days: 30 },
        { name: "Desember", days: 31 }
    ];

    // Pilih bulan acak
    const randomMonthIndex = getRandomInt(0, months.length - 1);
    const randomMonth = months[randomMonthIndex].name;

    // Pilih hari acak sesuai bulan
    const randomDay = getRandomInt(1, months[randomMonthIndex].days);

    // Isi tahun lahir dengan nilai acak
    await page.type('.gate_birthday-picker-input', String(randomYear), { delay: 100 });

    // Pilih dropdown bulan
    await page.click('.gate_birthday-picker-selector:nth-of-type(1)');
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.waitForSelector('.lv-select-popup li', { visible: true });

    // Pilih bulan acak dari dropdown
    await page.evaluate((randomMonth) => {
        let items = document.querySelectorAll('.lv-select-popup li');
        items.forEach(item => {
            if (item.innerText.trim() === randomMonth) {
                item.click();
            }
        });
    }, randomMonth);

    // Pilih dropdown hari
    await page.click('.gate_birthday-picker-selector:nth-of-type(2)');
    await new Promise(resolve => setTimeout(resolve, 500));
    await page.waitForSelector('.lv-select-popup li', { visible: true });

    // Pilih hari acak dari dropdown
    await page.evaluate((randomDay) => {
        let items = document.querySelectorAll('.lv-select-popup li');
        items.forEach(item => {
            if (item.innerText.trim() === String(randomDay)) {
                item.click();
            }
        });
    }, randomDay);

    console.log(chalk.green(`📆 Tanggal lahir yang dipilih: ${randomDay} ${randomMonth} ${randomYear}`));

    // Klik tombol "Berikutnya"
    await page.waitForSelector('.lv_sign_in_panel_wide-birthday-next', { visible: true });
    await page.click('.lv_sign_in_panel_wide-birthday-next');

    // Ambil kode OTP
    const otpSpinner = ora(chalk.blue('Menunggu kode OTP dari email...')).start();
    let otpCode = '';
    try {
        let otpResponse;
        let attempts = 0;
        do {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Tunggu 5 detik
            otpResponse = await axios.get(`https://api.internal.temp-mail.io/api/v3/email/${email}/messages`);
            attempts++;
        } while (otpResponse.data.length === 0 && attempts < 10); // Max 10 kali (50 detik)

        if (otpResponse.data.length > 0) {
            const latestEmail = otpResponse.data[0];
            const match = latestEmail.body_text.match(/(\d{6})/);
            if (match) {
                otpCode = match[1];
                otpSpinner.succeed(chalk.green(`📩 Kode OTP yang diterima: ${otpCode}`));
            } else {
                otpSpinner.fail(chalk.red('Kode OTP tidak ditemukan dalam email.'));
                return;
            }
        } else {
            otpSpinner.fail(chalk.red('Tidak ada email masuk setelah 50 detik.'));
            return;
        }
    } catch (error) {
        otpSpinner.fail(chalk.red('Gagal mengambil kode OTP!'));
        console.error(error);
        return;
    }

    // Masukkan kode OTP
    await page.type('input.lv-input', otpCode, { delay: 100 });

    console.log(chalk.green('✅ Kode OTP dimasukkan dan verifikasi berhasil!'));

    // Simpan ke file accounts.txt
    const accountData = `Email: ${email}\nPassword: ${password}\nTanggal Lahir: ${randomDay} ${randomMonth} ${randomYear}\n----------------------\n`;
    fs.appendFileSync('accounts.txt', accountData, 'utf8');

    console.log(chalk.green(`💾 Akun berhasil disimpan ke accounts.txt!`));

    // Tutup browser
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Screenshot hasil akhir (opsional)
    // await page.screenshot({ path: 'after-verification.png' });
    await browser.close();
};
// Jalankan fungsi utama
(async () => {
    await createCapCutAccount();
})();