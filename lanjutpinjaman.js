const { nasabahList, pinjamanList } = require('./data');
const { GROUP_ID, PETUGAS_NAMA } = require('./config');
const { formatRupiah, today } = require('./helpers');

module.exports = function lanjutPinjaman(bot, msg, match) {
  const chatId = msg.chat.id;
  const nasabahId = parseInt(match[1]);
  const nominal = parseInt(match[2]);
  const tenor = 24;
  const nasabah = nasabahList.find(n => n.id === nasabahId);
  if (!nasabah) {
    bot.sendMessage(chatId, 'Nasabah tidak ditemukan.');
    return;
  }
  nasabah.pinjaman = nominal;
  nasabah.saldo = nominal;
  nasabah.angsuranPerHari = Math.floor(nominal / tenor);
  nasabah.sisaHari = tenor;
  pinjamanList.push({
    nasabahId,
    nominal,
    tanggal: today(),
    tenor
  });
  bot.sendMessage(chatId, `Pinjaman baru untuk ${nasabah.nama}, ${formatRupiah(nominal)}.\nAngsuran per hari: ${formatRupiah(nasabah.angsuranPerHari)}.`);
  bot.sendMessage(GROUP_ID, `📢 LANJUT PINJAMAN!\nNama: ${nasabah.nama}\nNominal: ${formatRupiah(nominal)}\nTanggal: ${today()}\nPetugas: ${PETUGAS_NAMA}`);
};
