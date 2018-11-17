const Protocols = require('./Protocols')

module.exports = class InstanceApi {
    constructor(protocols) {
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
    on(channel, action, protocol, response) {
        return this.protocols.on({
            protocol: protocol,
            channel: channel,
            action: action,
            response: response
        })
    }
    onNode(action, protocol, response) {
        return this.on("node.to.instance", action, protocol, response)
    }
    onClient(action, protocol, response) {
        return this.on("client.to.instance", action, protocol, response)
    }
    to(channel, action, protocol, recipient, parameters, listen) {
        return this.protocols.to({
            protocol: protocol,
            recipient: recipient,
            channel: channel,
            action: action,
            parameters: parameters,
            listen: listen
        })
    }
    toAll(channel, action, parameters, listen) {
        this.protocols.forEach(protocol => {
            this.to(channel, action, protocol, null, parameters, listen)
        })
    }
    toNode(action, protocol, recipient, parameters, listen) {
        return this.to("instance.to.node", action, protocol, recipient, parameters, listen)
    }
    toClient(action, protocol, recipient, parameters, listen) {
        return this.to("instance.to.client", action, protocol, recipient, parameters, listen)
    }
    toAllNodes(action, parameters, listen) {
        this.toAll("instance.to.node", action, parameters, listen)
    }
    toAllClients(action, parameters, listen) {
        this.toAll("instance.to.client", action, parameters, listen)
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
    toNodeRegistered(protocol, recipient, parameters) {
        return this.toNode("registered", protocol, recipient, parameters, {
            channel: "node.to.instance",
            action: "registeredConfirmed"
        })
    }
    /**
     * Listen for new node registrations
     *
     * @param {(WSProtocol|HttpProtocol)} protocol
     * @returns {Observable}
     */
    onNodeRegister(protocol) {
        return this.onNode("register", protocol, {
            channel: "instance.to.node",
            action: "confirmRegistration"
        })
    }
    /**
     * Listen for node updates
     *
     * @param {(WSProtocol|HttpProtocol)} protocol
     * @returns {Observable}
     */
    onNodeUpdate(protocol) {
        return this.onNode("update", protocol, {
            channel: "instance.to.node",
            action: "updated"
        })
    }
    /**
     * Listen for node logins
     *
     * @param {(WSProtocol|HttpProtocol)} protocol
     * @returns {Observable}
     */
    onNodeLogin(protocol) {
        return this.onNode("login", protocol, {
            channel: "instance.to.node",
            action: "logged"
        })
    }
    /**
     * Send a global message to all clients
     * suggesting to update the nodes list
     *
     * @param {Object} parameters
     */
    toClientsUpdateNodeList(parameters) {
        this.toAllClients("updateOnlineNodes", protocol, null, parameters)
    }

    /*
    in this file you specify how to listen a send messages to protocols
    */
    onClientRegister(protocol) {
        return this.onNode("register", protocol, {
            channel: "instance.to.client",
            action: "registered"
        })
    }
}