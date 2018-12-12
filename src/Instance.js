const EventEmitter = require('events')
const randomstring = require('randomstring')
const Db = require('./Db')

module.exports = class Instance extends EventEmitter {
  constructor (protocols, db) {
    super()
    this.protocols = protocols
    this.db = new Db(db)
    this.online = {
      nodes: [],
      clients: []
    }
  }
  loadListeners (protocol, resource) {
    this.protocols[protocol].on('node.to.instance', 'register', resource, this.registerNode.bind(this), {
      channel: 'instance.to.node',
      action: 'registerConfirm'
    })
    this.protocols[protocol].on('node.to.instance', 'update', resource, this.updateNode.bind(this), {
      channel: 'instance.to.node',
      action: 'updated'
    })
    this.protocols[protocol].on('node.to.instance', 'delete', resource, this.deleteNode.bind(this), {
      channel: 'instance.to.node',
      action: 'deleted'
    })
    this.protocols[protocol].on('node.to.instance', 'login', resource, this.loginNode.bind(this), {
      channel: 'instance.to.node',
      action: 'logged'
    })
    this.protocols[protocol].disconnect(resource, this.logoutNode.bind(this))
    this.protocols[protocol].on('node.to.instance', 'ping', resource, this.ping.bind(this), {
      channel: 'instance.to.node',
      action: 'pinged'
    })
  }
  ping (protocol, sender, parameters, reply) {
    this.emit('ping', parameters)
    reply({
      success: true
    })
  }
  async registerNode (protocol, sender, parameters, reply) {
    let token = randomstring.generate(5) + Date.now()
    const queryParameters = {
      token: token,
      ipfs_hash: parameters.hash,
      information: JSON.stringify(parameters.information),
      protocol: protocol,
      resource: sender
    }
    const { success } = await this.db.run(`
      INSERT INTO nodes (
        token,
        ipfs_hash,
        information,
        protocol,
        resource,
        active
      ) VALUES
      (?, ?, ?, ?, ?, 0)
      `, Object.values(queryParameters)
    )
    if (success) {
      reply({ success: true, token: token })
    } else {
      reply({ success: false })
    }
  }
  isNodeTokenValid (token) {
    return this.db.run('SELECT * FROM nodes WHERE token = ?', [token])
  }
  async updateNode (protocol, sender, parameters, reply) {
    const { success, results } = await this.isNodeTokenValid(parameters.token)
    if (success) {
      const node = results[0]
      const { success } = await this.db.run(`UPDATE nodes
        SET 
          ipfs_hash = ?,
          information = ? 
        WHERE node_id = ?
      `, [parameters.hash, parameters.information, node.node_id])
      if (success) {
        const updatedOnlineNode = this.online.nodes.find(n => n.id === node.node_id)
        if (updatedOnlineNode) {
          updatedOnlineNode.hash = parameters.hash
        }
        reply({
          success: true
        })
      } else {
        reply({
          success: false
        })
      }
    }
  }
  async deleteNode (protocol, sender, parameters, reply) {
    const { success, results } = await this.isNodeTokenValid(parameters.token)
    if (success) {
      const node = results[0]
      const { success } = await this.db.run('DELETE FROM nodes WHERE node_id = ?', [node.node_id])
      if (success) {
        reply({
          success: true
        })
        this.logoutNode(protocol, sender)
      } else {
        reply({
          success: false
        })
      }
    }
  }
  async loginNode (protocol, sender, parameters, reply) {
    const { success, results } = await this.isNodeTokenValid(parameters.token)
    if (success) {
      const node = results[0]
      this.online.nodes.push({
        hash: node.ipfs_hash,
        id: node.node_id,
        resource: sender,
        protocol: protocol
      })
      reply({
        success: true,
        hash: node.ipfs_hash
      })
    } else {
      reply({
        success: false
      })
    }
  }
  logoutNode (protocol, sender) {
    this.online.nodes = this.online.nodes.filter(n => n.resource !== sender)
    this.emit('disconnected')
  }
}
