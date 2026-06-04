const express = require("express");
const router = express.Router();
const committeeController = require("../controllers/committeeController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");

// Public
router.get("/", committeeController.getAllCommittees);
router.get("/slug/:slug", committeeController.getCommitteeBySlug);

// Admin: committee CRUD
router.get("/:id", verifyToken, verifyPermission("committees", "read"), committeeController.getCommitteeById);
router.post("/", verifyToken, verifyPermission("committees", "create"), committeeController.createCommittee);
router.put("/:id", verifyToken, verifyPermission("committees", "edit"), committeeController.updateCommittee);
router.delete("/:id", verifyToken, verifyPermission("committees", "delete"), committeeController.deleteCommittee);

// Admin: member management
router.post("/:id/members", verifyToken, verifyPermission("committees", "edit"), committeeController.addMember);
router.put("/:id/members/:memberId", verifyToken, verifyPermission("committees", "edit"), committeeController.updateMember);
router.delete("/:id/members/:memberId", verifyToken, verifyPermission("committees", "edit"), committeeController.deleteMember);

module.exports = router;
