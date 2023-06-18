const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  avtar: { type: String ,default:"https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/WhatsApp_logo-color-vertical.svg/2048px-WhatsApp_logo-color-vertical.svg.png"},
  mobile: { type: Number },
  lastLogin:{ type: String ,default:Date(Date.now())},
  role: {
    type: String,
    required: true,
    enum: ["user"],
    default: "user",
  },
  isActive: { type: Boolean ,default: false },
  isBlocked:{type: Boolean ,default: false}
});

const userModel = mongoose.model("user", userSchema);

module.exports = { userModel };
