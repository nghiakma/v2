const express = require('express');
const dotenv = require('dotenv');
const WebSocket = require('ws');
dotenv.config()

const app = express();
app.use(express.json())


app.use((err,req,res,next)=>{
    console.error(err.stack)
    res.status(500).send('Something broke!')
})


app.listen(8080,() => {
    console.log('Server is running on port 8080')
})