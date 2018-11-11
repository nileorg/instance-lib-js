const InstanceApi  = require("./InstanceApi")

module.exports = class Instance {
    constructor(protocols) {
        this.api = new InstanceApi(protocols)
    }
    loadListeners(protocol) {
        this.api.onNodeRegister(protocol).subscribe(this.onRegisterNode)
    }
    async onRegisterNode(ok, { information, hash }) {
        let ws_id_confirm = ws_id
        // register node then send confirmation
        const { ws_id, confirm } = await this.api.toNodeRegistered(node.protocol, node)

        if (ws_id == ws_id_confirm) {
            if (confirm) {
                console.log(`Node "${ws_id}" confirmed registration`)
            } else {
                console.log(`Node "${ws_id}" didn't confirm registration`)
            }
        }
    }
}
