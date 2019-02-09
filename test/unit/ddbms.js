/* global describe before after it */
const expect = require('chai').expect

describe("Testing instance's ddbms", function () {
  // increase test timeout to 10 seconds
  this.timeout(10000)

  let ipfsNode
  let instance
  let ws

  before(function (done) {
    // initialize a websocket server
    ws = require('socket.io').listen(3334)

    // initialize an http dispatcher
    const Httpdispatcher = require('httpdispatcher')
    const dispatcher = new Httpdispatcher()

    // setup and run local instance (for both ws and http)
    const WsProtocol = require('../../src/protocols/WebSockets')
    const HttpProtocol = require('../../src/protocols/Http')
    const Instance = require('../../src/Instance')

    // initialize database
    const sqlite3 = require('sqlite3').verbose()
    const db = new sqlite3.Database('var/instance.db', sqlite3.OPEN_READWRITE, function (err) {
      if (err) {
        console.log(err)
      }
    })

    // initialize ipfs
    const IPFS = require('ipfs')
    ipfsNode = new IPFS({
      silent: true,
      repo: 'var/instance',
      config: {
        Addresses: {
          Swarm: ['/ip4/0.0.0.0/tcp/0']
        }
      }
    })
    const Ipfs = require('../../src/ddbms/Ipfs')
    let ddbms = {}
    const ipfsddbms = new Ipfs(ipfsNode)
    ddbms[ipfsddbms.ID] = ipfsddbms
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
    ws.close()
    ipfsNode.stop()
    done()
  })

  describe('Testing IPFS', function () {
    it('Should store and read data', async function () {
      const obj1 = {
        test: 'test'
      }
      const hash = await instance.ddbms['ipfs'].add(obj1)
      expect(hash, 'Could not write to IPFS').to.not.equal(false)
      const obj2 = await instance.ddbms['ipfs'].get(hash)
      expect(obj2, 'Could not read IPFS').to.deep.equal(obj1)
    })
  })
})
