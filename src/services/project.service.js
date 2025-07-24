const Project = require("../models/project");
const User = require("../models/user");
const Assignment = require("../models/assignment");



const getAllProjects = async (req, res) => {
  try {
    const projects = await Project.find();

    const projectsWithAssignments = await Promise.all(
      projects.map(async (project) => {
        const assignments = await Assignment.find({ projectId: project._id }).populate('engineerId'); // optional populate
        return {
          ...project.toObject(),
          assignments,
        };
      })
    );

    res.json(projectsWithAssignments);
  } catch (err) {
    console.error('Error fetching projects with assignments:', err);
    res.status(500).json({ message: err.message });
  }
};

// Get project by ID
const getProjectById = async (id) => {
  return await Project.findById(id).populate("managerId", "name email");
};

// Create a project
const createProject = async (data) => {
  return await Project.create(data);
};


const getAllEngineersCapacity = async () => {
 
  const engineers = await User.find({ role: "engineer" });


  const now = new Date();

  
  const results = await Promise.all(
    engineers.map(async (engineer) => {
      const assignments = await Assignment.find({
        engineerId: engineer._id,
        endDate: { $gte: now }
      });

      const totalAllocated = assignments.reduce(
        (sum, a) => sum + a.allocationPercentage,
        0
      );

      const availableCapacity = Math.max(engineer.maxCapacity - totalAllocated, 0);

      return {
        engineerId: engineer._id,
        name: engineer.name,
        seniority:engineer.seniority, 
        maxCapacity: engineer.maxCapacity,
        availableCapacity,
        totalAllocated,
        utilization: (totalAllocated / engineer.maxCapacity) * 100
      };
    })
  );

  return results;
};



module.exports = {
  getAllProjects,
  getProjectById,
  createProject,
  getAllEngineersCapacity
};
