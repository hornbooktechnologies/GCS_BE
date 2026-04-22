const express = require("express");
const router = express.Router();
const specialityController = require("../controllers/specialityController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");
const specialityUpload = require("../middleware/specialityUploadMiddleware");

router.get("/", specialityController.getAllSpecialities);
router.get("/:id", specialityController.getSpecialityById);
router.post(
  "/",
  verifyToken,
  verifyPermission("specialities", "create"),
  specialityUpload.fields([
    { name: "top_banner", maxCount: 1 },
    { name: "main_banners", maxCount: 10 },
    { name: "brochure", maxCount: 1 },
  ]),
  specialityController.createSpeciality,
);
router.put(
  "/:id",
  verifyToken,
  verifyPermission("specialities", "edit"),
  specialityUpload.fields([
    { name: "top_banner", maxCount: 1 },
    { name: "main_banners", maxCount: 10 },
    { name: "brochure", maxCount: 1 },
  ]),
  specialityController.updateSpeciality,
);
router.delete("/:id", verifyToken, verifyPermission("specialities", "delete"), specialityController.deleteSpeciality);

module.exports = router;
