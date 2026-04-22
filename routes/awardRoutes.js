const express = require("express");
const router = express.Router();
const awardController = require("../controllers/awardController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");
const awardUpload = require("../middleware/awardUploadMiddleware");

router.put("/reorder", verifyToken, verifyPermission("awards", "edit"), awardController.reorderAwards);
router.get("/", awardController.getAllAwards);
router.get("/:id", awardController.getAwardById);
router.post("/", verifyToken, verifyPermission("awards", "create"), awardUpload.single("image"), awardController.createAward);
router.put("/:id", verifyToken, verifyPermission("awards", "edit"), awardUpload.single("image"), awardController.updateAward);
router.delete("/:id", verifyToken, verifyPermission("awards", "delete"), awardController.deleteAward);

module.exports = router;
