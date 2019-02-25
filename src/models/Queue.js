module.exports = class Queue {
  constructor (db) {
    this.db = db
  }
  async create ({ sender, recipient, message }) {
    const { success } = await this.db.run(`
        INSERT INTO queue (
          sender,
          recipient,
          message
        ) VALUES
        (?, ?, ?)
    `, [
      sender,
      recipient,
      message
    ])
    return success
  }
  async getById ({ primaryKey }) {
    return this.db.run('SELECT * FROM queue WHERE queue_id = ?', [primaryKey])
  }
  async getByRecipientId ({ recipientId }) {
    return this.db.run('SELECT * FROM queue WHERE recipient = ?', [recipientId])
  }
  async delete ({ queueId }) {
    const { success } = await this.db.run('DELETE FROM queue WHERE queue_id = ?', [queueId])
    return success
  }
}
