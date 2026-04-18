const express = require("express");
const router = express.Router();
const nursingPhotoGalleryController = require("../controllers/nursingPhotoGalleryController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const nursingPhotoGalleryUpload = require("../middleware/nursingPhotoGalleryUploadMiddleware");

router.get("/", verifyToken, verifyRole(["admin"]), nursingPhotoGalleryController.getAllNursingPhotos);
router.get("/:id", verifyToken, verifyRole(["admin"]), nursingPhotoGalleryController.getNursingPhotoById);
router.post("/", verifyToken, verifyRole(["admin"]), nursingPhotoGalleryUpload.single("image"), nursingPhotoGalleryController.createNursingPhoto);
router.put("/:id", verifyToken, verifyRole(["admin"]), nursingPhotoGalleryUpload.single("image"), nursingPhotoGalleryController.updateNursingPhoto);
router.delete("/:id", verifyToken, verifyRole(["admin"]), nursingPhotoGalleryController.deleteNursingPhoto);

module.exports = router;
