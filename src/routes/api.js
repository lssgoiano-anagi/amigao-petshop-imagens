const express = require('express');
const fs = require('fs');
const path = require('path');
const queries = require('../db/queries');
const { sendText } = require('../whatsapp/sender');
const config = require('../config');

const KNOWLEDGE_FILE = path.join(process.cwd(), 'knowledge.txt');

const router = express.Router();

function auth(req, res, next) {
  const pass = req.headers['x-dashboard-password'] || req.query.password;
  if (pass !== config.dashboard.password) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
  next();
}

// ── Conversas ──────────────────────────────────────────────────────────────

router.get('/conversations', auth, (req, res) => {
  res.json(queries.listConversations(req.query.status || null));
});

router.get('/conversations/:id', auth, (req, res) => {
  const conv = queries.getConversationDetail(Number(req.params.id));
  if (!conv) return res.status(404).json({ error: 'Conversa não encontrada' });
  res.json(conv);
});

// Assumir atendimento (humano)
router.post('/conversations/:id/handoff', auth, (req, res) => {
  queries.updateConversationStatus(Number(req.params.id), 'human', req.body.agent || 'Atendente');
  res.json({ ok: true });
});

// Devolver ao bot
router.post('/conversations/:id/bot', auth, (req, res) => {
  queries.updateConversationStatus(Number(req.params.id), 'bot', null);
  res.json({ ok: true });
});

// Encerrar conversa
router.post('/conversations/:id/close', auth, (req, res) => {
  queries.updateConversationStatus(Number(req.params.id), 'closed', null);
  res.json({ ok: true });
});

// Responder como atendente humano
router.post('/conversations/:id/reply', auth, async (req, res) => {
  const convId = Number(req.params.id);
  const { text, agent } = req.body;

  if (!text?.trim()) return res.status(400).json({ error: 'Mensagem vazia' });

  const conv = queries.getConversationDetail(convId);
  if (!conv) return res.status(404).json({ error: 'Conversa não encontrada' });

  try {
    await sendText(conv.phone, text.trim());
    queries.addMessage(convId, 'assistant', text.trim(), 'human');
    if (agent) queries.updateConversationStatus(convId, 'human', agent);
    queries.touchConversation(convId);
    res.json({ ok: true });
  } catch {
    res.status(500).json({ error: 'Erro ao enviar mensagem' });
  }
});

// ── Agendamentos ───────────────────────────────────────────────────────────

router.post('/appointments', auth, (req, res) => {
  const { customerId, petName, service, scheduledAt, notes } = req.body;
  if (!customerId || !service) return res.status(400).json({ error: 'Dados inválidos' });
  const id = queries.createAppointment(customerId, petName, service, scheduledAt, notes);
  res.json({ id });
});

// ── Catálogo / Conhecimento ────────────────────────────────────────────────

router.get('/knowledge', auth, (req, res) => {
  try {
    const content = fs.existsSync(KNOWLEDGE_FILE) ? fs.readFileSync(KNOWLEDGE_FILE, 'utf8') : '';
    res.json({ content });
  } catch {
    res.json({ content: '' });
  }
});

router.post('/knowledge', auth, (req, res) => {
  try {
    fs.writeFileSync(KNOWLEDGE_FILE, req.body.content || '', 'utf8');
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: 'Erro ao salvar.' });
  }
});

// ── Estatísticas ───────────────────────────────────────────────────────────

router.get('/stats', auth, (req, res) => {
  const all = queries.listConversations();
  res.json({
    total: all.length,
    bot:    all.filter(c => c.status === 'bot').length,
    human:  all.filter(c => c.status === 'human').length,
    closed: all.filter(c => c.status === 'closed').length,
  });
});

module.exports = router;
