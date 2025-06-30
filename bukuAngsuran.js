const { logPembayaran, nasabahList } = require('./data');
const { formatRupiah } = require('./helpers');

module.exports = function bukuAngsuran(bot, msg, match) {
  const chatId = msg.chat.id;
  const nasabahId = parseInt(match[1]);
  const nasabah = nasabahList.find(n => n.id === nasabahId);
  if (!nasabah) {
    bot.sendMessage(chatId, 'Nasabah tidak ditemukan.');
    return;
  }
  const logs = logPembayaran.filter(l => l.nasabahId === nasabahId);
  let totalSetor = 0;
  let sisaSaldo = nasabah.pinjaman;
  let sisaAngs = 24;
  let text = `Buku Angsuran - ${nasabah.nama}\n`;
  text += `-------------------------------------------------------------------------------------\n`;
  text += `No.  Tanggal      Nominal      Petugas   Sisa Angsuran  Total Setoran  Sisa Saldo\n`;
  logs.forEach((l, i) => {
    totalSetor += l.nominal;
    sisaSaldo -= l.nominal;
    sisaAngs -= 1;
    text += `${i+1}    ${l.tanggal}   ${formatRupiah(l.nominal)}     ${l.petugas}      ${sisaAngs}             ${formatRupiah(totalSetor)}       ${formatRupiah(sisaSaldo)}\n`;
  });
  if (logs.length === 0) text += "Belum ada pembayaran.\n";
  bot.sendMessage(chatId, `\`\`\`\n${text}\n\`\`\``, { parse_mode: "Markdown" });
};
