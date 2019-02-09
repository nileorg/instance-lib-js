/* global describe before after it */
const expect = require('chai').expect
// mocha is defined globally, no need to require

const IPFS = require('ipfs')
let ipfsNode = null

// protocol dependencies
const io = require('socket.io-client')
const Httpdispatcher = require('httpdispatcher')
const dispatcher = new Httpdispatcher()

describe('Local instance test suite', function () {
  // increase test timeout to 10 seconds
  this.timeout(10000)
  let ws
  let instance
  before(function (done) {
    // setup and run local instance (for both ws and http)
    const WsProtocol = require('../src/protocols/WebSockets')
    const HttpProtocol = require('../src/protocols/Http')
    const Instance = require('../src/Instance')

    // initialize database
    const sqlite3 = require('sqlite3').verbose()
    const db = new sqlite3.Database('var/instance.db', sqlite3.OPEN_READWRITE, function (err) {
      if (err) {
        console.log(err)
      }
    })

    // initialize ipfs
    ipfsNode = new IPFS({
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

    // initialize a websocket server
    ws = require('socket.io').listen(3334)

    // initialize the Instance with the object
    ipfsNode.on('ready', () => {
      instance = new Instance({
        'ws': new WsProtocol(ws),
        'http': new HttpProtocol(dispatcher)
      }, db, ddbms)
      // for each protocol initialize the listeners
      instance.loadListeners()
      done()
    })
  })

  after(function (done) {
    // kill ws server and ipfs node
    ws.close()
    ipfsNode.stop()
    done()
  })

  describe('Integration testing between Instance and Node/Client', function () {
    let socket
    const assertResponse = function (res, action) {
      expect(res, 'Response is not an object').to.be.an('object')
      expect(res, 'Response action property is invalid').to.have.property(
        'action',
        action
      )
      expect(res.parameters, 'Response parameters are invalid').to.have.property(
        'success',
        true
      )
    }

    before(function (done) {
      socket = io.connect('http://localhost:3334')
      done()
    })

    after(function (done) {
      if (socket.connected) {
        socket.disconnect()
      } else {
        console.log('No socket connection to break...')
      }
      done()
    })

    describe('Testing node', function () {
      let token = null
      it('Should register new node', function (done) {
        socket.once('instance.to.node', res => {
          token = res.parameters.token
          assertResponse(res, 'registerConfirm')
          done()
        })
        instance.ddbms['ipfs'].add([
          {
            'type': 'button',
            'action': 'function1',
            'parameters': ['inp1'],
            'label': 'Call function1'
          },
          {
            'type': 'text',
            'key': 'inp1'
          },
          {
            'type': 'output',
            'key': 'out1'
          }
        ]).then(hash => {
          socket.emit('node.to.instance', {
            action: 'register',
            parameters: {
              components: 'ipfs://' + hash,
              information: '{ name: "test_node" }'
            }
          })
        })
      })
      it('Should login existing node', function (done) {
        socket.once('instance.to.node', res => {
          assertResponse(res, 'logged')
          done()
        })
        socket.emit('node.to.instance', {
          action: 'login',
          parameters: {
            token: token
          }
        })
      })
      it('Should update existing node', function (done) {
        socket.once('instance.to.node', res => {
          assertResponse(res, 'updated')
          done()
        })
        socket.emit('node.to.instance', {
          action: 'update',
          parameters: {
            token: token,
            components: 'ipfs://QmQEf7RF89vV5afzM9B7mrfTTprnHuthLCs414fYJ7rzbZ',
            information: '{ name: "test_node_updated" }'
          }
        })
      })
      it('Should logout existing node', function (done) {
        const lengthBeforeLogout = instance.online.nodes.length
        socket.disconnect()
        const onDisconnected = () => {
          const lengthAfterLogout = instance.online.nodes.length
          expect(lengthAfterLogout, 'Online nodes list didn\'t change').to.be.eq(lengthBeforeLogout - 1)
          instance.removeListener('disconnected', onDisconnected)
          done()
        }
        instance.on('disconnected', onDisconnected)
      })
      it('Should delete existing node', function (done) {
        socket = io.connect('http://localhost:3334')
        socket.once('instance.to.node', res => {
          assertResponse(res, 'deleted')
          done()
        })
        socket.emit('node.to.instance', {
          action: 'delete',
          parameters: {
            token: token
          }
        })
      })
    })
  })
})
