const express = require("express");

const router = express.Router();

const {
  getReviews,
  createReview,
  updateReview,
  deleteReview,
} = require("../controllers/reviewController");

const authMiddleware = require("../middleware/authMiddleware");

// GET - сите можат да ги гледаат reviews
router.get("/", getReviews);

// POST - само најавени корисници
router.post("/", authMiddleware, createReview);

// PUT - само најавен корисник, и само свој review
router.put("/:id", authMiddleware, updateReview);

// DELETE - само најавен корисник, и само свој review
router.delete("/:id", authMiddleware, deleteReview);

module.exports = router;