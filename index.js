const TelegramBot = require('node-telegram-bot-api');
const { BOT_TOKEN } = require('./config');

const tambahNasabah = require('./tambahNasabah');
const lanjutPinjaman = require('./lanjutPinjaman');
const { listNasabah, setorAngsuran } = require('./listNasabah');
const bukuAngsuran = require('./bukuAngsuran');
const { nasabahMacet, setMacet, unsetMacet } = require('./nasabahMacet');

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Menu utama
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, 
`Menu Bot Koperasi:
/tambahnasabah Nama;NoKTP;Alamat
/lanjutpinjaman [id_nasabah] [nominal]
/listnasabah
/setorangsuran [id_nasabah]
/bukuangsuran [id_nasabah]
/nasabahmacet
/setmacet [id_nasabah]
/unsetmacet [id_nasabah]`);
});

// Command utama
bot.onText(/\/tambahnasabah (.+)/, tambahNasabah.bind(null, bot));
bot.onText(/\/lanjutpinjaman (\d+) (\d+)/, lanjutPinjaman.bind(null, bot));
bot.onText(/\/listnasabah/, listNasabah.bind(null, bot));
bot.onText(/\/setorangsuran (\d+)/, setorAngsuran.bind(null, bot));
bot.onText(/\/bukuangsuran (\d+)/, bukuAngsuran.bind(null, bot));
bot.onText(/\/nasabahmacet/, nasabahMacet.bind(null, bot));
bot.onText(/\/setmacet (\d+)/, setMacet.bind(null, bot));
bot.onText(/\/unsetmacet (\d+)/, unsetMacet.bind(null, bot));
