const express = require("express");
const router = express.Router();
const projectController = require("../controllers/project.controller");
const { auth, requireManager } = require("../../middlewares/auth");

// Managers only can create, update, delete projects
router.get("/", projectController.getProjects);
router.get("/projects/:id", projectController.getProjectById);
router.post("/", auth, requireManager, projectController.createProject);
router.put("/:id", auth, requireManager, projectController.updateProject);
router.delete("/:id", auth, requireManager, projectController.deleteProject);
router.get("/search", projectController.searchProjects);
router.get('/capacity', projectController.getEngineerCapacityHandler);
module.exports = router;
