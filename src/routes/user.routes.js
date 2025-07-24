const express = require("express");
const router = express.Router();
const userController = require("../controllers/user.controller");
const { auth } = require("../../middlewares/auth");

// Auth
router.post("/auth/register", userController.register);
router.post("/auth/login", userController.login);

// Profile
router.get("/users/me", auth, userController.getProfile);
router.put("/users/me", auth, userController.updateProfile);
router.get("/users/search", userController.searchUsers);

// Only authenticated users can access
router.get("/engineers", userController.getEngineers);
router.get("/engineers/:id/capacity", userController.getEngineerCapacity);

module.exports = router;
