import * as WebSocket from 'ws';

const wss = new WebSocket.Server({ port: 5000 });

wss.on('connection', function connection(ws) {
  ws.on('message', function incoming(message) {
    console.log('received: %s', message);

    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(message));
      }
    });
    ws.send(JSON.stringify(message));
  });

  ws.send(JSON.stringify('connected'));
});
