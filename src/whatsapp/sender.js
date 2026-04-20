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
    // não crítico
  }
}

async function sendButtons(phone, title, body, buttons) {
  try {
    await api.post(`/message/sendButtons/${config.evolution.instance}`, {
      number: phone,
      title,
      description: body,
      footer: 'Amigão Pet Shop',
      buttons: buttons.slice(0, 3).map((b, i) => ({
        type: 'reply',
        displayText: b,
        id: String(i + 1),
      })),
    });
  } catch {
    const txt =
      title + '\n\n' + body + '\n\n' +
      buttons.map((b, i) => `${i + 1}. ${b}`).join('\n');
    await sendText(phone, txt);
  }
}

module.exports = { sendText, sendTyping, sendButtons };
