const express = require("express");
const router = express.Router();
const Contact = require("../../models/Contact");

// @route  POST /api/contact
// @desc   Add a contact
// @access Public
router.post("/", async (req, res) => {
  try {
    const { fullname, email, message } = req.body;

    const contact = new Contact({
      fullname,
      email,
      message,
    });

    await contact.save();

    res.json(contact);
  } catch (error) {
    res.status(500).json({ msg: "Server error" });
  }
});

module.exports = router;
