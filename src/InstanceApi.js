const Protocols = require('./Protocols')

module.exports = class InstanceApi {
    constructor(protocols) {
        // Initialize the protocol class
        this.protocols = new Protocols(protocols)
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
        return this.protocols.to({
            protocol: protocol,
            recipient: recipient,
            channel: "instance.to.node",
            action: "registered",
            parameters: parameters,
            listen: {
                channel: "node.to.instance",
                action: "registeredConfirmed"
            }
        })
    }
    /**
     * Listen for new node registrations
     *
     * @param {(WSProtocol|HttpProtocol)} protocol
     * @returns {Observable}
     */
    onNodeRegister(protocol) {
        return this.protocols.on({
            protocol: protocol,
            channel: "node.to.instance",
            action: "register",
            response: {
                channel: "instance.to.node",
                action: "confirmRegistration"
            }
        })
    }
    /**
     * Listen for node updates
     *
     * @param {(WSProtocol|HttpProtocol)} protocol
     * @returns {Observable}
     */
    onNodeUpdate(protocol) {
        return this.protocols.on({
            protocol: protocol,
            channel: "node.to.instance",
            action: "update",
            response: {
                channel: "instance.to.node",
                action: "updated"
            }
        })
    }
    /**
     * Listen for node logins
     *
     * @param {(WSProtocol|HttpProtocol)} protocol
     * @returns {Observable}
     */
    onNodeLogin(protocol) {
        return this.protocols.on({
            protocol: protocol,
            channel: "node.to.instance",
            action: "login",
            response: {
                channel: "instance.to.node",
                action: "logged"
            }
        })
    }
    /**
     * Send a global message to all clients
     * suggesting to update the nodes list
     *
     * @param {Object} parameters
     */
    toClientsUpdateNodeList(parameters) {
        this.protocols.forEach(protocol => {
            this.protocols.to({
                protocol: protocol,
                channel: "instance.to.client",
                action: "updateOnlineNodes",
                parameters: parameters
            })
        });
    }
}