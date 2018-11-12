const { Observable } = require('rxjs');

module.exports = class WsProtocol {
    constructor(ws) {
        this.ws = ws
        this.socket = null
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
        return new Promise(resolve => {
            this.socket.on(listen.channel, data => {
                if(data.action === listen.action) {
                    resolve(data.parameters)
                }
            })
        })
    }
    on(channel, action, response) {
        return Observable.create((observer) => {
            this.socket.on(channel, data => {
                if (data.action === action) {
                    observer.next({
                        ok: (parameters) => this.to(response.channel, response.action, parameters),
                        parameters: data.parameters
                    })
                }
            })
        })
    }
}
