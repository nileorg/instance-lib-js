const { Observable } = require('rxjs');

module.exports = class InstanceHttpProtocol {
    constructor(dispatcher, resource) {
        this.dispatcher = dispatcher
        this.resource = resource
    }
    async to(channel, action, parameters) {
        return fetch(this.resource + channel, {
            body: {
                action: action,
                parameters: parameters
            }
        })
    }
    on(channel, action, response) {
        return Observable.create((observer) => {
            this.dispatcher.onGet("/" + channel + "/" + action, (req, res) => {
                res.writeHead(200, {'Content-Type': 'text/html'});
                observer.next({ok: (parameters) => this.to(response.channel, response.action, parameters), req, res })
            })
        })
    }
}