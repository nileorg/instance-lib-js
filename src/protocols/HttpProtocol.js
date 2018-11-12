const { Observable } = require('rxjs');

module.exports = class HttpProtocol {
    constructor(dispatcher) {
        this.dispatcher = dispatcher
    }
    async to(recipient, channel, action, parameters, listen) {
        if(recipient) {
            fetch(recipient + channel, {
                body: {
                    action: action,
                    parameters: parameters
                }
            })
                .then(data => data.json())
                .then(data => {
                    if(listen) {
                        if(data.channel === listen.channel && data.action === listen.action){
                            return data
                        }
                    }
                })
        }
    }
    on(channel, action, response) {
        return Observable.create((observer) => {
            this.dispatcher.onGet("/" + channel + "/" + action, (req, res) => {
                res.writeHead(200, {'Content-Type': 'application/json'});
                observer.next({
                    ok: (parameters) => res.end(JSON.stringify({
                        channel: response.channel,
                        action: response.action,
                        parameters: parameters
                    })),
                    parameters: req.params
                })
            })
        })
    }
}