const Redis = require("ioredis");


const redis = new Redis({
    port: 17896, 
    host: 'redis-17896.c301.ap-south-1-1.ec2.cloud.redislabs.com', 
    password: '524j26DVqvknVtQJcEgoTMQN9rhpENUT',
});



module.exports = {redis};