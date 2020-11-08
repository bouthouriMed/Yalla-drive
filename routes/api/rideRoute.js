const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const auth = require("../../middlewares/auth");
const Ride = require("../../models/Ride");
const User = require("../../models/User");
const Request = require("../../models/Request");

// @route    POST api/ride
// @des      Post a ride
// @access   Private
router.post(
  "/",
  [
    auth,
    [
      check("source", "All fields are required").not().isEmpty(),
      check("destination", "All fields are required").not().isEmpty(),
      check("date", "All fields are required").not().isEmpty(),
      check("time", "All fields are required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { source, destination, date, time, description } = req.body;

      const user = await User.findById(req.user.user_id);

      const ride = new Ride({
        user: user._id,
        name: user.firstname,
        avatar: user.avatar,
        source,
        destination,
        date,
        time,
        description,
      });

      await ride.save();
      res.json(ride);
    } catch (error) {
      console.log(error);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// @route    GET api/ride
// @des      Get all rides
// @access   Public
router.get("/", async (req, res) => {
  try {
    const rides = await Ride.find().sort({ date: -1 });

    res.json(rides);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

// @route    GET api/ride/:id
// @des      Get Specific ride
// @access   Public
router.get("/:id", async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);

    if (!ride) {
      return res.status(404).json({ errors: [{ msg: "Ride not found" }] });
    }

    res.json(ride);
  } catch (error) {
    console.log(error);

    if (error.kind === "ObjectId") {
      return res.status(404).json({ msg: "Ride not found" });
    }
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   DELETE /api/ride/:id
// @desc    Remove current user ride
// @access  Private
router.delete("/:id", auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    const request = await Request.find

    if (!ride) {
      res.status(400).json({ msg: "Ride does not exist" });
    } else {
      if (ride.user.toString() !== req.user.user_id) {
        return res.status(401).json({ msg: "unauthorised action" });
      }
      await ride.remove();



      res.json({ msg: "Ride deleted" });
    }
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   PUT /api/ride/like/:id
// @desc    Like or unlike a ride
// @access  Private
router.put("/like/:id", auth, async (req, res) => {  
  try {
    const ride = await Ride.findById(req.params.id);
    const user = await User.findById(req.user.user_id);
    const rideUser = await User.findById(ride.user.toString());
    console.log(rideUser.firstname);

    // Check if ride already been liked and unlike
    if (
      ride.likes.filter((like) => like.user.toString() === req.user.user_id)
        .length > 0
    ) {
      // Get remove index
      const removeIndex = ride.likes
        .map((like) => like.user.toString())
        .indexOf(req.user.user_id);

      ride.likes.splice(removeIndex, 1);

      await ride.save();

      return res.json(ride.likes);
    }

    // Like the ride
    ride.likes.unshift({ user: req.user.user_id, name: req.user.user_name });

    rideUser.notifications.unshift({
      user: user._id,
      msg: `${user.firstname} has liked your ride post`,
    });

    await rideUser.save();

    await ride.save();

    res.json(ride.likes);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: "Server Error" });
  }
});

// @route   POST /api/ride/send-request/:id
// @desc    Request for a ride
// @access  Private
router.post("/send-request/:id", auth, async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    const user = await User.findById(req.user.user_id);
    const rideUser = await User.findById(ride.user.toString());

    if (!ride) {
      return res
        .status(404)
        .json({ errors: [{ msg: "Ride no longer available" }] });
    }

    let request = await Request.findOne({ fromUser_id: user._id, toUser_id: rideUser._id });

    let requestSent = ride.requests.find(
      (request) => request.from === user._id
    );

    if (request || requestSent) {
      console.log(requestSent);
      return res
        .status(400)
        .json({ errors: [{ msg: "Request already sent" }] });
    }

    request = new Request({
      ride: ride._id,
      fromUser_id: user._id,
      fromUser_name: user.firstname,
      fromUser_avatar: user.avatar,
      toUser_id: rideUser._id,
      toUser_name: rideUser.firstname,
      toUser_avatar: rideUser.avatar,
    });

    await request.save();

    ride.requests.unshift({
      request: request._id,
      from: user.firstname,
      fromAvatar: user.avatar
    });

    rideUser.notifications.unshift({
      user: user._id,
      msg: `${user.firstname} has sent you a ride request`,
    });

    await ride.save();
    await rideUser.save();

    res.json(ride);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   POST /api/ride/accept-request/:request_id
// @desc    Accept request
// @access  Private
router.post("/accept-request/:request_id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);
    const request = await Request.findByIdAndUpdate(
      req.params.request_id,
      { $set: { status: true } },
      { new: true }
    );

    const ride = await Ride.findById(request.ride._id);
    const requestingUser = await User.findById(request.fromUser_id.toString());

    requestingUser.notifications.unshift({
      user: user._id,
      msg: `${user.firstname} has accepted your ride request`,
    });

    ride.places = ride.places - 1;

    await requestingUser.save();
    await request.save();
    await ride.save();

    res.json(request);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   POST /api/ride/decline-request/:request_id
// @desc    Decline request
// @access  Private
router.post("/decline-request/:request_id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);
    const request = await Request.findByIdAndUpdate(
      req.params.request_id,
      { $set: { status: false } },
      { new: true }
    );

    const requestingUser = await User.findById(request.fromUser_id.toString());

    requestingUser.notifications.unshift({
      user: user._id,
      msg: `${user.firstname} has declined your ride request`,
    });

    await requestingUser.save();
    await request.save();

    res.json(request);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route   DELETE /api/ride/delete-request/:request_id
// @desc    Delete request
// @access  Private
router.delete("/delete-request/:request_id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);
    const request = await Request.findById(req.params.request_id);
    const ride = await Ride.findById(request.ride._id);

    await request.remove();

    // Get remove index
    const removeIndex = ride.requests
      .map((request) => request.request)
      .indexOf(request._id);

    ride.requests.splice(removeIndex, 1);

    await ride.save();

    res.json({ msg: "request deleted" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
