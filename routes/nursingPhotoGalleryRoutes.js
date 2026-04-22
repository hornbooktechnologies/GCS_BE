const express = require("express");
const router = express.Router();
const nursingPhotoGalleryController = require("../controllers/nursingPhotoGalleryController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");
const nursingPhotoGalleryUpload = require("../middleware/nursingPhotoGalleryUploadMiddleware");

router.get("/", nursingPhotoGalleryController.getAllNursingPhotos);
router.get("/:id", nursingPhotoGalleryController.getNursingPhotoById);
router.post("/", verifyToken, verifyPermission("nursing-photo-gallery", "create"), nursingPhotoGalleryUpload.single("image"), nursingPhotoGalleryController.createNursingPhoto);
router.put("/:id", verifyToken, verifyPermission("nursing-photo-gallery", "edit"), nursingPhotoGalleryUpload.single("image"), nursingPhotoGalleryController.updateNursingPhoto);
router.delete("/:id", verifyToken, verifyPermission("nursing-photo-gallery", "delete"), nursingPhotoGalleryController.deleteNursingPhoto);

module.exports = router;
