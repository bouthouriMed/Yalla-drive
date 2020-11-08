const express = require("express");
const router = express.Router();

const User = require("../../models/User");
const Ride = require("../../models/Ride");
const Profile = require("../../models/Profile");
const Request = require("../../models/Request");
const auth = require("../../middlewares/auth");
const Contact = require("../../models/Contact");

// @router  POST /api/admin/add_admin
// @desc    Add admin
// @access  Private && Admin only
router.post("/add_admin", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);
    console.log(user);

    if (user.role != "admin") {
      return res.status(401).json({ msg: "Only admin authorised" });
    }

    const { firstname, lastname, email, password } = req.body;

    const newAdmin = new User({
      firstname,
      lastname,
      email,
      password,
      role: "admin",
    });
    res.json(newAdmin);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
    console.log(error);
  }
});

// @router  GET /api/admin/get_users
// @desc    Get all users
// @access  Private && Admin only
router.get("/get_users", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.user_id);

    if (user.role != "admin") {
      return res.status(401).json({ msg: "Only admin authorised" });
    }
    const users = await User.find({ role: "user" });

    res.json(users);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
    console.log(error);
  }
});

// @router  DELETE /api/admin/del_user/:id
// @desc    Delete a user (along with profile, rides, all requests)
// @access  Private && Admin only
router.delete("/del_user/:id", auth, async (req, res) => {
  try {
    const admin = await User.findById(req.user.user_id);

    if (admin.role != "admin") {
      return res.status(401).json({ msg: "Only admin authorised" });
    }
    const user = await User.findById(req.params.id);

    await Ride.findOneAndDelete({ user: user._id });
    await Profile.findOneAndDelete({ user: { _id: user._id } });

    const rides = await Ride.find();
    const requestsToDelete = rides.map((ride) =>
      ride.requests.filter((request) => request.from === user.firstname)
    );

    await Ride.updateMany(
      {},
      { $pull: { requests: { from: user.firstname } } },
      { safe: true, multi: true }
    );

    await Request.deleteMany({
      toUser_id: user._id,
    });
    await Request.deleteMany({
      fromUser_id: user._id,
    });

    user.remove();

    res.json("ok");
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
    console.log(error);
  }
});

// @router  DELETE /api/admin/del_ride/:id
// @desc    Delete a ride
// @access  Private && Admin only
router.delete("/del_ride/:id", auth, async (req, res) => {
  const admin = await User.findById(req.user.user_id);

  if (admin.role != "admin") {
    return res.status(401).json({ msg: "Only admin authorised" });
  }

  try {
    const ride = await Ride.findById(req.params.id);
    ride.remove();
    res.json({ msg: "Ride removed" });
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

// @router  GETE /api/admin/contacts
// @desc    Get all contacts
// @access  Private && Admin only
router.get("/contacts", auth, async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ date: -1 });
    res.json(contacts);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
