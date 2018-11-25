const cmd = require("node-cmd");
const io = require("socket.io-client");
const expect = require("chai").expect;
// mocha is defined globally, no need to require

describe("WS suite of unit tests", function() {
  // increase test timeout to 10 seconds
  this.timeout(10000);
  var socket;
  var process;

  // execution order: 0
  before(function(done) {
    // run local instance as a child process
    process = cmd.run("npm start");
    done();
  });

  // execution order: 1
  beforeEach(function(done) {
    // setup socket connection
    socket = io.connect("http://localhost:3334");
    socket.on("connect", function() {
      console.log("worked...");
      done();
    });
    socket.on("disconnect", function() {
      console.log("disconnected...");
    });
  });

  // execution order: last
  afterEach(function(done) {
    // cleanup
    if (socket.connected) {
      console.log("disconnecting...");
      socket.disconnect();
    } else {
      // there will not be a connection unless you have done() in beforeEach, socket.on('connect'...)
      console.log("no connection to break...");
    }
    done();
  });

  // execution order: 2
  describe("Testing interaction between instance and node", function() {
    it("Should register a new node", function(done) {
      socket.emit("node.to.instance", {
        action: "register",
        parameters: "hello"
      });
      socket.on("instance.to.node", function(res) {
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
