const { getDb } = require('./database');

function upsertCustomer(phone, name) {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM customers WHERE phone = ?').get(phone);
  if (existing) {
    if (name && !existing.name) {
      db.prepare('UPDATE customers SET name = ? WHERE phone = ?').run(name, phone);
      return { ...existing, name };
    }
    return existing;
  }
  const info = db.prepare('INSERT INTO customers (phone, name) VALUES (?, ?)').run(phone, name || null);
  return { id: info.lastInsertRowid, phone, name: name || null };
}

function getActiveConversation(customerId) {
  return getDb()
    .prepare(
      "SELECT * FROM conversations WHERE customer_id = ? AND status != 'closed' ORDER BY updated_at DESC LIMIT 1"
    )
    .get(customerId);
}

function createConversation(customerId) {
  const db = getDb();
  const info = db.prepare("INSERT INTO conversations (customer_id, status) VALUES (?, 'bot')").run(customerId);
  return { id: info.lastInsertRowid, customer_id: customerId, status: 'bot' };
}

function updateConversationStatus(conversationId, status, agent = null) {
  getDb()
    .prepare('UPDATE conversations SET status = ?, agent = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(status, agent, conversationId);
}

function touchConversation(conversationId) {
  getDb()
    .prepare('UPDATE conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?')
    .run(conversationId);
}

function addMessage(conversationId, role, content, sender = 'bot') {
  const info = getDb()
    .prepare('INSERT INTO messages (conversation_id, role, content, sender) VALUES (?, ?, ?, ?)')
    .run(conversationId, role, content, sender);
  return info.lastInsertRowid;
}

function getMessages(conversationId, limit = 20) {
  return getDb()
    .prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC LIMIT ?')
    .all(conversationId, limit);
}

function listConversations(status = null) {
  const base = `
    SELECT
      c.*,
      cu.name  AS customer_name,
      cu.phone,
      (SELECT content    FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message,
      (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message_at
    FROM conversations c
    JOIN customers cu ON cu.id = c.customer_id
  `;
  const db = getDb();
  if (status) return db.prepare(base + ' WHERE c.status = ? ORDER BY c.updated_at DESC').all(status);
  return db.prepare(base + ' ORDER BY c.updated_at DESC').all();
}

function getConversationDetail(conversationId) {
  const db = getDb();
  const conv = db
    .prepare(
      'SELECT c.*, cu.name AS customer_name, cu.phone FROM conversations c JOIN customers cu ON cu.id = c.customer_id WHERE c.id = ?'
    )
    .get(conversationId);
  if (!conv) return null;
  return {
    ...conv,
    messages:     getMessages(conversationId, 100),
    pets:         db.prepare('SELECT * FROM pets WHERE customer_id = ?').all(conv.customer_id),
    appointments: db.prepare('SELECT * FROM appointments WHERE customer_id = ? ORDER BY created_at DESC LIMIT 5').all(conv.customer_id),
  };
}

function createAppointment(customerId, petName, service, scheduledAt, notes) {
  const info = getDb()
    .prepare('INSERT INTO appointments (customer_id, pet_name, service, scheduled_at, notes) VALUES (?, ?, ?, ?, ?)')
    .run(customerId, petName, service, scheduledAt, notes || null);
  return info.lastInsertRowid;
}

function upsertPet(customerId, petName, species, breed) {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM pets WHERE customer_id = ? AND name = ?').get(customerId, petName);
  if (existing) return existing;
  const info = db
    .prepare('INSERT INTO pets (customer_id, name, species, breed) VALUES (?, ?, ?, ?)')
    .run(customerId, petName, species || null, breed || null);
  return { id: info.lastInsertRowid, customer_id: customerId, name: petName };
}

module.exports = {
  upsertCustomer,
  getActiveConversation,
  createConversation,
  updateConversationStatus,
  touchConversation,
  addMessage,
  getMessages,
  listConversations,
  getConversationDetail,
  createAppointment,
  upsertPet,
};
