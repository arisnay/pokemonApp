const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  friends: [String],
  subscription: Object
});

module.exports = mongoose.model("User", userSchema);