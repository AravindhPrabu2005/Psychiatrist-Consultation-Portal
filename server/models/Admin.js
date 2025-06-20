const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  gender: String,
  profilePhoto: String,
  experienceYears: Number,
  specialization: String
});

module.exports = mongoose.model('Admin', adminSchema);
