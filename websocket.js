const ws = require('ws');
const url = require('url');
const jwt = require('jsonwebtoken');

const websocket = {};

const SocketServer = ws.Server;

var wss = {};

const clients = {}


websocket.init = (server) => {
  wss = new SocketServer({ server })
  wss.on('connection', (ws, req) => {

    const parameters = url.parse(req.url, true);

    const token = parameters.query.token;

    const decoded = jwt.verify(token, 'pad-key');

    const clientId = decoded.id;

    clients[clientId] = ws;

    // console.log(`Client connected with ID: ${clientId}`);

    ws.send('server connected')

    ws.on('message', data => {
      console.log('message', data)
    })
    ws.on('close', () => {
      console.log('close connected')
    })
  })
}

websocket.send = (message, clientId = null) => {
  if (clientId) {
    const client = clients[clientId];
    // console.log(client, clients)
    if (client && client.readyState === ws.OPEN) {
      client.send(message);
    }
  } else {
    wss.clients.forEach((client) => {
      if (client.readyState === ws.OPEN) {
        client.send(message);
      }
    });
  }
}

module.exports = websocket;