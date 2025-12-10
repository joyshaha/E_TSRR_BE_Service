const express = require("express");
const cors = require("cors");
const ennvironment = require("dotenv");
const connectDatabase = require("./config/db_connector");

const app = express();

// initialize ennvironment
ennvironment.config();

// Connect to Database
connectDatabase();

// Middleware
app.use(cors({
  origin: "*",
  credentials: true,
}));
app.use(express.json());

// Routes
app.use("/", require("./routes/home"));
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/products", require("./routes/product"));
app.use("/api/2fa", require("./routes/2fa"));

// define default error handler
// function errorHandler(err, req, res, next) {
//   if (res.headersSent) {
//     return next(err);
//   }
//   // console.error(err.stack);
//   res.status(500).json({ error: err.message });
// }
// app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;

