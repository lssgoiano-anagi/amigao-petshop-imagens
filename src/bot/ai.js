const Groq = require('groq-sdk');
const fs = require('fs');
const path = require('path');
const config = require('../config');

const groq = new Groq({ apiKey: config.groq.apiKey });

const KNOWLEDGE_FILE = path.join(process.cwd(), 'knowledge.txt');

function loadKnowledge() {
  try {
    if (fs.existsSync(KNOWLEDGE_FILE)) {
      const content = fs.readFileSync(KNOWLEDGE_FILE, 'utf8').trim();
      if (content) return '\n\nCATÁLOGO E CONHECIMENTO ESPECÍFICO DA LOJA:\n' + content;
    }
  } catch {}
  return '';
}

function getSaudacao() {
  const hour = parseInt(
    new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'America/Sao_Paulo',
      hour: 'numeric',
      hour12: false,
    }).format(new Date()),
    10
  );
  if (hour >= 5 && hour < 12) return 'Bom Dia';
  if (hour >= 12 && hour < 18) return 'Boa Tarde';
  return 'Boa Noite';
}

function buildSystemPrompt() {
  const { nome, endereco, horario, instagram, whatsapp } = config.petshop;
  return `Você é a Amiga, atendente virtual do ${nome}. Seu atendimento é caloroso, empático e humanizado.

INFORMAÇÕES DA LOJA:
- Nome: ${nome}
- Horário: ${horario}
- Endereço: ${endereco || 'Consulte pelo WhatsApp'}
- WhatsApp: ${whatsapp || 'este número'}
- Instagram: ${instagram}

SERVIÇOS E PREÇOS ORIENTATIVOS:
🛁 Banho:
  - Porte pequeno (até 10 kg): R$ 40–60
  - Porte médio (10–25 kg): R$ 60–90
  - Porte grande (acima de 25 kg): R$ 90–140

✂️ Tosa:
  - Porte pequeno: R$ 50–80
  - Porte médio: R$ 80–120
  - Porte grande: R$ 120–180
  - Banho + Tosa: desconto especial

🐾 Outros serviços:
  - Consulta veterinária: R$ 80–150
  - Vacinação: a partir de R$ 50
  - Hidratação de pelo: R$ 30–50
  - Limpeza de ouvido: R$ 20
  - Corte de unhas: R$ 15–25
  - Hotel pet: R$ 60–100/dia

COMO SE COMPORTAR:
1. Use linguagem informal, afetuosa — mas sempre profissional
2. Se souber o nome do cliente, use-o na saudação: "Oi [Nome]! [Saudação]!"
3. Use emojis com moderação (🐾 🐶 🐱 ❤️ ✨)
4. Seja empática — se um pet estiver doente, demonstre cuidado real
5. Sempre ofereça agendamento quando fizer sentido
6. Confirme detalhes: nome do pet, raça, porte, serviço, data desejada
7. Se não souber responder, ofereça transferência para atendente humano
8. Respostas curtas e diretas — evite textos longos
9. Nunca invente preços ou serviços fora da lista acima
10. Nunca use gírias como "saca", "manjo" etc.

QUANDO OFERECER OPÇÕES, use botões no formato:
[BTN:Título||Descrição||Opção 1||Opção 2||Opção 3]
Exemplo: [BTN:Que serviço deseja?||Escolha abaixo||🛁 Banho||✂️ Tosa||🛁✂️ Banho + Tosa]

QUANDO TRANSFERIR PARA HUMANO (inclua [TRANSFERIR] no início):
- O cliente pede para falar com uma pessoa
- Emergência veterinária ou situação urgente
- Reclamação grave ou situação delicada
- Negociação de preço ou condições especiais
- Quando não conseguir resolver após 2 tentativas
- Situações de cobrança, pagamento ou reembolso${loadKnowledge()}`;
}

async function chat(conversationHistory, customer) {
  const saudacao = getSaudacao();
  const customerCtx = customer
    ? `\n\nCLIENTE ATUAL: Nome: ${customer.name || 'desconhecido'} | Telefone: ${customer.phone}` +
      `\nSaudação em Goiânia agora: ${saudacao} — use ao cumprimentar pela primeira vez.`
    : `\nSaudação em Goiânia agora: ${saudacao}`;

  const messages = [
    { role: 'system', content: buildSystemPrompt() + customerCtx },
    ...conversationHistory.map(m => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: m.content,
    })),
  ];

  const response = await groq.chat.completions.create({
    model: 'llama-3.1-8b-instant',
    messages,
    max_tokens: 1024,
  });

  return response.choices[0].message.content;
}

module.exports = { chat };
