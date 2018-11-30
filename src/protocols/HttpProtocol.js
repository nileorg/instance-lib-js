const { Observable } = require('rxjs')
const fetch = require('node-fetch')

module.exports = class HttpProtocol {
  constructor (dispatcher) {
    this.dispatcher = dispatcher
  }
  to (recipient, channel, action, parameters, listen) {
    if (recipient) {
      return Observable.create((observer) => {
        fetch(recipient + channel + '/' + action, {
          method: 'post',
          body: JSON.stringify({
            action: action,
            parameters: parameters
          }),
          headers: {
            'Content-Type': 'application/json'
          }
        })
          .then(data => data.json())
          .then(data => {
            if (listen) {
              if (data.channel === listen.channel && data.action === listen.action) {
                observer.next(data)
              }
            }
          })
      })
    }
  }
  on (channel, action, response) {
    return Observable.create((observer) => {
      this.dispatcher.onGet('/' + channel + '/' + action, (req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' })
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
