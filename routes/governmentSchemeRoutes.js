const express = require("express");
const router = express.Router();
const governmentSchemeController = require("../controllers/governmentSchemeController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");

router.get("/", governmentSchemeController.getAllSchemes);
router.get("/:id", governmentSchemeController.getSchemeById);
router.post("/", verifyToken, verifyPermission("government-schemes", "create"), governmentSchemeController.createScheme);
router.put("/:id", verifyToken, verifyPermission("government-schemes", "edit"), governmentSchemeController.updateScheme);
router.delete("/:id", verifyToken, verifyPermission("government-schemes", "delete"), governmentSchemeController.deleteScheme);

module.exports = router;
