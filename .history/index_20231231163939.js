const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const https = require('https');
const WebSocket = require('wss')
dotenv.config()

const app = express();
const server = https.createServer(app);
const wss = new WebSocket.Server({ server });
app.use(cors(
    {
        origin: [
            "http://localhost:3000",
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

app.use((err,req,res,next)=>{
    console.error(err.stack)
    res.status(500).send('Something broke!')
})


app.listen(8080,() => {
    console.log('Server is running on port 8080')
})