const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
  friends: [String],
  favorites: [Number], // IDs de Pokémon favoritos
  subscription: Object
});

module.exports = mongoose.model("User", userSchema);