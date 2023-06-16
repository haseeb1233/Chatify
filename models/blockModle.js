const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
    email:{type:String,required:true},
});

const blockModel = mongoose.model("blockedUser", userSchema);

module.exports = { blockModel };