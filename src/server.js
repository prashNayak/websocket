var printLog = require('./printLog');

function makeServer(server) {
  var WSServer = require('ws').Server;
  var wss = new WSServer({server:server});
  var connections = 0;

/** What this does is creates the listening socket server. It adds an event listener for message so when a client connects
 to the server that client can then send messages and that event handler will fire. */

  wss.on('connection', function (socket, req) {
    connections++;
    
    /**When the client is connected the server should call the `printLog` function with following message: 
    `"Client X connected"` where X is a number of active clients currently connected to the server */
    printLog("Client " + connections + " connected");
    
    socket.on('message',function incoming(message){

      //The remote IP address can be obtained from the raw socket
      const ip = req.connection.remoteAddress;
     
      printLog(ip);
      printLog(message, function(result){
       return result;
      })

      
    });
    //the server should send `"Websockets!"` back to the client
     socket.send('Websockets!');
    socket.on('close', function close() {
      connections--;
    });
  });
  return wss;
}
module.exports = {
  makeServer : makeServer
};