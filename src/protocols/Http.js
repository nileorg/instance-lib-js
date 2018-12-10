const fetch = require('node-fetch')
class Http {
  constructor (http) {
    this.http = http
    this.ID = 'http'
  }
  to (recipient, channel, action, parameters, response) {
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
        if (response) {
          if (data.channel === response.channel && data.action === response.action) {
            response.callback(this.ID, recipient, data)
          }
        }
      })
  }
  on (channel, action, resource, callback, response) {
    resource.onGet('/' + channel + '/' + action, (req, res) => {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      callback(
        this.ID,
        req.domain_sender,
        req.params,
        (parameters) => res.end(JSON.stringify({
          channel: response.channel,
          action: response.action,
          parameters: parameters
        }))
      )
    })
  }
}

exports['default'] = Http
module.exports = exports['default']
