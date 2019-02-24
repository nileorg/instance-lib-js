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
        const callbackArguments = {
          protocol: this.ID,
          sender: resourceId,
          parameters: data.parameters,
          authentication: data.authentication,
          reply: (parameters) => this.to(resourceId, response ? response.channel : null, response ? response.action : null, parameters, { listen: null, resource }),
          forwardObject: { recipientObject: data.recipient, action: data.action }
        }
        callback(callbackArguments)
      }
    })
  }
  disconnect (callback) {
    this.resource.on('connection', socket => {
      const callbackArguments = {
        protocol: this.ID,
        sender: socket.id
      }
      socket.on('disconnect', () => callback(callbackArguments))
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
