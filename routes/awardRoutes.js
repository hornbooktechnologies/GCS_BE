const express = require("express");
const router = express.Router();
const awardController = require("../controllers/awardController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const awardUpload = require("../middleware/awardUploadMiddleware");

router.put("/reorder", verifyToken, verifyRole(["admin"]), awardController.reorderAwards);
router.get("/", verifyToken, verifyRole(["admin"]), awardController.getAllAwards);
router.get("/:id", verifyToken, verifyRole(["admin"]), awardController.getAwardById);
router.post("/", verifyToken, verifyRole(["admin"]), awardUpload.single("image"), awardController.createAward);
router.put("/:id", verifyToken, verifyRole(["admin"]), awardUpload.single("image"), awardController.updateAward);
router.delete("/:id", verifyToken, verifyRole(["admin"]), awardController.deleteAward);

module.exports = router;
