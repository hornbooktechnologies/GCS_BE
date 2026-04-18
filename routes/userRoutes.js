const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");

router.post(
  "/create",
  verifyToken,
  verifyRole(["admin"]),
  userController.createUser
);
router.get(
  "/all",
  verifyToken,
  verifyRole(["admin", "hr", "manager"]),
  userController.getAllUsers
);

router.get(
  "/:id",
  verifyToken,
  verifyRole(["admin", "hr", "manager"]),
  userController.getUserById
);

router.put(
  "/:id",
  verifyToken,
  verifyRole(["admin"]),
  userController.updateUser
);

router.delete(
  "/:id",
  verifyToken,
  verifyRole(["admin"]),
  userController.deleteUser
);

module.exports = router;
