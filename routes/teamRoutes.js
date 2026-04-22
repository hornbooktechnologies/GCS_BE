const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");
const teamUpload = require("../middleware/teamUploadMiddleware");

router.get("/", teamController.getAllTeamMembers);
router.get("/:id", teamController.getTeamMemberById);
router.post("/", verifyToken, verifyPermission("team", "create"), teamUpload.single("image"), teamController.createTeamMember);
router.put("/:id", verifyToken, verifyPermission("team", "edit"), teamUpload.single("image"), teamController.updateTeamMember);
router.delete("/:id", verifyToken, verifyPermission("team", "delete"), teamController.deleteTeamMember);

module.exports = router;
