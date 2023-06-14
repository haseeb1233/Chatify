const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    
    username: {
      type: String,
      trim: true,
      default:"https://source.unsplash.com/random/?user"
    },
    profilePic: {
      type: String,
      trim: true,
      default:"https://source.unsplash.com/random/?user"
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
    },
    mobile: { type: Number, required: false },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

userSchema.pre("save", function (next) {
  if (!this.isModified("password")) return next();
  this.password = bcrypt.hashSync(this.password, 8);
  this.username = this.username.toLowerCase();
  return next();
});

userSchema.methods.comparePassword = function (password) {
  return bcrypt.compareSync(password, this.password);
};

const User = mongoose.model("user", userSchema);
module.exports = User;
