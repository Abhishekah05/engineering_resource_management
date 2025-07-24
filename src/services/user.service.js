const User = require("../models/user");

const getAllEngineers = async () => {
  return await User.find({ role: "engineer" });
};

const getEngineerById = async (id) => {
  return await User.findById(id);
};

const getEngineerCapacity = async (engineer, assignments) => {
  const totalAllocated = assignments.reduce((sum, a) => sum + a.allocationPercentage, 0);
  return engineer.maxCapacity - totalAllocated;
};

const createUser = async (data) => {
  return await User.create(data);
};

const findByEmail = async (email) => {
  return await User.findOne({ email });
};

const updateUser = async (id, updates) => {
  return await User.findByIdAndUpdate(id, updates, { new: true });
};

const searchUsers = async (filters) => {
  const query = {};
  if (filters.skills) query.skills = { $in: filters.skills };
  if (filters.seniority) query.seniority = filters.seniority;
  if (filters.department) query.department = filters.department;

  return await User.find(query);
};

module.exports = {
  getAllEngineers,
  getEngineerById,
  getEngineerCapacity,
  createUser,
  findByEmail,
  updateUser,
  searchUsers
};
