class WebSockets {
  constructor (ws) {
    this.resource = ws
    this.ID = 'ws'
    this.needsQueue = true
  }
  to (delivery, channel, action, parameters, response) {
    if (delivery) {
      if (typeof delivery === 'object') {
        this.resource.to(delivery.mediator).emit(channel, {
          action: action,
          parameters: parameters,
          recipient: delivery.recipient
        })
      } else if (typeof delivery === 'string') {
        this.resource.to(delivery).emit(channel, {
          action: action,
          parameters: parameters
        })
      }
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
      if (!action || data.action === action) {
        callback(
          this.ID,
          resourceId,
          data.parameters,
          (parameters) => this.to(resourceId, response ? response.channel : null, response ? response.action : null, parameters, { listen: null, resource }),
          { recipientObject: data.recipient, action: data.action }
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
