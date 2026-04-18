const express = require("express");
const router = express.Router();
const teamCategoryController = require("../controllers/teamCategoryController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");

router.get("/", verifyToken, verifyRole(["admin"]), teamCategoryController.getAllTeamCategories);
router.get("/:id", verifyToken, verifyRole(["admin"]), teamCategoryController.getTeamCategoryById);
router.post("/", verifyToken, verifyRole(["admin"]), teamCategoryController.createTeamCategory);
router.put("/:id", verifyToken, verifyRole(["admin"]), teamCategoryController.updateTeamCategory);
router.delete("/:id", verifyToken, verifyRole(["admin"]), teamCategoryController.deleteTeamCategory);

module.exports = router;
