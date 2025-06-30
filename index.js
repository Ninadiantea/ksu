const TelegramBot = require('node-telegram-bot-api');
const { BOT_TOKEN, USERS } = require('./config');
const { setSession, getSession, clearSession } = require('./session');

// Import fitur sesuai role (petugas/pengawas)
const tambahNasabah = require('./tambahNasabah');
const lanjutPinjaman = require('./lanjutPinjaman');
const { listNasabah, setorAngsuran } = require('./listNasabah');
const bukuAngsuran = require('./bukuAngsuran');
const { nasabahMacet } = require('./nasabahMacet');

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Untuk menampung state user saat proses login
const loginState = {}; // { [userId]: { step, role, tmpUsername } }

function sendLoginMenu(chatId) {
  const keyboard = {
    inline_keyboard: [
      [
        { text: '🔑 Login Petugas Lapangan', callback_data: 'login_petugas' },
        { text: '🕵️‍♂️ Login Pengawas', callback_data: 'login_pengawas' }
      ]
    ]
  };
  bot.sendMessage(chatId, 'Silakan pilih tipe login:', { reply_markup: keyboard });
}

// MENU UTAMA BERDASAR ROLE
function sendMenuUtama(chatId, session) {
  if (!session) return sendLoginMenu(chatId);
  if (session.role === 'petugas') {
    const keyboard = {
      inline_keyboard: [
        [
          { text: '➕ Tambah Nasabah', callback_data: 'mnu_tambah_nasabah' },
          { text: '💸 Lanjut Pinjaman', callback_data: 'mnu_lanjut_pinjaman' }
        ],
        [
          { text: '📋 List Nasabah', callback_data: 'mnu_list_nasabah' },
          { text: '✅ Setor Angsuran', callback_data: 'mnu_setor_angsuran' }
        ],
        [
          { text: '⚠️ Nasabah Macet', callback_data: 'mnu_nasabah_macet' }
        ],
        [
          { text: '🔓 Logout', callback_data: 'logout' }
        ]
      ]
    };
    bot.sendMessage(chatId, `Halo, ${session.displayName}! Pilih menu:`, { reply_markup: keyboard });
  } else if (session.role === 'pengawas') {
    const keyboard = {
      inline_keyboard: [
        [
          { text: '📊 Lihat Rekap Pembayaran', callback_data: 'mnu_rekap' }
        ],
        [
          { text: '📋 List Semua Nasabah', callback_data: 'mnu_list_nasabah' }
        ],
        [
          { text: '⚠️ Daftar Nasabah Macet', callback_data: 'mnu_nasabah_macet' }
        ],
        [
          { text: '🔓 Logout', callback_data: 'logout' }
        ]
      ]
    };
    bot.sendMessage(chatId, `Halo, ${session.displayName}! Pilih menu:`, { reply_markup: keyboard });
  }
}

// /start
bot.onText(/\/start/, (msg) => {
  clearSession(msg.from.id);
  sendLoginMenu(msg.chat.id);
});

// Proses klik tombol login
bot.on('callback_query', (query) => {
  const userId = query.from.id;
  const chatId = query.message.chat.id;
  const session = getSession(userId);

  // Jika belum login, handle proses login
  if (!session) {
    if (query.data === 'login_petugas') {
      loginState[userId] = { step: 1, role: 'petugas' };
      bot.sendMessage(chatId, 'Masukkan username Petugas Lapangan:');
    } else if (query.data === 'login_pengawas') {
      loginState[userId] = { step: 1, role: 'pengawas' };
      bot.sendMessage(chatId, 'Masukkan username Pengawas:');
    }
    bot.answerCallbackQuery(query.id);
    return;
  }

  // Jika sudah login, handle menu utama
  switch (query.data) {
    case 'logout':
      clearSession(userId);
      bot.sendMessage(chatId, 'Logout berhasil.');
      sendLoginMenu(chatId);
      break;
    // Menu petugas
    case 'mnu_tambah_nasabah':
      bot.sendMessage(chatId, 'Kirim data nasabah baru dengan format:\n/tambahnasabah Nama;NoKTP;Alamat');
      break;
    case 'mnu_lanjut_pinjaman':
      bot.sendMessage(chatId, 'Kirim perintah:\n/lanjutpinjaman [id_nasabah] [nominal]');
      break;
    case 'mnu_list_nasabah':
      listNasabah(bot, query.message);
      break;
    case 'mnu_setor_angsuran':
      bot.sendMessage(chatId, 'Kirim perintah:\n/setorangsuran [id_nasabah]');
      break;
    case 'mnu_nasabah_macet':
      nasabahMacet(bot, query.message);
      break;
    // Menu pengawas
    case 'mnu_rekap':
      bot.sendMessage(chatId, 'Fitur rekap pembayaran hanya untuk demo.'); // Tambahkan fitur sesuai kebutuhan
      break;
    default:
      bot.sendMessage(chatId, 'Menu tidak dikenal.');
  }
  bot.answerCallbackQuery(query.id);
});

// Proses login (username & password)
bot.on('message', (msg) => {
  const userId = msg.from.id;
  const chatId = msg.chat.id;

  // Hanya proses jika user sedang dalam tahap login
  if (!(userId in loginState)) return;
  const state = loginState[userId];

  if (state.step === 1) {
    state.tmpUsername = msg.text.trim();
    state.step = 2;
    bot.sendMessage(chatId, 'Masukkan password:');
    return;
  }
  if (state.step === 2) {
    const user = USERS.find(
      u => u.username === state.tmpUsername && u.role === state.role && u.password === msg.text.trim()
    );
    if (!user) {
      bot.sendMessage(chatId, 'Login gagal, username atau password salah. Ulangi login.');
      delete loginState[userId];
      sendLoginMenu(chatId);
      return;
    }
    setSession(userId, { role: user.role, displayName: user.displayName, username: user.username });
    bot.sendMessage(chatId, `Login berhasil sebagai ${user.displayName}!`);
    sendMenuUtama(chatId, getSession(userId));
    delete loginState[userId];
  }
});

// Fitur hanya bisa diakses setelah login, jadi command tetap dicek session
bot.onText(/\/tambahnasabah (.+)/, (msg, match) => {
  const session = getSession(msg.from.id);
  if (!session || session.role !== 'petugas') return sendLoginMenu(msg.chat.id);
  tambahNasabah(bot, msg, match);
});
bot.onText(/\/lanjutpinjaman (\d+) (\d+)/, (msg, match) => {
  const session = getSession(msg.from.id);
  if (!session || session.role !== 'petugas') return sendLoginMenu(msg.chat.id);
  lanjutPinjaman(bot, msg, match);
});
bot.onText(/\/listnasabah/, (msg) => {
  const session = getSession(msg.from.id);
  if (!session) return sendLoginMenu(msg.chat.id);
  listNasabah(bot, msg);
});
bot.onText(/\/setorangsuran (\d+)/, (msg, match) => {
  const session = getSession(msg.from.id);
  if (!session || session.role !== 'petugas') return sendLoginMenu(msg.chat.id);
  setorAngsuran(bot, msg, match);
});
bot.onText(/\/bukuangsuran (\d+)/, (msg, match) => {
  const session = getSession(msg.from.id);
  if (!session) return sendLoginMenu(msg.chat.id);
  bukuAngsuran(bot, msg, match);
});
bot.onText(/\/nasabahmacet/, (msg) => {
  const session = getSession(msg.from.id);
  if (!session) return sendLoginMenu(msg.chat.id);
  nasabahMacet(bot, msg);
});
