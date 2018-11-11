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
    on(channel, action) {
        return Observable.create((observer) => {
            this.socket.on(channel, data => {
                if (data.action === action) {
                    observer((res) => null, data.parameters)
                }
            })
        })
    }
}
