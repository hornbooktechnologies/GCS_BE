const express = require("express");
const router = express.Router();
const journalController = require("../controllers/journalController");
const { verifyToken, verifyRole } = require("../middleware/authMiddleware");
const journalUpload = require("../middleware/journalUploadMiddleware");

router.get("/", verifyToken, verifyRole(["admin"]), journalController.getAllJournals);
router.get("/:id", verifyToken, verifyRole(["admin"]), journalController.getJournalById);
router.post(
  "/",
  verifyToken,
  verifyRole(["admin"]),
  journalUpload.fields([
    { name: "editorial_pdfs", maxCount: 20 },
    { name: "original_article_pdfs", maxCount: 20 },
    { name: "case_report_pdfs", maxCount: 20 },
  ]),
  journalController.createJournal,
);
router.put(
  "/:id",
  verifyToken,
  verifyRole(["admin"]),
  journalUpload.fields([
    { name: "editorial_pdfs", maxCount: 20 },
    { name: "original_article_pdfs", maxCount: 20 },
    { name: "case_report_pdfs", maxCount: 20 },
  ]),
  journalController.updateJournal,
);
router.delete("/:id", verifyToken, verifyRole(["admin"]), journalController.deleteJournal);

module.exports = router;
