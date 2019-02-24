const EventEmitter = require('events')
const randomstring = require('randomstring')
const Db = require('./Db')
const Node = require('./models/Node')
const Client = require('./models/Client')
const Queue = require('./models/Queue')

module.exports = class Instance extends EventEmitter {
  constructor (protocols, db, ddbms) {
    super()
    this.protocols = protocols
    this.db = new Db(db)
    this.ddbms = ddbms
    this.models = {
      node: new Node(this.db),
      client: new Client(this.db),
      queue: new Queue(this.db)
    }
    this.online = {
      nodes: [],
      clients: []
    }
    this.bindings = [
      {
        channel: 'node.to.instance',
        action: 'register',
        callback: this.registerNode.bind(this),
        response: {
          channel: 'instance.to.node',
          action: 'registerConfirm'
        }
      },
      {
        channel: 'node.to.instance',
        action: 'update',
        callback: this.updateNode.bind(this),
        response: {
          channel: 'instance.to.node',
          action: 'updated'
        }
      },
      {
        channel: 'node.to.instance',
        action: 'delete',
        callback: this.deleteNode.bind(this),
        response: {
          channel: 'instance.to.node',
          action: 'deleted'
        }
      },
      {
        channel: 'node.to.instance',
        action: 'login',
        callback: this.loginNode.bind(this),
        response: {
          channel: 'instance.to.node',
          action: 'logged'
        }
      },
      {
        channel: 'node.to.instance',
        action: 'ping',
        callback: this.ping.bind(this),
        response: {
          channel: 'instance.to.node',
          action: 'pinged'
        }
      },
      {
        channel: 'client.to.instance',
        action: 'register',
        callback: this.registerClient.bind(this),
        response: {
          channel: 'instance.to.client',
          action: 'registerConfirm'
        }
      },
      {
        channel: 'client.to.instance',
        action: 'update',
        callback: this.updateClient.bind(this),
        response: {
          channel: 'instance.to.client',
          action: 'updated'
        }
      },
      {
        channel: 'client.to.instance',
        action: 'delete',
        callback: this.deleteClient.bind(this),
        response: {
          channel: 'instance.to.client',
          action: 'deleted'
        }
      },
      {
        channel: 'client.to.instance',
        action: 'login',
        callback: this.loginClient.bind(this),
        response: {
          channel: 'instance.to.client',
          action: 'logged'
        }
      },
      {
        channel: 'client.to.instance',
        action: 'ping',
        callback: this.ping.bind(this),
        response: {
          channel: 'instance.to.client',
          action: 'pinged'
        }
      },
      {
        channel: 'client.to.node',
        callback: this.forwardClientToNode.bind(this),
        response: {
          channel: 'instance.to.client',
          action: 'forwarded'
        }
      },
      {
        channel: 'node.to.client',
        callback: this.forwardNodeToClient.bind(this),
        response: {
          channel: 'instance.to.node',
          action: 'forwarded'
        }
      }
    ]
  }
  async forward ({ senderType, recipientType }, protocol, sender, parameters, authentication, reply, forwardObject, resource) {
    let onlineRecipient = this.online[recipientType + 's'].find(n => n.id === forwardObject.recipientObject.recipient)
    if (onlineRecipient) {
      this.protocols[onlineRecipient.protocol].to(onlineRecipient.resource, senderType + '.to.' + recipientType, forwardObject.action, parameters, null, resource)
      reply({ success: true, type: 'forward' })
    } else {
      const { success, results } = await this.models[recipientType].getById({
        primaryKey: forwardObject.recipientObject.recipient
      })
      if (success) {
        let resource = results[0].resource
        const [, recipientProtocol] = resource.match(/(^\w+):\/\/(.+)/)
        if (this.protocols[recipientProtocol].needsQueue) {
          const { success, results } = await this.models[senderType].getByToken({
            token: authentication.token
          })
          if (success) {
            const entity = results[0]
            const success = await this.models.queue.create({
              sender: entity[senderType + '_id'],
              recipient: forwardObject.recipientObject.recipient,
              message: JSON.stringify(parameters)
            })
            if (success) {
              reply({ success: true, type: 'queue' })
            }
          }
        }
      }
    }
  }
  async forwardClientToNode (protocol, sender, parameters, authentication, reply, forwardObject, resource) {
    this.forward({ senderType: 'client', recipientType: 'node' }, protocol, sender, parameters, authentication, reply, forwardObject, resource)
  }
  async forwardNodeToClient (protocol, sender, parameters, authentication, reply, forwardObject, resource) {
    this.forward({ senderType: 'node', recipientType: 'client' }, protocol, sender, parameters, authentication, reply, forwardObject, resource)
  }
  loadListeners () {
    for (let protocolId in this.protocols) {
      let protocol = this.protocols[protocolId]
      protocol.loadListeners(this.bindings)
      protocol.disconnect(this.logoutNode.bind(this))
      protocol.disconnect(this.logoutClient.bind(this))
    }
  }
  ping (protocol, sender, parameters, authentication, reply) {
    this.emit('ping', parameters)
    reply({
      success: true
    })
  }
  async registerNode (protocol, sender, parameters, authentication, reply) {
    let token = randomstring.generate(5) + Date.now()
    const success = this.models.node.create({
      token: token,
      components: parameters.components,
      information: JSON.stringify(parameters.information),
      resource: protocol + '://' + sender
    })
    if (success) {
      const protocolRegex = parameters.components.match(/(^\w+:|^)\/\//)
      const ddbms = protocolRegex[0].replace('://', '')
      const components = parameters.components.replace(/(^\w+:|^)\/\//, '')
      await this.ddbms[ddbms].save(components).catch(e => {})
      const { success, results } = await this.isNodeTokenValid(token)
      if (success) {
        reply({ success: true, token: token, id: results[0].node_id })
      } else {
        reply({ success: false })
      }
    } else {
      reply({ success: false })
    }
  }
  isNodeTokenValid (token) {
    return this.models.node.getByToken({
      token: token
    })
  }
  async updateNode (protocol, sender, parameters, authentication, reply) {
    const { success, results } = await this.isNodeTokenValid(authentication.token)
    if (success) {
      const node = results[0]
      const success = this.models.node.update({
        components: parameters.components,
        information: parameters.information,
        nodeId: node.node_id
      })
      if (success) {
        const updatedOnlineNode = this.online.nodes.find(n => n.id === node.node_id)
        if (updatedOnlineNode) {
          updatedOnlineNode.components = parameters.components
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
  async deleteNode (protocol, sender, parameters, authentication, reply) {
    const { success, results } = await this.isNodeTokenValid(authentication.token)
    if (success) {
      const node = results[0]
      const success = await this.models.node.delete({
        nodeId: node.node_id
      })
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
  async loginNode (protocol, sender, parameters, authentication, reply) {
    const { success, results } = await this.isNodeTokenValid(authentication.token)
    if (success) {
      const node = results[0]
      this.online.nodes.push({
        components: node.components,
        id: node.node_id,
        resource: sender,
        protocol: protocol
      })
      reply({
        success: true,
        components: node.components,
        id: node.node_id
      })
    } else {
      reply({
        success: false
      })
    }
  }
  logoutNode (protocol, sender) {
    this.online.nodes = this.online.nodes.filter(n => {
      return !(n.resource === sender && n.protocol === protocol)
    })
    this.emit('nodeDisconnects')
  }
  async registerClient (protocol, sender, parameters, authentication, reply) {
    let token = randomstring.generate(5) + Date.now()
    const success = await this.models.client.create({
      token: token,
      information: JSON.stringify(parameters.information),
      resource: protocol + '://' + sender
    })
    if (success) {
      const { success, results } = await this.isClientTokenValid(token)
      if (success) {
        reply({ success: true, token: token, id: results[0].client_id })
      } else {
        reply({ success: false })
      }
    } else {
      reply({ success: false })
    }
  }
  isClientTokenValid (token) {
    return this.models.client.getByToken({
      token: token
    })
  }
  async updateClient (protocol, sender, parameters, authentication, reply) {
    const { success, results } = await this.isClientTokenValid(authentication.token)
    if (success) {
      const client = results[0]
      const success = await this.models.client.update({
        information: parameters.information,
        clientId: client.client_id
      })
      if (success) {
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
  async deleteClient (protocol, sender, parameters, authentication, reply) {
    const { success, results } = await this.isClientTokenValid(authentication.token)
    if (success) {
      const client = results[0]
      const success = await this.models.client.delete({
        clientId: client.client_id
      })
      if (success) {
        reply({
          success: true
        })
        this.logoutClient(protocol, sender)
      } else {
        reply({
          success: false
        })
      }
    }
  }
  async loginClient (protocol, sender, parameters, authentication, reply) {
    const { success, results } = await this.isClientTokenValid(authentication.token)
    if (success) {
      const client = results[0]
      this.online.clients.push({
        id: client.client_id,
        resource: sender,
        protocol: protocol
      })
      reply({
        success: true,
        id: client.client_id
      })
    } else {
      reply({
        success: false
      })
    }
  }
  logoutClient (protocol, sender) {
    this.online.clients = this.online.clients.filter(n => {
      return !(n.resource === sender && n.protocol === protocol)
    })
    this.emit('clientDisconnects')
  }
}
