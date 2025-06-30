const { nasabahList } = require('./data');

function nasabahMacet(bot, msg) {
  let text = '*Daftar Nasabah Macet:*\n';
  nasabahList.filter(n => n.macet).forEach(n => {
    text += `${n.id}. ${n.nama}\n`;
  });
  if (text === '*Daftar Nasabah Macet:*\n') text += 'Tidak ada nasabah macet.';
  bot.sendMessage(msg.chat.id, text, { parse_mode: "Markdown" });
}

function setMacet(bot, msg, match) {
  const chatId = msg.chat.id;
  const nasabahId = parseInt(match[1]);
  const nasabah = nasabahList.find(n => n.id === nasabahId);
  if (!nasabah) {
    bot.sendMessage(chatId, 'Nasabah tidak ditemukan.');
    return;
  }
  nasabah.macet = true;
  bot.sendMessage(chatId, `${nasabah.nama} masuk daftar macet.`);
}

function unsetMacet(bot, msg, match) {
  const chatId = msg.chat.id;
  const nasabahId = parseInt(match[1]);
  const nasabah = nasabahList.find(n => n.id === nasabahId);
  if (!nasabah) {
    bot.sendMessage(chatId, 'Nasabah tidak ditemukan.');
    return;
  }
  nasabah.macet = false;
  bot.sendMessage(chatId, `${nasabah.nama} keluar dari daftar macet.`);
}

module.exports = { nasabahMacet, setMacet, unsetMacet };
