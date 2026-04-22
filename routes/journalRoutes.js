const express = require("express");
const router = express.Router();
const journalController = require("../controllers/journalController");
const { verifyToken, verifyPermission } = require("../middleware/authMiddleware");
const journalUpload = require("../middleware/journalUploadMiddleware");

router.get("/", journalController.getAllJournals);
router.get("/:id", journalController.getJournalById);
router.post(
  "/",
  verifyToken,
  verifyPermission("journals", "create"),
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
  verifyPermission("journals", "edit"),
  journalUpload.fields([
    { name: "editorial_pdfs", maxCount: 20 },
    { name: "original_article_pdfs", maxCount: 20 },
    { name: "case_report_pdfs", maxCount: 20 },
  ]),
  journalController.updateJournal,
);
router.delete("/:id", verifyToken, verifyPermission("journals", "delete"), journalController.deleteJournal);

module.exports = router;
