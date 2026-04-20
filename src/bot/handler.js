const { chat } = require('./ai');
const { sendText, sendTyping, sendButtons } = require('../whatsapp/sender');
const queries = require('../db/queries');

const TRANSFER_MSG =
  '🙋 Vou te conectar agora com um dos nossos atendentes. Um momentinho, por favor! ❤️';

function parseReply(reply) {
  const match = reply.match(/\[BTN:([^|]+)\|\|([^|]+)\|\|(.+?)\]/);
  if (match) {
    return {
      type: 'buttons',
      title: match[1].trim(),
      body: match[2].trim(),
      buttons: match[3].split('||').map(b => b.trim()).filter(Boolean),
      text: reply.replace(match[0], '').trim(),
    };
  }
  return { type: 'text', text: reply };
}

async function handleMessage(phone, text, pushName) {
  const customer = queries.upsertCustomer(phone, pushName);

  let conv = queries.getActiveConversation(customer.id);
  if (!conv) conv = queries.createConversation(customer.id);

  queries.addMessage(conv.id, 'user', text, 'customer');
  queries.touchConversation(conv.id);

  if (conv.status === 'human') {
    console.log(`[handler] Conv ${conv.id} em modo humano — mensagem aguardando atendente.`);
    return;
  }

  const history = queries.getMessages(conv.id, 20);

  try {
    await sendTyping(phone, 2);

    const reply = await chat(
      history.map(m => ({ role: m.role, content: m.content })),
      { name: customer.name, phone }
    );

    if (reply.startsWith('[TRANSFERIR]')) {
      const cleanReply = reply.replace('[TRANSFERIR]', '').trim();
      if (cleanReply) {
        await sendText(phone, cleanReply);
        queries.addMessage(conv.id, 'assistant', cleanReply, 'bot');
      }
      await sendText(phone, TRANSFER_MSG);
      queries.addMessage(conv.id, 'assistant', TRANSFER_MSG, 'bot');
      queries.updateConversationStatus(conv.id, 'human', null);
      return;
    }

    const parsed = parseReply(reply);
    if (parsed.type === 'buttons') {
      if (parsed.text) {
        await sendText(phone, parsed.text);
        queries.addMessage(conv.id, 'assistant', parsed.text, 'bot');
      }
      await sendButtons(phone, parsed.title, parsed.body, parsed.buttons);
      queries.addMessage(conv.id, 'assistant', `${parsed.title}: ${parsed.buttons.join(' | ')}`, 'bot');
    } else {
      await sendText(phone, reply);
      queries.addMessage(conv.id, 'assistant', reply, 'bot');
    }
  } catch (err) {
    console.error('[handler] Erro ao processar mensagem:', err.message);
    const errMsg = 'Desculpe, tive um probleminha técnico. Aguarde um instante e tente novamente. 🙏';
    await sendText(phone, errMsg);
    queries.addMessage(conv.id, 'assistant', errMsg, 'bot');
  }
}

module.exports = { handleMessage };
