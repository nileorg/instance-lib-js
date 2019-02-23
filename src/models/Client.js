module.exports = class Client {
  constructor (db) {
    this.db = db
  }
  async create ({ token, components, information, resource }) {
    const { success } = await this.db.run(`
          INSERT INTO clients (
          token,
          information,
          resource,
          ) VALUES
          (?, ?, ?)
      `, [
      token,
      information,
      resource
    ])
    return success
  }
  async getByToken ({ token }) {
    return this.db.run('SELECT * FROM clients WHERE token = ?', [token])
  }
  async getById ({ primaryKey }) {
    return this.db.run('SELECT * FROM clients WHERE client_id = ?', [primaryKey])
  }
  async update ({ components, information, clientId }) {
    const { success } = await this.db.run(`UPDATE clients
      SET 
        information = ? 
     WHERE client_id = ?
   `, [components, information, clientId])
    return success
  }
  async delete ({ clientId }) {
    const { success } = await this.db.run('DELETE FROM clients WHERE client_id = ?', [clientId])
    return success
  }
}
