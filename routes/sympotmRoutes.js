const express = require("express");
const router = express.Router();
const sympotmController = require("../controllers/sympotmController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");
const sympotmUpload = require("../middleware/sympotmUploadMiddleware");

router.get("/", sympotmController.getAllSympotms);
router.get("/:id", sympotmController.getSympotmById);
router.post(
  "/",
  verifyToken,
  verifyPermission("symptoms", "create"),
  sympotmUpload.single("image"),
  sympotmController.createSympotm,
);
router.put(
  "/:id",
  verifyToken,
  verifyPermission("symptoms", "edit"),
  sympotmUpload.single("image"),
  sympotmController.updateSympotm,
);
router.delete("/:id", verifyToken, verifyPermission("symptoms", "delete"), sympotmController.deleteSympotm);

module.exports = router;
