const express = require("express");
const connectDB = require("./config/db");

const app = express();

// Connect to database
connectDB();

// Use express bodyParser
app.use(express.json());



// Use routes
app.use("/api/user", require("./routes/api/userRoute"));
app.use("/api/auth", require("./routes/api/authRoute"));
app.use("/api/profile", require("./routes/api/profileRoute"));
app.use("/api/admin", require("./routes/api/adminRoute"));
app.use("/api/ride", require("./routes/api/rideRoute"));
app.use("/api/request", require("./routes/api/requestRoute"));
app.use("/api/contact", require("./routes/api/contactRoute"));

// Listen to port
const PORT = process.env.PORT || 6000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}...`));
