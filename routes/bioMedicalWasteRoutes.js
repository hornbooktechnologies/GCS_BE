const express = require("express");
const controller = require("../controllers/bioMedicalWasteController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", controller.getPublicRecords);
router.get(
  "/admin",
  verifyToken,
  verifyPermission("bio-medical-waste", "list"),
  controller.getAdminRecords,
);
router.get(
  "/admin/:id",
  verifyToken,
  verifyPermission("bio-medical-waste", "list"),
  controller.getRecordById,
);
router.post(
  "/",
  verifyToken,
  verifyPermission("bio-medical-waste", "create"),
  controller.createRecord,
);
router.put(
  "/:id",
  verifyToken,
  verifyPermission("bio-medical-waste", "edit"),
  controller.updateRecord,
);
router.delete(
  "/:id",
  verifyToken,
  verifyPermission("bio-medical-waste", "delete"),
  controller.deleteRecord,
);

module.exports = router;

