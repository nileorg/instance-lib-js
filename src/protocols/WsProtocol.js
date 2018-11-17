const { Observable } = require('rxjs');

module.exports = class WsProtocol {
    constructor(ws) {
        this.ws = ws
        this.socket = null
        this.protocol_id = 'ws'
    }
    setSocket(socket) {
        this.socket = socket
    }
    to(recipient, channel, action, parameters, listen) {
        if (recipient) {
            this.socket.to(recipient).emit(channel, {
                action: action,
                parameters: parameters
            })
        } else {
            this.ws.emit(channel, {
                action: action,
                parameters: parameters
            })
        }
        if(listen) {
            return new Promise(resolve => {
                this.socket.on(listen.channel, data => {
                    if(data.action === listen.action) {
                        resolve(data.parameters)
                    }
                })
            })
        }
    }
    on(channel, action, response) {
        return Observable.create((observer) => {
            this.socket.on(channel, data => {
                if (data.action === action) {
                    observer.next({
                        ok: (parameters) => this.to(this.socket.socket_id, response.channel, response.action, parameters),
                        parameters: data.parameters,
                        protocol: this.protocol_id
                    })
                }
            })
        })
    }
}
