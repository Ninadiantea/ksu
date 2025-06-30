// Sesi login sederhana: { [telegramUserId]: { role, displayName, username } }
const sessions = {};

function setSession(userId, sessionData) {
  sessions[userId] = sessionData;
}
function getSession(userId) {
  return sessions[userId];
}
function clearSession(userId) {
  delete sessions[userId];
}
module.exports = { setSession, getSession, clearSession };
