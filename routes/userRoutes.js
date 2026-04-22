const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");

router.post(
  "/create",
  verifyToken,
  verifyPermission("users", "create"),
  userController.createUser
);
router.get(
  "/all",
  verifyToken,
  verifyPermission("users", "list"),
  userController.getAllUsers
);

router.get(
  "/:id",
  verifyToken,
  verifyPermission("users", "list"),
  userController.getUserById
);

router.put(
  "/:id",
  verifyToken,
  verifyPermission("users", "edit"),
  userController.updateUser
);

router.delete(
  "/:id",
  verifyToken,
  verifyPermission("users", "delete"),
  userController.deleteUser
);

module.exports = router;
