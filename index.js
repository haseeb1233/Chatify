const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { redis } = require("./helpers/redis");
const { connection } = require("./configration/db");
const {Server} = require('socket.io');
const http = require('http');



const app = express();
app.use(express.json());


const httpServer =  http.createServer(app);


httpServer.listen(process.env.PORT , async() => {
    try {
        await connection;
        console.log(`connected to mongodb`);
        // console.log("Redis connected");
    } catch (error) {
        console.log(error.message)
        // console.log("Redis not connected");
    }
    console.log(`Server started at ${process.env.PORT}`);
  })