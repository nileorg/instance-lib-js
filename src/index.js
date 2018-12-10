const WebSockets = require('./protocols/WebSockets')
const Http = require('./protocols/Http')

const Instance = require('./Instance')
// Initialize an http server with httpdispatcher
const server = require('http').createServer(handleRequest)
const Httpdispatcher = require('httpdispatcher')
var dispatcher = new Httpdispatcher()

function handleRequest (request, response) {
  try {
    dispatcher.dispatch(request, response)
  } catch (err) {
    console.log(err)
  }
}

// Initialize an websocket server
const ws = require('socket.io')(server)
server.listen(3334)

let protocols = {}
protocols[WebSockets.ID] = new WebSockets(ws)
protocols[Http.ID] = new Http(server)

// Initialize the Instance with the object
let instance = new Instance(protocols)

// For each protocol initialize the listeners
ws.on('connection', (socket) => {
  instance.loadListeners(WebSockets.ID, socket)
})

instance.loadListeners(Http.ID, dispatcher)
