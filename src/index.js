require('dotenv').config();
const express = require('express');
const path = require('path');
const config = require('./config');
const webhookRouter = require('./routes/webhook');
const apiRouter = require('./routes/api');
const { getDb } = require('./db/database');

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Dashboard estático
app.use('/dashboard', express.static(path.join(__dirname, 'dashboard')));

// Rotas
app.use('/webhook', webhookRouter);
app.use('/api', apiRouter);

// Health check
app.get('/', (_req, res) => {
  res.json({
    service: 'Amigão Pet Shop — WhatsApp Bot',
    status: 'online',
    version: '1.0.0',
  });
});

// Inicializa banco de dados ao subir
getDb();

app.listen(config.port, () => {
  console.log(`
🐾  Amigão Pet Shop — WhatsApp Bot
✅  Servidor rodando na porta ${config.port}
📱  Webhook : http://localhost:${config.port}/webhook
📊  Dashboard: http://localhost:${config.port}/dashboard
  `);
});
