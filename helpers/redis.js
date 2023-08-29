require("dotenv").config()
const ioredis = require("ioredis")
const congi ={
    host:process.env.redisHost,
    port:process.env.redisPORT,
    username:"default",
    password:process.env.redisPass
}

const redis = new ioredis(congi)

// redis.on("connect", async() => {
//     console.log("Connected to redis");
//   });
  
//   redis.on("error", (error) => {
//     console.error("RedisLabs connection error:", error);
//   });

module.exports={redis}