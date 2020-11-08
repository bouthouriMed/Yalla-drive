const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema({
  ride: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ride",
  },
  fromUser_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  fromUser_name: {
    type: String,
  },
  fromUser_avatar: {
    type: String,
  },
  toUser_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  toUser_name: {
    type: String,
  },
  toUser_avatar: {
    type: String,
  },
  status: {
    type: Boolean,
    default: null,
  },
  sent: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("request", requestSchema);
