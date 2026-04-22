const express = require("express");
const router = express.Router();
const nodelOfficerController = require("../controllers/nodelOfficerController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");
const nodelOfficerUpload = require("../middleware/nodelOfficerUploadMiddleware");

router.get("/", nodelOfficerController.getAllNodelOfficers);
router.get("/:id", nodelOfficerController.getNodelOfficerById);
router.post(
  "/",
  verifyToken,
  verifyPermission("nodel-officers", "create"),
  nodelOfficerUpload.single("image"),
  nodelOfficerController.createNodelOfficer,
);
router.put(
  "/:id",
  verifyToken,
  verifyPermission("nodel-officers", "edit"),
  nodelOfficerUpload.single("image"),
  nodelOfficerController.updateNodelOfficer,
);
router.delete("/:id", verifyToken, verifyPermission("nodel-officers", "delete"), nodelOfficerController.deleteNodelOfficer);

module.exports = router;
