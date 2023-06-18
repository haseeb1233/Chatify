require("dotenv").config();
const cors = require("cors");
const {Server} = require('socket.io');
const http = require('http');
const { redis } = require("./helpers/redis");
const { connection } = require("./configration/db");
const { userRouer } = require("./routes/userRouter");
// const { blogeRouter } = require("./allRouters/blogsRouter");
const { twitterRouter } = require("./routes/twitterRouter");
const { validator } = require("./middleware/middlewares");
const cookieParser = require("cookie-parser");
const winston = require("winston");
const expressWinston = require("express-winston");
const express = require("express");
const {chatRouer}= require("./routes/chatRouter")
const {msgModel} = require("./models/messageModle")
const { conModel }  = require("./models/conModle")

const app = express();
app.use(cors());
app.use(cors({
  origin: '*'
}))
const httpServer =  http.createServer(app);
app.use(express.json());
app.use(cookieParser());
app.use(cors());

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
//simple routes after this only

app.use("/user", userRouer);
app.use("/twitter", twitterRouter);
app.use("/chat",validator,chatRouer)
const io = new Server(httpServer , {
  cors : {
      origin : '*'
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
  
httpServer.listen(process.env.PORT , async() => {
  try {
      await connection;
      console.log(`connected to DB..`);
      console.log("Redis connected...");
  } catch (error) {
      console.log("Redis not connected....");
  }
  console.log(`Server started at ${process.env.PORT}`);
})

