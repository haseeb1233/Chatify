const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  consId:{type:Number,required:true},
  sendBy:{type:String,required:true},
  msg:{type:String,required:true},
  time:{type:String,required:true}
});

const msgModel = mongoose.model("message", userSchema);

module.exports = { msgModel };
