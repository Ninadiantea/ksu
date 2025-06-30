const TelegramBot = require('node-telegram-bot-api');
const { BOT_TOKEN } = require('./config');

const tambahNasabah = require('./tambahNasabah');
const lanjutPinjaman = require('./lanjutPinjaman');
const { listNasabah, setorAngsuran } = require('./listNasabah');
const bukuAngsuran = require('./bukuAngsuran');
const { nasabahMacet, setMacet, unsetMacet } = require('./nasabahMacet');

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// MENU UTAMA DENGAN TOMBOL/IKON
bot.onText(/\/start/, (msg) => {
  const keyboard = {
    inline_keyboard: [
      [
        { text: '➕ Tambah Nasabah', callback_data: 'menu_tambah_nasabah' },
        { text: '💸 Lanjut Pinjaman', callback_data: 'menu_lanjut_pinjaman' }
      ],
      [
        { text: '📋 List Nasabah', callback_data: 'menu_list_nasabah' },
        { text: '✅ Setor Angsuran', callback_data: 'menu_setor_angsuran' }
      ],
      [
        { text: '📖 Buku Angsuran', callback_data: 'menu_buku_angsuran' }
      ],
      [
        { text: '⚠️ Nasabah Macet', callback_data: 'menu_nasabah_macet' }
      ]
    ]
  };
  bot.sendMessage(msg.chat.id, 'Selamat datang di Bot Koperasi. Pilih menu:', { reply_markup: keyboard });
});

// HANDLER tombol menu
bot.on('callback_query', async (query) => {
  const msg = query.message;
  const chatId = msg.chat.id;

  switch (query.data) {
    case 'menu_tambah_nasabah':
      bot.sendMessage(chatId, 'Kirim data nasabah baru dengan format:\n/tambahnasabah Nama;NoKTP;Alamat');
      break;
    case 'menu_lanjut_pinjaman':
      bot.sendMessage(chatId, 'Kirim perintah:\n/lanjutpinjaman [id_nasabah] [nominal]');
      break;
    case 'menu_list_nasabah':
      listNasabah(bot, msg);
      break;
    case 'menu_setor_angsuran':
      bot.sendMessage(chatId, 'Kirim perintah:\n/setorangsuran [id_nasabah]');
      break;
    case 'menu_buku_angsuran':
      bot.sendMessage(chatId, 'Kirim perintah:\n/bukuangsuran [id_nasabah]');
      break;
    case 'menu_nasabah_macet':
      nasabahMacet(bot, msg);
      break;
    default:
      bot.sendMessage(chatId, 'Menu tidak dikenal.');
  }
  bot.answerCallbackQuery(query.id); // hapus loading pada tombol
});

// Tetap jalankan semua command manual juga!
bot.onText(/\/tambahnasabah (.+)/, tambahNasabah.bind(null, bot));
bot.onText(/\/lanjutpinjaman (\d+) (\d+)/, lanjutPinjaman.bind(null, bot));
bot.onText(/\/listnasabah/, listNasabah.bind(null, bot));
bot.onText(/\/setorangsuran (\d+)/, setorAngsuran.bind(null, bot));
bot.onText(/\/bukuangsuran (\d+)/, bukuAngsuran.bind(null, bot));
bot.onText(/\/nasabahmacet/, nasabahMacet.bind(null, bot));
bot.onText(/\/setmacet (\d+)/, setMacet.bind(null, bot));
bot.onText(/\/unsetmacet (\d+)/, unsetMacet.bind(null, bot));
