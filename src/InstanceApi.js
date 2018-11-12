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