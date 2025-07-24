const Assignment = require("../models/assignment");

// Get all assignments
const getAllAssignments = async () => {
  return await Assignment.find()
    .populate("engineerId", "name skills")
    .populate("projectId", "name status");
};

// Create assignment
const createAssignment = async (data) => {
  return await Assignment.create(data);
};

// Update assignment
const updateAssignment = async (id, updates) => {
  return await Assignment.findByIdAndUpdate(id, updates, { new: true });
};

// Delete assignment
const deleteAssignment = async (id) => {
  return await Assignment.findByIdAndDelete(id);
};

// Get active assignments for an engineer (for capacity)
const getActiveAssignmentsForEngineer = async (engineerId) => {
  const now = new Date();
  return await Assignment.find({
    engineerId,
    startDate: { $lte: now },
    endDate: { $gte: now },
  });
};

module.exports = {
  getAllAssignments,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  getActiveAssignmentsForEngineer,
};
