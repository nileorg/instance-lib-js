const InstanceApi = require("./InstanceApi")
const EventEmitter = require('events');

module.exports = class Instance extends EventEmitter {
    constructor(protocols) {
        super()
        this.api = new InstanceApi(protocols)
    }
    loadListeners(protocol, resource) {
        // For each listener assign a function that it will be called each time a message is read
        this.api.onNodeRegister(protocol, resource).subscribe(this.onNodeRegister.bind(this))
        this.api.onNodeUpdate(protocol, resource).subscribe(this.onNodeUpdate.bind(this))
        this.api.onNodeLogin(protocol, resource).subscribe(this.onNodeLogin.bind(this))
        this.api.onClientRegister(protocol, resource).subscribe(this.onClientRegister.bind(this))
    }
    onNodeRegister({ ok, parameters }) {
        console.log("its really mmeeee!! " + parameters)
        this.emit("nodeRegister", parameters)
        // Use ok to reply to that message using predefined channel/action passing the arguments as an object
        ok({ success: true })
    }
    async onNodeLogin({ ok, parameters }) {
        /* let node = await this.isNodeTokenValid(parameters.token)
		if (node) {
			let queue_results = await this.getRecipientQueue(node.node_id)
			let onlineClientsIds = this.onlineClients.map((v) => v['client_id']);
			queue_results.forEach(v => {
				let indexOfOnlineClient = onlineClientsIds.indexOf(v.sender)
				if (indexOfOnlineClient >= 0) {
					v.ws_id = this.onlineClients[indexOfOnlineClient].ws_id
				}
			})
			this.onlineNodes.push({
				ipfs_hash: node.ipfs_hash,
				node_id: node.node_id,
				ws_id: socket.id
            }) */
        if (true) {
            // Send a global message to all the clients
            this.api.toClientsUpdateNodeList({
                onlineNodes: this.onlineNodes
            })
            ok({
                hash: node.ipfs_hash,
                queue: queue_results,
                sucess: true
            })
		} else {
			ok({
                sucess: false
            })
		}
    }
    async onNodeUpdate({ ok, parameters }) {
        console.log(parameters)
        // update the node
        // other stuff
        ok({
            sucess: true,
            msg: "updated!"
        })
    }
    async toNodeRegistered(node) {
        // Send a message to a specific recipient
        const registeredConfirmed = await this.api.toNodeRegistered(node.protocol, node.resource, {
            token: node.token
        })
        console.log(registeredConfirmed)
    }
    async onClientRegister({ ok, parameters, protocol }) {
        // insert into users values (parameters.password, parameters.protocol)
        ok({
            success: true,
            msg: "Client registered!"
        })
    }
}
