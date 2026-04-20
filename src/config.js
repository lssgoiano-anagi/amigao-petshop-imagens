require('dotenv').config();

module.exports = {
  port: Number(process.env.PORT) || 3000,

  evolution: {
    url: process.env.EVOLUTION_API_URL || 'http://localhost:8080',
    key: process.env.EVOLUTION_API_KEY || '',
    instance: process.env.EVOLUTION_INSTANCE || 'amigao',
  },

  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY || '',
  },

  petshop: {
    nome: process.env.PETSHOP_NOME || 'Amigão Pet Shop',
    endereco: process.env.PETSHOP_ENDERECO || '',
    horario: process.env.PETSHOP_HORARIO || 'Seg-Sex 8h-18h | Sáb 8h-17h',
    instagram: process.env.PETSHOP_INSTAGRAM || '@amigaopetshop',
    whatsapp: process.env.PETSHOP_WHATSAPP || '',
  },

  dashboard: {
    password: process.env.DASHBOARD_PASSWORD || 'amigao2025',
  },

  dbPath: process.env.DB_PATH || './amigao.db',
};
