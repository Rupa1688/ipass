const mongoose = require("mongoose");
require("dotenv").config();
const database = require("./config/database");
const http = require("http");
const express = require("express");
var cors = require('cors')
const fs = require('fs');

const mime = require('mime');


const app = express();

app.use(cors())
app.use(express.json());

const server = http.createServer(app);
const port = process.env.API_PORT;
app.use('/ipass', require('./router/router.js'));
app.use('/api/v1', require('./router/router.js'));
 app.use('/user',require('./router/router.js'));



// server listening 
server.listen(port, () => {
    console.log(`Server running on port ${port},http://localhost:4089`);
});