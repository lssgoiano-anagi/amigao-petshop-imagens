const axios = require('axios');
const config = require('../config');

const api = axios.create({
  baseURL: config.evolution.url,
  headers: { apikey: config.evolution.key },
  timeout: 10000,
});

async function sendText(phone, text) {
  try {
    await api.post(`/message/sendText/${config.evolution.instance}`, {
      number: phone,
      text,
    });
  } catch (err) {
    console.error('[sender] Erro ao enviar mensagem:', err.message);
  }
}

async function sendTyping(phone, seconds = 2) {
  try {
    await api.post(`/chat/sendPresence/${config.evolution.instance}`, {
      number: phone,
      presence: 'composing',
      delay: seconds * 1000,
    });
  } catch {
    // não crítico — ignorar falha de presence
  }
}

module.exports = { sendText, sendTyping };
