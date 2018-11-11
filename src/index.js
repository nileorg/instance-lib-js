const InstanceWsProtocol = require("./protocols/InstanceWsProtocol")
const InstanceHttpProtocol = require("./protocols/InstanceHttpProtocol")

const Instance = require("./Instance")
const server = require('http').createServer(handleRequest)
const httpdispatcher  = require('httpdispatcher')
var dispatcher = new httpdispatcher()

function handleRequest(request, response) {
    try {
        dispatcher.dispatch(request, response);
    } catch (err) {
        console.log(err);
    }
}

const ws = require('socket.io')(server)
server.listen(3334)

const WS_PROTOCOL = 'ws'
const HTTP_PROTOCOL = 'http'

let protocols = {}
protocols[WS_PROTOCOL] = new InstanceWsProtocol(ws)
protocols[HTTP_PROTOCOL] = new InstanceHttpProtocol(dispatcher)

let instance = new Instance(protocols)

ws.on("connection", (socket) => {
    instance.protocols[WS_PROTOCOL].setSocket(socket)
    instance.loadListeners(WS_PROTOCOL)
})

instance.loadListeners(HTTP_PROTOCOL)