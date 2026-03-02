const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

const corsOriginsEnv = process.env.CORS_ORIGINS;
const allowedOrigins = (corsOriginsEnv || "http://localhost:5000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// ---------------- MIDDLEWARE ----------------
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server calls and tools without Origin header.
      // If CORS_ORIGINS is not set, allow browser origins by default for easier first deploy.
      if (!corsOriginsEnv) {
        return callback(null, true);
      }
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Not allowed by CORS"));
    }
  })
);
app.use(express.json());

// ---------------- DB ----------------
connectDB();

// ---------------- ROUTES ----------------
// ONE root router that handles everything
app.use("/api", require("./routes/machineRoutes"));

// ---------------- TEST ROUTE ----------------
app.get("/", (req, res) => {
  res.send("AgriMachineHub Backend Running 🚜");
});

// ---------------- SERVER ----------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
