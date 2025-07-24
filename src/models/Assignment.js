const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  engineerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },
  allocationPercentage: { type: Number, required: true }, // 0 to 100
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  role: { type: String } // e.g., Developer, Tech Lead, etc.
}, {
  timestamps: true
});

module.exports = mongoose.model("Assignment", assignmentSchema);
