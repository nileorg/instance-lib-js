const WebSockets = require('./protocols/WebSockets')
const Http = require('./protocols/Http')

const Instance = require('./Instance')
// Initialize an http server with httpdispatcher
const server = require('http').createServer(handleRequest)
const Httpdispatcher = require('httpdispatcher')
var dispatcher = new Httpdispatcher()

const PORT = 3334

function handleRequest (request, response) {
  try {
    dispatcher.dispatch(request, response)
  } catch (err) {
    console.log(err)
  }
}

const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const dbPath = path.resolve(__dirname, '../var/instance.db')
const db = new sqlite3.Database(dbPath)

// Initialize an websocket server
const wsServer = require('socket.io')(server)
server.listen(PORT)

// initialize ipfs
const IPFS = require('ipfs')
let ipfsNode = new IPFS({
  silent: true,
  repo: 'var/instance',
  config: {
    Addresses: {
      Swarm: ['/ip4/0.0.0.0/tcp/0']
    }
  }
})

const Ipfs = require('../src/ddbms/Ipfs')
let ddbms = {}
const ipfsddbms = new Ipfs(ipfsNode)
ddbms[ipfsddbms.ID] = ipfsddbms

// Initialize the Instance with the object
let instance = new Instance({
  'ws': new WebSockets(wsServer),
  'http': new Http(dispatcher)
}, db, ddbms)

instance.loadListeners()

console.log('Server listening on port:', PORT)
