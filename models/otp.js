const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    createdAt:{type:Date,required:true},
    email:{type:String,required:true},
    otp:{type:Number,required:true}
});

const otpModel = mongoose.model("otp", userSchema);

module.exports = { otpModel };