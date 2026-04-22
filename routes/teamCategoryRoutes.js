const express = require("express");
const router = express.Router();
const teamCategoryController = require("../controllers/teamCategoryController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");

router.get("/", teamCategoryController.getAllTeamCategories);
router.get("/:id", teamCategoryController.getTeamCategoryById);
router.post("/", verifyToken, verifyPermission("team-categories", "create"), teamCategoryController.createTeamCategory);
router.put("/:id", verifyToken, verifyPermission("team-categories", "edit"), teamCategoryController.updateTeamCategory);
router.delete("/:id", verifyToken, verifyPermission("team-categories", "delete"), teamCategoryController.deleteTeamCategory);

module.exports = router;
