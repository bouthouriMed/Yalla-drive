const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

const auth = require("../../middlewares/auth");

const User = require("../../models/User");

// @route   POST api/auth
// @desca   Login user
// @access  Public
router.post(
  "/",
  [
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Password is required").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      // Check if user does really exists
      const user = await User.findOne({ email });

      if (!user) {
        return res.status(400).json({ errors: [{ msg: "User doesnt exist" }] });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(400).json({ errors: [{ msg: "Wrong credentials" }] });
      }

      const payload = {
        user_id: user._id,
        user_name: user.firstname,
        role: user.role
      };

      jwt.sign(payload, config.get("jwtSecret"), (err, token) => {
        if (err) throw err;
        console.log(user)
        res.json({token, user} );
      });
    } catch (err) {
      console.log(err);
      res.status(500).json({ msg: "Server error" });
    }
  }
);

// @route   GET api/auth
// @desca   Load user
// @access  Private
router.get("/", auth, async (req, res) => {
  try {
    let user = await User.findById(req.user.user_id).select("-password");
    res.json(user);
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
