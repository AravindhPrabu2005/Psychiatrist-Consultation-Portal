const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  gender: String,
  age: Number,
  dob: Date,
  phone: String,
  address: String,
  profilePhoto: String
});

module.exports = mongoose.model('User', userSchema);
