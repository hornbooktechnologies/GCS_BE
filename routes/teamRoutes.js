const express = require("express");
const router = express.Router();
const teamController = require("../controllers/teamController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const teamUpload = require("../middleware/teamUploadMiddleware");

router.get("/", verifyToken, verifyRole(["admin"]), teamController.getAllTeamMembers);
router.get("/:id", verifyToken, verifyRole(["admin"]), teamController.getTeamMemberById);
router.post("/", verifyToken, verifyRole(["admin"]), teamUpload.single("image"), teamController.createTeamMember);
router.put("/:id", verifyToken, verifyRole(["admin"]), teamUpload.single("image"), teamController.updateTeamMember);
router.delete("/:id", verifyToken, verifyRole(["admin"]), teamController.deleteTeamMember);

module.exports = router;
