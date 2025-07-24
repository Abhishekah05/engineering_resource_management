const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes"); // existing
const userRoutes = require("./routes/user.routes");
const projectRoutes = require("./routes/project.routes");
const assignmentRoutes = require("./routes/assignment.routes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api", projectRoutes);
app.use("/api", assignmentRoutes);

// Health check
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

module.exports = app;
