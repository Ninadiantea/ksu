const { nasabahList } = require('./data');
const { GROUP_ID, PETUGAS_NAMA } = require('./config');

module.exports = function tambahNasabah(bot, msg, match) {
  const chatId = msg.chat.id;
  const input = match[1].split(';');
  if (input.length < 3) {
    bot.sendMessage(chatId, 'Format: /tambahnasabah Nama;NoKTP;Alamat');
    return;
  }
  const [nama, noKtp, alamat] = input.map(x => x.trim());
  const nasabah = {
    id: nasabahList.length + 1,
    nama, noKtp, alamat,
    pinjaman: 0, saldo: 0,
    angsuranPerHari: 0, sisaHari: 0,
    macet: false
  };
  nasabahList.push(nasabah);
  bot.sendMessage(chatId, `Nasabah baru berhasil ditambah:\nNama: ${nama}\nNo KTP: ${noKtp}\nAlamat: ${alamat}`);
  bot.sendMessage(GROUP_ID, `📢 NASABAH BARU!\nNama: ${nama}\nNo KTP: ${noKtp}\nAlamat: ${alamat}\nPetugas: ${PETUGAS_NAMA}`);
};
