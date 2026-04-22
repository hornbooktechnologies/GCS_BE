const express = require("express");
const router = express.Router();
const roleController = require("../controllers/roleController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");

router.get(
  "/modules",
  verifyToken,
  verifyPermission("roles", "list"),
  roleController.getModules,
);

router.get("/", verifyToken, verifyPermission("roles", "list"), roleController.getRoles);
router.post("/", verifyToken, verifyPermission("roles", "create"), roleController.createRole);
router.put("/:id", verifyToken, verifyPermission("roles", "edit"), roleController.updateRole);
router.delete(
  "/:id",
  verifyToken,
  verifyPermission("roles", "delete"),
  roleController.deleteRole,
);

module.exports = router;
