const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const fss = require('fs');
const WebSocket = require('ws')
dotenv.config()

const app = express();

const server = http.createServer(app)
//  cert: fss.readFileSync('./cetificates/cert.pem'),
//   key: fss.readFileSync('./cetificates/key.pem')
// });
const wss = new WebSocket.Server({ server });
app.use(cors(
    {
        origin: "https://joyful-centaur-ba23b0.netlify.app/",
        // origin: '*',ss
        credentials: true,
        exposedHeaders: ["set-cookie"]
    }
));
app.use(express.json())
app.all('/', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next()
  });
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