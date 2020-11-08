const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const gravatar = require('gravatar');
const normalize = require('normalize-url')

const config = require("config");

const User = require("../../models/User");

// @route   POST api/user
// @desc    Register a user
// @access  Public
router.post(
  "/",
  [
    check("firstname", "First Name is required").not().isEmpty(),
    check("lastname", "Last Name is required").not().isEmpty(),
    check("email", "Please enter a valid email").isEmail(),
    check("password", "Password must include at least 6 characters").isLength({
      min: 6,
    }),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);

      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { firstname, lastname, email, password } = req.body;

      // Check if user exists
      const user = await User.findOne({ email });

      if (user) {
        return res.status(400).json({ errors: [{msg:'User already exists'}] });
      }

      // Get users gravatar
      const avatar = normalize(
        gravatar.url(email, {
          s: '200',
          r: 'pg',
          d: 'mm'
        }),
        { forceHttps: true }
      );

      // Create user
      const newUser = new User({
        firstname,
        lastname,
        email,
        password,
        avatar,
      });

      const salt = await bcrypt.genSalt(10);
      newUser.password = await bcrypt.hash(password, salt);

      await newUser.save();

      const payload = {
        user_id: newUser._id,
        user_name: newUser.firstname
      };

      jwt.sign(payload, config.get("jwtSecret"), (err, token) => {
        if (err) throw err;
        res.json({ token, newUser });
      });
    } catch (err) {
      console.log(err);
    }
  }
);

module.exports = router;
