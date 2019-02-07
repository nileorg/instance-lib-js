class WebSockets {
  constructor (ws) {
    this.resource = ws
    this.ID = 'ws'
  }
  to (recipient, channel, action, parameters, response) {
    if (recipient) {
      this.resource.to(recipient).emit(channel, {
        action: action,
        parameters: parameters
      })
    } else {
      this.resource.emit(channel, {
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
  disconnect (callback) {
    this.resource.on('connection', socket => {
      socket.on('disconnect', () => callback(this.ID, socket.id))
    })
  }
  loadListeners (bindings) {
    this.resource.on('connection', socket => {
      bindings.forEach(binding => {
        this.on(binding.channel, binding.action, socket, binding.callback, binding.response)
      })
    })
  }
}

exports['default'] = WebSockets
module.exports = exports['default']
