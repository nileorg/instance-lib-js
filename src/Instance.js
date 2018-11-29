const InstanceApi = require('./InstanceApi')
const EventEmitter = require('events')

module.exports = class Instance extends EventEmitter {
  constructor (protocols) {
    super()
    this.api = new InstanceApi(protocols)
  }
  loadListeners (protocol, resource) {
    // For each listener assign a function that it will be called each time a message is read
    this.api.onNodeRegister(protocol, resource).subscribe(this.onNodeRegister.bind(this))
    this.api.onNodeUpdate(protocol, resource).subscribe(this.onNodeUpdate.bind(this))
    this.api.onNodeLogin(protocol, resource).subscribe(this.onNodeLogin.bind(this))
    this.api.onClientRegister(protocol, resource).subscribe(this.onClientRegister.bind(this))
  }
  onNodeRegister ({ ok, parameters }) {
    this.emit('nodeRegister', parameters)
    // Use ok to reply to that message using predefined channel/action passing the arguments as an object
    ok({ success: true })
  }
  async onNodeLogin ({ ok, parameters }) {
    const conditionTrue = true
    const node = {
      ipfs_hash: ''
    }
    const queueResults = []
    if (conditionTrue) {
      // Send a global message to all the clients
      this.api.toClientsUpdateNodeList({
        onlineNodes: this.onlineNodes
      })
      ok({
        hash: node.ipfs_hash,
        queue: queueResults,
        sucess: true
      })
    } else {
      ok({
        sucess: false
      })
    }
  }
  async onNodeUpdate ({ ok, parameters }) {
    console.log(parameters)
    // update the node
    // other stuff
    ok({
      sucess: true,
      msg: 'updated!'
    })
  }
  async toNodeRegistered (node) {
    // Send a message to a specific recipient
    const registeredConfirmed = await this.api.toNodeRegistered(node.protocol, node.resource, {
      token: node.token
    })
    console.log(registeredConfirmed)
  }
  async onClientRegister ({ ok, parameters, protocol }) {
    // insert into users values (parameters.password, parameters.protocol)
    ok({
      success: true,
      msg: 'Client registered!'
    })
  }
}
