const WsProtocol = require('./protocols/WsProtocol')
const HttpProtocol = require('./protocols/HttpProtocol')

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

// Create an object containing the protocols specifications
const WS_PROTOCOL = 'ws'
const HTTP_PROTOCOL = 'http'

let protocols = {}
protocols[WS_PROTOCOL] = new WsProtocol(ws)
protocols[HTTP_PROTOCOL] = new HttpProtocol(dispatcher)

// Initialize the Instance with the object
let instance = new Instance(protocols)

// For each protocol initialize the listeners
ws.on('connection', (socket) => {
  instance.loadListeners(WS_PROTOCOL, socket)
})

instance.loadListeners(HTTP_PROTOCOL)
