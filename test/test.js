const io = require("socket.io-client");
const expect = require("chai").expect;
// mocha is defined globally, no need to require

describe("WS suite of unit tests", function() {
  // increase test timeout to 10 seconds
  this.timeout(10000);
  var ws;
  var socket;

  // execution order: 0
  before(function(done) {
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
    let instance = new Instance(protocols);

    // for each protocol initialize the listeners
    ws.on("connection", socket => {
      console.log("Local instance is running...");
      instance.loadListeners(WS_PROTOCOL, socket);
    });
    done();
  });

  // execution order: 1
  beforeEach(function(done) {
    // setup socket connection (ws client)
    socket = io.connect("http://localhost:3334");
    socket.on("connect", function() {
      console.log("Socket worked...");
      done();
    });
    socket.on("disconnect", function() {
      console.log("Socket disconnected...");
    });
  });

  // execution order: last
  afterEach(function(done) {
    // cleanup
    if (socket.connected) {
      console.log("Disconnecting socket...");
      socket.disconnect();
    } else {
      // there will not be a connection unless you have done() in beforeEach, socket.on('connect'...)
      console.log("No socket connection to break...");
    }
    // kill local instance (ws server)
    ws.close();
    done();
  });

  // execution order: 2
  describe("Testing interaction between instance and node", function() {
    it("Should register a new node", function(done) {
      socket.emit("node.to.instance", {
        action: "register",
        parameters: "hello"
      });
      socket.once("instance.to.node", function(res) {
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
});
