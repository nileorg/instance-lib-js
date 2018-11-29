const Protocols = require('./Protocols')

module.exports = class InstanceApi {
  constructor (protocols) {
    // Initialize the protocol class
    this.protocols = new Protocols(protocols)
  }
  /**
     * Create an observable to an action on a channel through the specified protocol
     *
     * @param {String} channel
     * @param {String} action
     * @param {String} protocol
     * @param {Object} response
     * @returns {Observable}
     */
  on (channel, action, protocol, resource, response) {
    return this.protocols.on({
      protocol: protocol,
      resource: resource,
      channel: channel,
      action: action,
      response: response
    })
  }
  onNode (action, protocol, resource, response) {
    return this.on('node.to.instance', action, protocol, resource, response)
  }
  onClient (action, protocol, resource, response) {
    return this.on('client.to.instance', action, protocol, resource, response)
  }
  to (channel, action, protocol, resource, recipient, parameters, listen) {
    return this.protocols.to({
      protocol: protocol,
      resource: resource,
      recipient: recipient,
      channel: channel,
      action: action,
      parameters: parameters,
      listen: listen
    })
  }
  toAll (channel, action, parameters, listen) {
    this.protocols.forEach(protocol => {
      this.to(channel, action, protocol, null, parameters, listen)
    })
  }
  toNode (action, protocol, resource, recipient, parameters, listen) {
    return this.to('instance.to.node', action, protocol, resource, recipient, parameters, listen)
  }
  toClient (action, protocol, resource, recipient, parameters, listen) {
    return this.to('instance.to.client', action, protocol, resource, recipient, parameters, listen)
  }
  toAllNodes (action, parameters, listen) {
    this.toAll('instance.to.node', action, parameters, listen)
  }
  toAllClients (action, parameters, listen) {
    this.toAll('instance.to.client', action, parameters, listen)
  }
  /**
     * Send a message to a specific node
     * confirming the registration
     *
     * @param {(WSProtocol|HttpProtocol)} protocol
     * @param {String} recipient
     * @param {Object} parameters
     * @returns
     */
  toNodeRegistered (protocol, resource, recipient, parameters) {
    return this.toNode('registered', protocol, resource, recipient, parameters, {
      channel: 'node.to.instance',
      action: 'registeredConfirmed'
    })
  }
  /**
     * Listen for new node registrations
     *
     * @param {(WSProtocol|HttpProtocol)} protocol
     * @returns {Observable}
     */
  onNodeRegister (protocol, resource) {
    return this.onNode('register', protocol, resource, {
      channel: 'instance.to.node',
      action: 'confirmRegistration'
    })
  }
  /**
     * Listen for node updates
     *
     * @param {(WSProtocol|HttpProtocol)} protocol
     * @returns {Observable}
     */
  onNodeUpdate (protocol, resource) {
    return this.onNode('update', protocol, resource, {
      channel: 'instance.to.node',
      action: 'updated'
    })
  }
  /**
     * Listen for node logins
     *
     * @param {(WSProtocol|HttpProtocol)} protocol
     * @returns {Observable}
     */
  onNodeLogin (protocol, resource) {
    return this.onNode('login', protocol, resource, {
      channel: 'instance.to.node',
      action: 'logged'
    })
  }
  /**
     * Send a global message to all clients
     * suggesting to update the nodes list
     *
     * @param {Object} parameters
     */
  toClientsUpdateNodeList (parameters) {
    this.toAllClients('updateOnlineNodes', parameters, null)
  }

  /*
    in this file you specify how to listen a send messages to protocols
    */
  onClientRegister (protocol, resource) {
    return this.onClient('register', protocol, resource, {
      channel: 'instance.to.client',
      action: 'registered'
    })
  }
}
