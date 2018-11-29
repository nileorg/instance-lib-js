const io = require("socket.io-client");
const expect = require("chai").expect;
// mocha is defined globally, no need to require

describe("Local instance test suite", function () {
  // increase test timeout to 10 seconds
  this.timeout(10000);
  var ws;
  var instance;
  // execution order: 0
  before(function (done) {
    // setup and run local instance (ws server)
    const WsProtocol = require("../src/protocols/WsProtocol");
    const Instance = require("../src/Instance");

    // initialize a websocket server
    ws = require('socket.io').listen(3334);

    // create an object containing the protocols specifications
    const WS_PROTOCOL = "ws";

    let protocols = {};
    protocols[WS_PROTOCOL] = new WsProtocol(ws);

    // initialize the Instance with the object
    instance = new Instance(protocols);

    // for each protocol initialize the listeners
    ws.on("connection", socket => {
      instance.loadListeners(WS_PROTOCOL, socket);
    });
    done()
  });

  // execution order: last
  after(function (done) {
    // cleanup

    // kill local instance (ws server)
    ws.close();
    done();
  });

  describe("Testing instance's protocol", function () {
    let socket
    const assertResponse = function (res, action, parameters) {
      expect(res, "Response is not an object").to.be.an("object");
      expect(res, "Response action property is invalid").to.have.property(
        "action",
        action
      )
      expect(res, "Response parameters are invalid").to.have.deep.property(
        "parameters",
        parameters
      )
    }
    before(function (done) {
      socket = io.connect("http://localhost:3334")
      socket.on("connect", function () {
        done()
      });
    })
    after(function (done) {
      if (socket.connected) {
        socket.disconnect();
      } else {
        // there will not be a connection unless you have done() in beforeEach, socket.on('connect'...)
        console.log("No socket connection to break...");
      }
      done();
    });
    describe("Testing WebSocket protocol", function () {
      it("Should send messages to all sockets", function (done) {
        instance.api.to("instance.to.test", "test", "ws", null, null, { success: true }, {
          channel: "test.to.instance",
          action: "testReceived"
        })
        socket.once("instance.to.test", function (res) {
          assertResponse(res, "test", { success: true });
          done()
        });
      })
    })
  })



  // execution order: 2
  /* describe("Testing interaction between instance and node", function () {
    it("Should register a new node", function (done) {
      socket.emit("node.to.instance", {
        action: "register",
        parameters: "hello"
      });
      instance.on("nodeRegister", (parameters) => {
        expect(parameters, "Parameters changed during request").to.equal("hello")
      })
      socket.once("instance.to.node", function (res) {
        expect(res, "Response is not an object").to.be.an("object");
        expect(res, "Response action property is invalid").to.have.property(
          "action",
          "confirmRegistration"
        );
        expect(res, "Response parameters are invalid").to.have.deep.property(
          "parameters",
          { success: true }
        );
        done();
      });
    });
  });
  */
});
