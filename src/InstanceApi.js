const Protocols = require('./Protocols')

module.exports = class InstanceApi {
    constructor(protocols) {
        this.protocols = new Protocols(protocols)
    }
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
}