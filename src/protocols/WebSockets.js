class WebSockets {
  constructor (ws) {
    this.ws = ws
    this.ID = 'ws'
  }
  to (recipient, channel, action, parameters, response) {
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
    if (response && response.listen && response.resource) {
      return this.on(response.listen.channel, response.listen.action, {}, response.resource, response.callback)
    }
  }
  on (channel, action, resource, callback, response) {
    let resourceId = resource.id
    resource.on(channel, data => {
      if (data.action === action) {
        callback(
          this.ID,
          resourceId,
          data.parameters,
          (parameters) => this.to(resourceId, response.channel, response.action, parameters, { listen: null, resource })
        )
      }
    })
  }
}

exports['default'] = WebSockets
module.exports = exports['default']
