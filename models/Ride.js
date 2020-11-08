const mongoose = require("mongoose");

const rideSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
  },
  name: {
    type: String,
  },
  avatar: {
    type: String,
  },
  source: {
    type: String,
    required: true,
  },
  destination: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  post_date: {
    type: Date,
    default: Date.now(),
  },
  places:{
    type: Number,
    default: 4
  },
  description: {
    type: String
  },
  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
      },
      name: {
        type: String
      }
    }
  ],
  requests: [
    {
      request:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "request"
      },
      from: {
        type: String
      },
      fromAvatar: {
        type: String
      }
    }
  ],
});

module.exports = mongoose.model("ride", rideSchema);
