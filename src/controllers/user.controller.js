const userService = require("../services/user.service");
const assignmentService = require("../services/assignment.service");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");

// REGISTER /api/auth/register
const register = async (req, res) => {
  try {
    const { email, name, password, role, skills, seniority, maxCapacity, department } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already in use" });

    const hashed = await bcrypt.hash(password, 10);

    const user = await userService.createUser({
      email,
      name,
      password: hashed,
      role,
      skills,
      seniority,
      maxCapacity,
      department
    });

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({ message: "User registered", user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// LOGIN /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userService.findByEmail(email);
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });

    const userObj = user.toObject();
    delete userObj.password;

    res.json({ token, user: userObj });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/me
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId); // Assuming `auth` middleware sets `req.user`
    if (!user) return res.status(404).json({ message: "User not found" });

    const userObj = user.toObject();
    delete userObj.password;

    res.json(userObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/me

const updateProfile = async (req, res) => {
  try {
    const userId = req.user?._id; 
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const updated = await User.findByIdAndUpdate(userId, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updated); 
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// GET /api/engineers
const getEngineers = async (req, res) => {
  try {
    const engineers = await userService.getAllEngineers();
    res.json(engineers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/engineers/:id/capacity
const getEngineerCapacity = async (req, res) => {
  try {
    const engineer = await userService.getEngineerById(req.params.id);
    if (!engineer) return res.status(404).json({ message: "Engineer not found" });

    const assignments = await assignmentService.getActiveAssignmentsForEngineer(engineer._id);
    const capacity = await userService.getEngineerCapacity(engineer, assignments);

    res.json({ engineerId: engineer._id, availableCapacity: capacity });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/search
const searchUsers = async (req, res) => {
  try {
    const { skills, seniority, department } = req.query;
    const filters = {};
    if (skills) filters.skills = Array.isArray(skills) ? skills : skills.split(",");
    if (seniority) filters.seniority = seniority;
    if (department) filters.department = department;

    const users = await userService.searchUsers(filters);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  getEngineers,
  getEngineerCapacity,
  searchUsers
};
