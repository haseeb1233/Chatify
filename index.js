const express = require("express");
require("dotenv").config();
const cors = require("cors");
const { redis } = require("./helpers/redis");
const { connection } = require("./configration/db");
const { userRouer } = require("./routes/userRouter");
const { twitterRouter } = require("./routes/twitterRouter");
const { validator } = require("./middleware/middlewares");
const cookieParser = require("cookie-parser");
const winston = require("winston");
const expressWinston = require("express-winston");
const {chatRouer}= require("./routes/chatRouter")
const {msgModel} = require("./models/messageModle")
const { conModel }  = require("./models/conModle")
const {Server} = require('socket.io');
const http = require('http');



const app = express();
app.use(cors());
app.use(cors({
  origin : '*'
}))
app.use(express.json());
app.use(cookieParser());

// winston logging
app.use(expressWinston.logger({
    transports: [
      new winston.transports.File({
        filename: 'file.log',
        level:"info"
      }),
    ],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json(),
      winston.format.prettyPrint()
    ),
  }));
  
  app.use(expressWinston.errorLogger({
    transports: [
      new winston.transports.Console({
        level:"errer"
      })
    ],
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.json(),
      winston.format.prettyPrint()
    ),
  }));



  app.use("/user", userRouer);
app.use("/twitter", twitterRouter);
app.use("/chat",validator,chatRouer)
const io = new Server(httpServer , {
  cors : {
      origin : '*'
  }
})
app.get("/start" , async(req,res) => {
  // Using setitemout so that the connection should be established
  try {
      setTimeout(()=>{
          res.status(202).send({"ok":true,"msg":"Connection Established successfully"});
      },500)
      
  } catch (error) {
      res.send({"ok":false,"msg":"Something went wrong"});
  }
})
app.post("/create", async (req, res) => {
  try {
      const { roomID, type } = req.body;
      
      await redis.set(`${roomID}`, `${type}`);
      console.log(req.body);
      res.send({ "ok": true, "msg": "Room created successfully" });
  } catch (error) {
      console.log(error);
      res.send({ "ok": false, "msg": "Something went wrong" });
  }
})

app.post('/join', async (req, res) => {
  try {
      const { roomID, type } = req.body;
      let check = await redis.exists(`${roomID}`);

      if(check){
          const dbType = await redis.get(`${roomID}`);
          
          if(dbType == type){
              res.send({ "ok": true, "msg": "Room joined successfully" });
          } else {
              res.send({ "ok": false, "msg": `${type} Room Doesn't Exist`});
          }
      } else {
          res.send({ "ok": false, "msg": "Room Doesn't Exist"});
      }

  } catch (error) {
      console.log(error);
      res.send({ "ok": false, "msg": "Something went wrong" });
  }
})

io.on('connection', (socket) => {
  console.log("new user connected",socket.id);
  socket.on('join-room' , (data) => {

      console.log(data);
      socket.join(data.inp);

  })
  socket.on("chat",async(data)=>{
    //sending msg to that room
    console.log(data.time);
    await conModel.findOneAndUpdate({consId:data.room},{lastMsg:data.msg,lastTime:data.time,sendBy:data.sendBy})
    //{consId:data.room,msg:data.msg,time:data.time}
    let book = new msgModel({consId:data.room,msg:data.msg,time:data.time,sendBy:data.sendBy})
    await book.save()
    io.emit("message",{name:data.sendBy,msg:data.msg,time:data.time,room:data.room})
    console.log({name:data.sendBy,msg:data.msg,time:data.time});
})

})

app.get("/", (req, res) => {
  try{
    res.send({ msg: `welcome to clone of whatsaap` });
  }catch(err){
    logger.error(err)
  }
});


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