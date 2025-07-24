const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["engineer", "manager"], required: true },
  skills: [{ type: String }],
  seniority: { type: String, enum: ["junior", "mid", "senior"] },
  maxCapacity: { type: Number, default: 100 }, 
  department: { type: String },
}, {
  timestamps: true
});

module.exports = mongoose.model("User", userSchema);
