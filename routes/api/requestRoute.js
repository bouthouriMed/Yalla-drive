const express = require("express");
const router = express.Router();
const auth = require("../../middlewares/auth");

const Request = require("../../models/Request");
const User = require("../../models/User");
const Ride = require("../../models/Ride");

// @route   GET api/request/in
// @desca   Get Requests In
// @access  Private
router.get("/in", auth, async (req, res) => {
  try {
    const requests = await Request.find({
      toUser_id: req.user.user_id,
    }).populate("ride", [
      "name",
      "avatar",
      "source",
      "destination",
      "date",
      "time",
    ]);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   GET api/request/out
// @desca   Get Requests out
// @access  Private
router.get("/out", auth, async (req, res) => {
  try {
    const requests = await Request.find({
      fromUser_id: req.user.user_id,
    }).populate("ride", [
      "name",
      "avatar",
      "source",
      "destination",
      "date",
      "time",
    ]);
    res.json(requests);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
