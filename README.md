## Task description

Complete the `server.js` file in order to finish the WebSocket server.

1. The server must call a `printLog` function to print the message sent to the server from the client and the IP address of the client.

2. If the message equals `"Hello"` the server should send `"Websockets!"` back to the client.

3. When the client is connected the server should call the `printLog` function with following message: `"Client X connected"` where X is a number of active clients currently connected to the server. 

