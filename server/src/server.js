const {connection} = require("./configs/db");
const app = require("./index");
require("dotenv").config()



app.listen(process.env.port, async () => {
    try {
        await connection;
     console.log("connected")
    } catch (error) {
        console.log(error.message)
    }
    console.log("listening on port",process.env.port);
  });