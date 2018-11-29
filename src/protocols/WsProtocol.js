const { Observable } = require('rxjs');

module.exports = class WsProtocol {
    constructor(ws) {
        this.ws = ws
        this.protocol_id = 'ws'
    }
    to(recipient, channel, action, parameters, listen, resource) {
        if (recipient) {
            this.ws.to(recipient).emit(channel, {
                action: action,
                parameters: parameters
            })
        } else {
            this.ws.emit(channel, {
                action: action,
                parameters: parameters
            })
        }
        if(listen && resource) {
            return this.on(listen.channel, listen.action, {}, resource)
        }
    }
    on(channel, action, response, resource) {
        return Observable.create((observer) => {
            let resource_id = resource.id
            resource.on(channel, data => {
                if (data.action === action) {
                    observer.next({
                        ok: (parameters) => this.to(resource_id, response.channel, response.action, parameters, null, resource),
                        parameters: data.parameters,
                        protocol: this.protocol_id
                    })
                }
            })
        })
    }
}
