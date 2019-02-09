/* global describe before after it */
const expect = require('chai').expect
// protocol dependencies
const io = require('socket.io-client')
const Httpdispatcher = require('httpdispatcher')
const dispatcher = new Httpdispatcher()
function handleRequest (request, response) {
  try {
    dispatcher.dispatch(request, response)
  } catch (err) {
    console.log(err)
  }
}

describe("Testing instance's protocols", function () {
  let instance
  let socket
  let ws
  let http
  const assertResponse = function (res, action, parameters) {
    expect(res, 'Response is not an object').to.be.an('object')
    expect(res, 'Response action property is invalid').to.have.property(
      'action',
      action
    )
    expect(res, 'Response parameters are invalid').to.have.deep.property(
      'parameters',
      parameters
    )
  }

  before(function (done) {
    socket = io.connect('http://localhost:3334')
    http = require('http').createServer(handleRequest)
    http.listen(8888)
    const WsProtocol = require('../../src/protocols/WebSockets')
    const HttpProtocol = require('../../src/protocols/Http')
    const Instance = require('../../src/Instance')
    ws = require('socket.io').listen(3334)
    instance = new Instance({
      'ws': new WsProtocol(ws),
      'http': new HttpProtocol(dispatcher)
    })
    // for each protocol initialize the listeners
    instance.loadListeners()
    done()
  })

  after(function (done) {
    if (socket.connected) {
      socket.disconnect()
    } else {
      console.log('No socket connection to break...')
    }
    ws.close()
    http.close()
    done()
  })

  describe('Testing WebSocket protocol', function () {
    it('Should send messages to all sockets', function (done) {
      instance.protocols['ws'].to(null, 'instance.to.test', 'test', {
        success: true
      })
      socket.once('instance.to.test', res => {
        assertResponse(res, 'test', { success: true })
        done()
      })
    })
    it('Should listen to a socket', function (done) {
      socket.emit('node.to.instance', {
        action: 'ping',
        parameters: {
          success: true
        }
      })
      instance.on('ping', res => {
        expect(res).to.have.property('success', true)
        done()
      })
    })
  })

  describe('Testing HTTP protocol', function () {
    it('Should send and reply to a message', function (done) {
      instance.protocols['http'].to('http://localhost:8888/', 'instance.to.test', 'test', { success: true }, {
        channel: 'test.to.instance',
        action: 'testReceived',
        callback: (protocol, sender, parameters) => {
          assertResponse(parameters, 'testReceived', { success: true })
          done()
        }
      })
      dispatcher.onPost('/instance.to.test/test', (req, res) => {
        res.writeHead(200, { 'Content-Type': 'application/json' })
        const parameters = JSON.parse(req.body)
        assertResponse(parameters, 'test', { success: true })
        res.end(JSON.stringify({
          channel: 'test.to.instance',
          action: 'testReceived',
          parameters: { success: true }
        }))
      })
    })
  })
})
