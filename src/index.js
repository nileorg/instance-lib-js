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

const sqlite3 = require('sqlite3').verbose()
const db = new sqlite3.Database('../var/instance.db')

// Initialize an websocket server
const wsServer = require('socket.io')(server)
server.listen(3334)

let protocols = {}
let ws = new WebSockets(wsServer)
let http = new Http(server)
protocols[ws.ID] = ws
protocols[http.ID] = http
// Initialize the Instance with the object

let instance = new Instance(protocols, db)

// For each protocol initialize the listeners
wsServer.on('connection', (socket) => {
  instance.loadListeners(ws.ID, socket)
})

instance.loadListeners(http.ID, dispatcher)
