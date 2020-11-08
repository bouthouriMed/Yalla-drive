const express = require("express");
const { check, validationResult } = require("express-validator");

const auth = require("../../middlewares/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

const router = express();

// @route    POST api/profile
// @desc     Initiate profile
// @access   Public
router.post(
  "/",
  [
    auth,
    [
      check("sex", "Sex is required").not().isEmpty(),
      check("carModel", "Car model is required").not().isEmpty(),
      check("dateOfBirth", "Date of birth is required").not().isEmpty(),
    ],
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let profile = await Profile.findOne({ user: req.user.user_id });
      let user = await User.findById(req.user.user_id);

      if (profile) {
        return res.status(400).json({ msg: "profile already created" });
      }

      const {
        residence,
        workAt,
        studyAt,
        sex,
        carModel,
        dateOfBirth,
        bio,
      } = req.body;

      profile = new Profile({
        user: req.user.user_id,
        user_name: req.user.user_name,
        sex,
        carModel,
        dateOfBirth,
        residence,
        workAt,
        studyAt,
        bio,
        avatar: user.avatar,
      });
      await profile.save();
      res.json(profile);
    } catch (err) {
      console.log(err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// @route    PUT api/profile
// @desc     Configure profile
// @access   Private
router.put(
  "/",

  auth,

  async (req, res) => {
    const {
      bio,
      studyAt,
      workAt,
      sex,
      carModel,
      dateOfBirth,
      privacy,
      residence,
    } = req.body;

    try {
      //   Buil profile fields object
      const profileFields = {};
      profileFields.user = req.user.user_id;
      if (residence) profileFields.residence = residence;

      if (bio) profileFields.bio = bio;

      if (studyAt) profileFields.studyAt = studyAt;

      if (workAt) profileFields.workAt = workAt;

      if (sex) profileFields.sex = sex;
      if (carModel) profileFields.carModel = carModel;
      if (dateOfBirth) profileFields.dateOfBirth = dateOfBirth;
      if (privacy) profileFields.privacy = privacy;

      //   Update profile
      let profile = await Profile.findOneAndUpdate(
        { user: req.user.user_id },
        { $set: profileFields },
        { new: true }
      );

      res.json(profile);
    } catch (err) {
      console.log(err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// @route    Get api/profile
// @desc     Get all profiles
// @access   Public
router.get("/", async (req, res) => {
  try {
    const profiles = await Profile.find().populate("user", [
      "firstname",
      "avatar",
    ]);
    res.json(profiles);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route    Get api/profile/me
// @desc     Get current user profile
// @access   Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.user_id,
    }).populate("user", ["firstname", "avatar"]);
    res.json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route    Get api/profile/:id
// @desc     Get specific user profile
// @access   Private
router.get("/:id", async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.params.id,
    }).populate("user", ["firstname", "avatar"]);
    res.json(profile);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});

// @route    DELETE api/profile/:id
// @desc     Delete current user profile
// @access   Private
router.delete("/:id", auth, async (req, res) => {});

module.exports = router;
