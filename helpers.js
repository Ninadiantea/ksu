function formatRupiah(num) {
  return 'Rp' + Number(num).toLocaleString('id-ID');
}
function today() {
  const now = new Date();
  return now.toISOString().slice(0, 10);
}
module.exports = { formatRupiah, today };
