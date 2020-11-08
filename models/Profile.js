const mongoose = require("mongoose");

const profileSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },    
  user_name: {
    type: String,
  },    
  avatar: {
    type: String
  },
  bio: {
    type: String,
  },
  studyAt: {
    type: String,
  },
  workAt: { 
    type: String,
  },
  residence: {
    type: String
  },
  sex: {
    type: String,
    required: true,
  },
  carModel: {
    type: String,
    required: true,
  },
  dateOfBirth: {
    type: Date,
    required: true,
  },
  privacy: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("profile", profileSchema);
