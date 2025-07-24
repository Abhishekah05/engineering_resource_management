const express = require("express");
const router = express.Router();
const assignmentController = require("../controllers/assignment.controller");
const { auth, requireManager } = require("../../middlewares/auth");

// Manager-only actions
router.get("/", assignmentController.getAssignments);
router.get('/availability', assignmentController.getEngineerAvailability);

router.get("/engineer/:engineerId", assignmentController.getAssignmentsByEngineer);
router.get("/project/:projectId", assignmentController.getAssignmentsByProject);
router.post("/", auth, requireManager, assignmentController.createAssignment);
router.put("/:id", auth, requireManager, assignmentController.updateAssignment);
router.delete("/:id", auth, requireManager, assignmentController.deleteAssignment);

module.exports = router;
