const InstanceApi = require("./InstanceApi")

module.exports = class Instance {
    constructor(protocols) {
        this.api = new InstanceApi(protocols)
    }
    loadListeners(protocol) {
        this.api.onNodeRegister(protocol).subscribe(this.onNodeRegister)
    }
    async onNodeRegister({ ok, parameters }) {
        console.log(parameters)
        ok({ success: true })
    }
    async toNodeRegistered(node) {
        const registeredConfirmed = await this.api.toNodeRegistered(node.protocol, node.resource, {
            token: node.token
        })
        console.log(registeredConfirmed)
    }
}
