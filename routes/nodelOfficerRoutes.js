const express = require("express");
const router = express.Router();
const nodelOfficerController = require("../controllers/nodelOfficerController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const nodelOfficerUpload = require("../middleware/nodelOfficerUploadMiddleware");

router.get("/", verifyToken, verifyRole(["admin"]), nodelOfficerController.getAllNodelOfficers);
router.get("/:id", verifyToken, verifyRole(["admin"]), nodelOfficerController.getNodelOfficerById);
router.post(
  "/",
  verifyToken,
  verifyRole(["admin"]),
  nodelOfficerUpload.single("image"),
  nodelOfficerController.createNodelOfficer,
);
router.put(
  "/:id",
  verifyToken,
  verifyRole(["admin"]),
  nodelOfficerUpload.single("image"),
  nodelOfficerController.updateNodelOfficer,
);
router.delete("/:id", verifyToken, verifyRole(["admin"]), nodelOfficerController.deleteNodelOfficer);

module.exports = router;
