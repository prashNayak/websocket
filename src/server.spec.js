var assert = require('assert');
var fs = require('fs');
var mockery = require('mockery');
var sinon = require('sinon');

describe('websocket-server', function () {
  var server, serverPort, wss, printLogStub = sinon.spy(function (msg) {
    console.log("TESTLOG: " + msg);
  });

  it('gets Websockets! response for Hello message', function (done) {
    var WebSocket = require('ws'),
      wsClient = new WebSocket("ws://127.0.0.1:"+serverPort);

    wsClient.once('message', function (msg) {
      assert.equal(msg, 'Websockets!');
      done();
    });
    wsClient.on('open', function () {
      wsClient.send('Hello');
    });
  });

  it('prints received message', function (done) {
    var WebSocket = require('ws'),
      wsClient = new WebSocket("ws://127.0.0.1:"+serverPort);
    wsClient.on('open', function () {
      printLogStub.reset();
      wsClient.send('Some message');
      wsClient.close();
    });
    wsClient.on('close', function () {
      assert(printLogStub.calledWithMatch('Some message'));
      done();
    });
  });


  it('prints client\'s IP address on receiving message', function (done) {
    var WebSocket = require('ws'),
      wsClient = new WebSocket("ws://127.0.0.1:"+serverPort);

    wsClient.on('open', function () {
      printLogStub.reset();
      wsClient.send('Some message');
      wsClient.close();
    });
    wsClient.on('close', function () {
      assert(printLogStub.calledWithMatch('127.0.0.1'));
      done();
    });
  });

  it('prints number of clients after connecting', function (done) {
    printLogStub.reset();
    var WebSocket = require('ws'),
      wsClient = new WebSocket("ws://127.0.0.1:"+serverPort);

    wsClient.on('open', function () {
      assert(printLogStub.calledWithMatch('Client 1 connected'), 'Should print "Client 1 connected"');
      printLogStub.reset();
      var wsClient2 = new WebSocket("ws://127.0.0.1:"+serverPort);
      wsClient2.on('open', function () {
        assert(printLogStub.calledWithMatch('Client 2 connected'), 'Should print "Client 2 connected"');
        wsClient2.terminate();
        wsClient.terminate();
        done();
      });
    });
  });

  it('updates number of clients after disconnecting', function (done) {
    printLogStub.reset();
    var WebSocket = require('ws'),
      wsClient = new WebSocket("ws://127.0.0.1:"+serverPort);

    wsClient.on('open', function () {
      assert(printLogStub.calledWithMatch('Client 1 connected'), 'Should print "Client 1 connected"');
      printLogStub.reset();
      var wsClient2 = new WebSocket("ws://127.0.0.1:"+serverPort);
      wsClient2.on('open', function () {
        assert(printLogStub.calledWithMatch('Client 2 connected'), 'Should print "Client 2 connected"');
        wsClient2.terminate();
      });
      wsClient2.on('close', function () {
        printLogStub.reset();
        var wsClient3 = new WebSocket("ws://127.0.0.1:"+serverPort);
        wsClient3.on('open', function () {
          assert(printLogStub.calledWithMatch('Client 2 connected'), 'Should print "Client 2 connected" for third client');
          wsClient3.terminate();
          done();
        });
      });
    });
  });

  before(function () {
    mockery.enable({
      warnOnReplace: false,
      warnOnUnregistered: false,
      useCleanCache: true
    });
    mockery.registerMock('./printLog', printLogStub);
  });
  after(function () {
    mockery.disable();
  });
  function randomPort () {
      return Math.floor(Math.random() * 57000 + 7000);
  }
  beforeEach(function (done) {
    try {
      var http = require('http');
      serverPort = randomPort();
      server = http.createServer(function (request, response) {
        response.writeHead(404);
        response.end();
      });
      server.listen(serverPort, '127.0.0.1', function () {
        try {
          wss = require('./server').makeServer(server);
        } catch (e) {
          console.log("Error occurred while running the server", e);
        }
        done();
      });
      printLogStub.reset();
    } catch (e) {
      done();
    }
  });
  afterEach(function (done) {
    try {
      if (server && server.close) {
        wss.close();
        server.close(function () {
          done();
        });
      }
    } catch (e) {
      done();
    }
  });
});
