const jwt = require("jsonwebtoken");
const config = require("config");

module.exports = async function (req, res, next) {
  // Get token from header
  const token = req.header("x-auth-token");

  // Check if no token
  if (!token) {
    return res.status(401).json({ msg: "No token, user not authorised" });
  }

  // Verify token
  try {
    const decoded = await jwt.verify(token, config.get("jwtSecret"));
    req.user = decoded;
   
    next();
  } catch (err) {
    res.status(401).json({ msg: "Token not valid" });
  }
};
