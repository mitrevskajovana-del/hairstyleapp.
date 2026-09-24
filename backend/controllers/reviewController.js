const Review = require("../models/Review");

// GET ALL REVIEWS
// Сите можат да ги гледаат reviews, и гости без најава
exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate("user", "name")
      .populate("hairstyle", "name price image")
      .sort({ createdAt: -1 });

    res.json(reviews);
  } catch (error) {
    console.error("Get reviews error:", error);

    res.status(500).json({
      message: "Server error while getting reviews.",
    });
  }
};

// CREATE REVIEW
// Само најавени корисници
exports.createReview = async (req, res) => {
  try {
    const { hairstyle, comment, rating } = req.body;

    if (!hairstyle || !comment || rating === undefined) {
      return res.status(400).json({
        message: "Hairstyle, comment and rating are required.",
      });
    }

    const review = await Review.create({
      user: req.user.id,
      hairstyle,
      comment: comment.trim(),
      rating: Number(rating),
    });

    const populatedReview = await Review.findById(review._id)
      .populate("user", "name")
      .populate("hairstyle", "name price image");

    res.status(201).json({
      message: "Review created successfully.",
      review: populatedReview,
    });
  } catch (error) {
    console.error("Create review error:", error);

    res.status(500).json({
      message: "Server error while creating review.",
    });
  }
};

// UPDATE REVIEW
// Корисникот може да го менува само својот review
exports.updateReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found.",
      });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only update your own review.",
      });
    }

    const { comment, rating } = req.body;

    if (comment !== undefined) {
      review.comment = comment.trim();
    }

    if (rating !== undefined) {
      review.rating = Number(rating);
    }

    await review.save();

    const populatedReview = await Review.findById(review._id)
      .populate("user", "name")
      .populate("hairstyle", "name price image");

    res.json({
      message: "Review updated successfully.",
      review: populatedReview,
    });
  } catch (error) {
    console.error("Update review error:", error);

    res.status(500).json({
      message: "Server error while updating review.",
    });
  }
};

// DELETE REVIEW
// Корисникот може да го избрише само својот review
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        message: "Review not found.",
      });
    }

    if (review.user.toString() !== req.user.id) {
      return res.status(403).json({
        message: "You can only delete your own review.",
      });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.json({
      message: "Review deleted successfully.",
    });
  } catch (error) {
    console.error("Delete review error:", error);

    res.status(500).json({
      message: "Review could not be deleted.",
    });
  }
};