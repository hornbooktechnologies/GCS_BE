const express = require("express");
const router = express.Router();
const specialityController = require("../controllers/specialityController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const specialityUpload = require("../middleware/specialityUploadMiddleware");

router.get("/", verifyToken, verifyRole(["admin"]), specialityController.getAllSpecialities);
router.get("/:id", verifyToken, verifyRole(["admin"]), specialityController.getSpecialityById);
router.post(
  "/",
  verifyToken,
  verifyRole(["admin"]),
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
  verifyRole(["admin"]),
  specialityUpload.fields([
    { name: "top_banner", maxCount: 1 },
    { name: "main_banners", maxCount: 10 },
    { name: "brochure", maxCount: 1 },
  ]),
  specialityController.updateSpeciality,
);
router.delete("/:id", verifyToken, verifyRole(["admin"]), specialityController.deleteSpeciality);

module.exports = router;
