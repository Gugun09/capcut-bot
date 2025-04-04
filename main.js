import puppeteer from 'puppeteer-extra';
import axios from 'axios';
import chalk from 'chalk';
import ora from 'ora';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import randomUserAgent from 'user-agents';
import fs from 'fs';
import readline from 'readline';

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
const createCapCutAccount = async (accountNumber, totalAccounts) => {
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

    console.log(chalk.magenta(`\n🚀 Memproses akun ${accountNumber} dari ${totalAccounts}`));

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
        await browser.close();
        return null;
    }

    // Dapatkan password dari file password.txt
    const password = getPassword();

    // Mulai proses pendaftaran di CapCut
    const signupSpinner = ora(chalk.blue('Membuka halaman signup CapCut...')).start();
    try {
        await page.goto('https://www.capcut.com/id-id/signup', { waitUntil: 'networkidle2', timeout: 60000 });
        signupSpinner.succeed(chalk.green('Halaman signup dibuka!'));
    } catch (error) {
        signupSpinner.fail(chalk.red('Gagal membuka halaman signup!'));
        console.error(error);
        await browser.close();
        return null;
    }

    const inputSpinner = ora(chalk.blue('Mengisi email...')).start();
    try {
        // Isi email
        await page.type('input[name="signUsername"]', email, { delay: 100 });

        // Klik tombol lanjut
        await page.waitForSelector('.lv_sign_in_panel_wide-primary-button', { visible: true, timeout: 10000 });
        await page.click('.lv_sign_in_panel_wide-primary-button');

        inputSpinner.succeed(chalk.green('Berhasil mengisi email!'));
    } catch (error) {
        inputSpinner.fail(chalk.red('Gagal mengisi email!'));
        console.error(error);
        await browser.close();
        return null;
    }

    // Isi password
    try {
        await page.waitForSelector('input[type="password"]', { visible: true, timeout: 10000 });
        await page.type('input[type="password"]', password, { delay: 100 });

        // Klik tombol daftar
        await page.waitForSelector('.lv_sign_in_panel_wide-sign-in-button', { visible: true, timeout: 10000 });
        await page.click('.lv_sign_in_panel_wide-sign-in-button');
    } catch (error) {
        console.error(chalk.red('Gagal dalam proses pendaftaran!'));
        console.error(error);
        await browser.close();
        return null;
    }

    // Tunggu hingga input tanggal lahir muncul
    try {
        await page.waitForSelector('.gate_birthday-picker-input', { visible: true, timeout: 10000 });
    } catch (error) {
        console.error(chalk.red('Gagal memuat halaman tanggal lahir!'));
        console.error(error);
        await browser.close();
        return null;
    }

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
    try {
        await page.type('.gate_birthday-picker-input', String(randomYear), { delay: 100 });

        // Pilih dropdown bulan
        await page.click('.gate_birthday-picker-selector:nth-of-type(1)');
        await new Promise(resolve => setTimeout(resolve, 500));
        await page.waitForSelector('.lv-select-popup li', { visible: true, timeout: 5000 });

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
        await page.waitForSelector('.lv-select-popup li', { visible: true, timeout: 5000 });

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
        await page.waitForSelector('.lv_sign_in_panel_wide-birthday-next', { visible: true, timeout: 5000 });
        await page.click('.lv_sign_in_panel_wide-birthday-next');
    } catch (error) {
        console.error(chalk.red('Gagal mengisi tanggal lahir!'));
        console.error(error);
        await browser.close();
        return null;
    }

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
                await browser.close();
                return null;
            }
        } else {
            otpSpinner.fail(chalk.red('Tidak ada email masuk setelah 50 detik.'));
            await browser.close();
            return null;
        }
    } catch (error) {
        otpSpinner.fail(chalk.red('Gagal mengambil kode OTP!'));
        console.error(error);
        await browser.close();
        return null;
    }

    // Masukkan kode OTP
    try {
        await page.waitForSelector('input.lv-input', { visible: true, timeout: 10000 });
        await page.type('input.lv-input', otpCode, { delay: 100 });
        console.log(chalk.green('✅ Kode OTP dimasukkan dan verifikasi berhasil!'));
    } catch (error) {
        console.error(chalk.red('Gagal memasukkan kode OTP!'));
        console.error(error);
        await browser.close();
        return null;
    }

    // Simpan ke file accounts.txt
    const accountData = `Akun #${accountNumber}\nEmail: ${email}\nPassword: ${password}\nTanggal Lahir: ${randomDay} ${randomMonth} ${randomYear}\n----------------------\n`;
    fs.appendFileSync('accounts.txt', accountData, 'utf8');

    console.log(chalk.green(`💾 Akun berhasil disimpan ke accounts.txt!`));

    // Tunggu beberapa detik sebelum menutup
    await new Promise(resolve => setTimeout(resolve, 3000));
    await browser.close();

    return { email, password, birthDate: `${randomDay} ${randomMonth} ${randomYear}` };
};

// Fungsi untuk menanyakan jumlah akun yang ingin dibuat
const askForAccountCount = () => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise(resolve => {
        rl.question(chalk.blue('🛠️  Berapa banyak akun yang ingin dibuat? '), (answer) => {
            rl.close();
            const count = parseInt(answer);
            resolve(isNaN(count) || count < 1 ? 1 : count);
        });
    });
};

// Fungsi utama
const main = async () => {
    console.log(chalk.yellow.bold('\n🎬 CAPCUT ACCOUNT CREATOR 🎬\n'));
    
    const totalAccounts = await askForAccountCount();
    console.log(chalk.cyan(`\n🔧 Akan membuat ${totalAccounts} akun CapCut...\n`));

    const successfulAccounts = [];
    
    for (let i = 1; i <= totalAccounts; i++) {
        const account = await createCapCutAccount(i, totalAccounts);
        if (account) {
            successfulAccounts.push(account);
        }
        
        // Jeda acak antara akun (3-10 detik)
        if (i < totalAccounts) {
            const delay = Math.floor(Math.random() * 7000) + 3000;
            console.log(chalk.blue(`⏳ Menunggu ${delay/1000} detik sebelum membuat akun berikutnya...`));
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }

    console.log(chalk.green.bold('\n✨ PROSES SELESAI! ✨'));
    console.log(chalk.green(`Berhasil membuat ${successfulAccounts.length} dari ${totalAccounts} akun.\n`));
    
    if (successfulAccounts.length > 0) {
        console.log(chalk.cyan('📝 Daftar akun yang berhasil dibuat:'));
        successfulAccounts.forEach((acc, index) => {
            console.log(chalk.cyan(`\nAkun #${index + 1}:`));
            console.log(chalk.cyan(`Email: ${acc.email}`));
            console.log(chalk.cyan(`Password: ${acc.password}`));
            console.log(chalk.cyan(`Tanggal Lahir: ${acc.birthDate}`));
        });
    }
};

// Jalankan program
main().catch(console.error);