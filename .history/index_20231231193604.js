const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const https = require('https');
const fss = require('fs');
const WebSocket = require('ws')
dotenv.config()

const app = express();
const httpsOptions = {
    cert: fss.readFileSync('./cetificates/cert.pem'),
    key: fss.readFileSync('./cetificates/key.pem')
  };

const server = https.createServer(httpsOptions,app)
//  cert: fss.readFileSync('./cetificates/cert.pem'),
//   key: fss.readFileSync('./cetificates/key.pem')
// });
const wss = new WebSocket.Server({ server });
app.use(cors(
    {
        origin: [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:3001",
            "http://127.0.0.1:3001",
            "http://192.168.33.103:8080",
            "https://attendace-bn4c.onrender.com/"
        ],
        // origin: '*',s
        credentials: true,
        exposedHeaders: ["set-cookie"]
    }
));
app.use(express.json())

require('./routers/history.router')(app);
require('./routers/user.router')(app);
require('./routers/admin.router')(app);

const clients = [];

function broadcast(socket, data) {
    console.log(clients.length);
    for (let i = 0; i < clients.length; i++) {
        if (clients[i] !== socket) {
            clients[i].send(data.toString());
        }
    }
}

wss.on('connection', (socket, req) => {
    clients.push(socket);
    socket.on('message', (message) => {
        console.log('received: %s', message);
        broadcast(socket, message);
    });
    socket.on('close', () => {
        const index = clients.indexOf(socket);
        if (index !== -1) {
            clients.splice(index, 1);
        }
        console.log('disconnected');
    });
});




server.listen(8080,() => {
    console.log('Server is running on port 8080')
})