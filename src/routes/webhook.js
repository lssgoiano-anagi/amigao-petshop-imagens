const express = require('express');
const { handleMessage } = require('../bot/handler');

const router = express.Router();

router.post('/', (req, res) => {
  // Responde imediatamente para o Evolution API não reenviar
  res.sendStatus(200);

  const { event, data } = req.body || {};

  if (event !== 'messages.upsert' || !data) return;
  if (data.key?.fromMe) return; // ignora mensagens enviadas por nós

  const remoteJid = data.key?.remoteJid || '';
  if (remoteJid.endsWith('@g.us')) return; // ignora grupos

  const phone = remoteJid.replace('@s.whatsapp.net', '');
  if (!phone) return;

  // Extrai texto (mensagem simples ou com formatação)
  const msg = data.message || {};
  const text =
    msg.conversation ||
    msg.extendedTextMessage?.text ||
    msg.buttonsResponseMessage?.selectedDisplayText ||
    '';

  if (!text.trim()) return; // ignora áudio, imagem, etc.

  const pushName = data.pushName || '';

  console.log(`[webhook] ${phone} (${pushName}): ${text.substring(0, 80)}`);

  handleMessage(phone, text.trim(), pushName).catch(err =>
    console.error('[webhook] Erro no handler:', err)
  );
});

module.exports = router;
