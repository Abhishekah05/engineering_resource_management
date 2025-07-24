const assignmentService = require("../services/assignment.service");
const Assignment = require("../models/assignment");
const User = require('../models/user');
// GET /api/assignments
const getAssignments = async (req, res) => {
  try {
    const assignments = await assignmentService.getAllAssignments();
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// GET /api/engineers/availability
const getEngineerAvailability = async (req, res) => {
  try {
    const engineers = await User.find({ role: 'engineer' }); 

    const availabilityData = await Promise.all(engineers.map(async (eng) => {
      const assignments = await Assignment.find({ engineerId: eng._id }).populate('projectId','name');
      const totalAllocation = assignments.reduce((sum, a) => sum + (a.allocationPercentage || 0), 0);

      return {
        id: eng._id,
        name: eng.name,
        department: eng.department,
        skills: eng.skills,
        available: Math.max(0, eng.maxCapacity - totalAllocation),
        currentAllocation: totalAllocation,
        assignments,
      };
    }));

    res.json(availabilityData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// GET /api/assignments/engineer/:engineerId
const getAssignmentsByEngineer = async (req, res) => {
  try {
    const assignments = await Assignment.find({ engineerId: req.params.engineerId }).populate('projectId');
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/assignments/project/:projectId
const getAssignmentsByProject = async (req, res) => {
  try {
    const assignments = await Assignment.find({ projectId: req.params.projectId });
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/assignments
const createAssignment = async (req, res) => {
  try {
    const { engineerId, projectId, allocationPercentage, ...rest } = req.body;
    let existingAssignment = await Assignment.findOne({ engineerId, projectId });
    if (existingAssignment) {
      existingAssignment.allocationPercentage = allocationPercentage;
      Object.assign(existingAssignment, rest); 
      const updated = await existingAssignment.save();
      return res.status(200).json(updated);
    }

    const assignment = await Assignment.create({ engineerId, projectId, allocationPercentage, ...rest });
    res.status(201).json(assignment);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/assignments/:id
const updateAssignment = async (req, res) => {
  try {
    const updated = await assignmentService.updateAssignment(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/assignments/:id
const deleteAssignment = async (req, res) => {
  try {
    await assignmentService.deleteAssignment(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getEngineerAvailability,
  getAssignments,
  getAssignmentsByEngineer,
  getAssignmentsByProject,
  createAssignment,
  updateAssignment,
  deleteAssignment,
};
