const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    token:{type:String,required:true},
});

const tokenModel = mongoose.model("token", userSchema);

module.exports = { tokenModel };