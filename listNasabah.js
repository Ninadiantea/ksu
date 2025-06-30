const { nasabahList, logPembayaran } = require('./data');
const { formatRupiah, today } = require('./helpers');
const { PETUGAS_NAMA } = require('./config');

function listNasabah(bot, msg) {
  let text = '*Daftar Nasabah:*\n';
  nasabahList.forEach(n => {
    text += `${n.id}. ${n.nama} | Saldo: ${formatRupiah(n.saldo)} | Sisa Angsuran: ${n.sisaHari} hari\n`;
  });
  bot.sendMessage(msg.chat.id, text, { parse_mode: "Markdown" });
}

function setorAngsuran(bot, msg, match) {
  const chatId = msg.chat.id;
  const nasabahId = parseInt(match[1]);
  const nasabah = nasabahList.find(n => n.id === nasabahId);
  if (!nasabah) {
    bot.sendMessage(chatId, 'Nasabah tidak ditemukan.');
    return;
  }
  if (nasabah.sisaHari > 0 && nasabah.saldo >= nasabah.angsuranPerHari) {
    nasabah.sisaHari -= 1;
    nasabah.saldo -= nasabah.angsuranPerHari;
    logPembayaran.push({
      nasabahId,
      nama: nasabah.nama,
      tanggal: today(),
      nominal: nasabah.angsuranPerHari,
      petugas: PETUGAS_NAMA
    });
    bot.sendMessage(chatId, `Setor angsuran berhasil untuk ${nasabah.nama}. Sisa hari: ${nasabah.sisaHari}, Sisa saldo: ${formatRupiah(nasabah.saldo)}`);
  } else {
    bot.sendMessage(chatId, 'Angsuran sudah lunas atau saldo kurang.');
  }
}

module.exports = { listNasabah, setorAngsuran };
