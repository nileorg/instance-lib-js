const { Observable } = require('rxjs');

module.exports = class InstanceWsProtocol {
    constructor(ws) {
        this.ws = ws
        this.socket = null
    }
    setSocket(socket) {
        this.socket = socket
    }
    to(channel, action, parameters, confirm) {
        this.socket.emit(channel, {
            action: action,
            parameters: parameters
        })
        return confirm()
    }
    on(channel, action, response) {
        return Observable.create((observer) => {
            this.socket.on(channel, data => {
                const message_id = "uniquemessage_id"
                if (data.action === action) {
                    observer.next({ok: (parameters) => this.to(response.channel, response.action, parameters), parameters: data.parameters })
                }
            })
        })
    }
}
