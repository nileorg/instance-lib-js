const EventEmitter = require('events')
module.exports = class Instance extends EventEmitter {
  constructor (protocols) {
    super()
    this.protocols = protocols
  }
  loadListeners (protocol, resource) {
    this.protocols[protocol].on('node.to.instance', 'register', resource, this.registerNode.bind(this), {
      channel: 'instance.to.node',
      action: 'registerConfirm'
    })
    this.protocols[protocol].on('node.to.instance', 'update', resource, this.updateNode, {
      channel: 'instance.to.node',
      action: 'updated'
    })
    /* this.protocols[protocol].on('node.to.instance', 'login', resource, this.loginNode, {
      channel: "instance.to.node",
      action: "logged"
    }) */
    this.protocols[protocol].on('client.to.instance', 'register', resource, this.registerClient, {
      channel: 'instance.to.client',
      action: 'registerConfirm'
    })
  }
  updateNode (protocol, sender, parameters, reply) {
    reply({
      success: true
    })
    /* this.protocols[protocol].to(sender, 'instance.to.client', 'confirmRegister', {
          success: true
      }) */
  }
  registerNode (protocol, sender, parameters, reply) {
    this.emit('nodeRegister', parameters)
    reply({
      success: true
    })
    /* this.protocols[protocol].to(sender, 'instance.to.client', 'confirmRegister', {
          success: true
      }) */
  }
  registerClient (protocol, sender, parameters, reply) {
    reply({
      success: true
    })
    /* this.protocols[protocol].to(sender, 'instance.to.client', 'confirmRegister', {
          success: true
      }) */
  }
}
