const express = require('express');
const dotenv = require('dotenv');
const WebSocket = require('ws');
const http = require('http');
dotenv.config()

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
app.use(express.json())

require('./app/routers/history.router')(app);
require('./app/routers/user.router')(app);
require('./app/routers/admin.router')(app);

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