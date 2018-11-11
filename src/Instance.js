const InstanceApi = require("./InstanceApi")

module.exports = class Instance {
    constructor(protocols) {
        this.api = new InstanceApi(protocols)
    }
    loadListeners(protocol) {
        this.api.onNodeRegister(protocol).subscribe(this.onRegisterNode)
    }
    async onRegisterNode({ ok, parameters }) {
        ok({
            msg: "registered"
        })
    }
}
