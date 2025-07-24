const projectService = require("../services/project.service");
const Project = require("../models/project");
const Assignment = require("../models/assignment");


const getEngineerCapacityHandler = async (req, res) => {
  try {
    const engineersCapacity = await projectService.getAllEngineersCapacity();
    res.json(engineersCapacity);
  } catch (err) {
    console.error("Error fetching engineers capacity:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


// GET /api/projects
const getProjects = async (req, res) => {
  try {
    const projects = await projectService.getAllProjects();
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/projects/:id
const getProjectById = async (req, res) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/projects
const createProject = async (req, res) => {
  try {
    const data = { ...req.body, managerId: req.user.id }; // from JWT middleware
    const project = await projectService.createProject(data);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/projects/:id
const updateProject = async (req, res) => {
  try {
    const updated = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/projects/:id
const deleteProject = async (req, res) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/projects/search

const searchProjects = async (req, res) => {
  try {
    const { status, requiredSkills, managerId } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (requiredSkills) filters.requiredSkills = { $in: requiredSkills.split(',') };
    if (managerId) filters.managerId = managerId;

    const projects = await Project.find(filters);

    const projectsWithAssignments = await Promise.all(
      projects.map(async (project) => {
        const assignments = await Assignment.find({ projectId: project._id })
        .populate('engineerId', 'name');
        return {
          ...project.toObject(),
          assignments,
        };
      })
    );

    res.json(projectsWithAssignments);
  } catch (err) {
    console.error('Error searching projects:', err);
    res.status(500).json({ message: err.message });
  }
};


module.exports = {
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  searchProjects,
  getEngineerCapacityHandler
};
