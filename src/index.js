const express = require("express");
const path = require("path");
const cors = require("cors");

const config = require("./shared/config/index");

const app = express();
const PORT = config.port || 5000;

// Middlewares
app.use(express.json());
app.use(cors());

// Static files for uploaded question images
app.use("/public", express.static(path.join(__dirname, "../public")));
// Friendly alias for uploads
app.use("/uploads", express.static(path.join(__dirname, "../public/uploads")));

// Routes
const router = require("./router");
// app.use("/api/v1", requestLimiter, router);
app.use("/api/v1", router);

// Error handling
app.use(require("./shared/errors/handle"));

// Server start
app.listen(PORT, () => {
  console.log(`Server ${PORT} portida ishga tushdi 🎉`);
});
