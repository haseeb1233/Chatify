const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    userId:{type:String,required:true},
    consId:{type:Number,required:true},
    frendId:{type:String,required:true},
    lastMsg:{type:String,defult:"No Chat Yet"},
    lastTime:{type:String},
    frendAvtar:{type:String},
    self:{type:Boolean},
    frendName:{type:String,required:true},
    myName:{type:String,required:true},
    myAvtar:{type:String,required:true}
});

const conModel = mongoose.model("conversions", userSchema);

module.exports = { conModel };
