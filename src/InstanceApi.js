module.exports = class InstanceApi {
    constructor(protocols) {
        this.protocols = protocols
    }
    toNodeRegistered(protocol, node) {
        if(protocol in this.protocols) {
            return this.protocols[node.protocol].to("instance.to.node", "registered", {
                token: node.token
            }, this.onNodeConfirm)
        }
    }
    onNodeRegister(protocol) {
        if(protocol in this.protocols) {
            return this.protocols[protocol].on("node.to.instance", "register")
        }
    }
    onNodeConfirm(protocol) {
        if(protocol in this.protocols) {
            return this.protocols[protocol].on("node.to.instance", "confirm")
        }
    }
}