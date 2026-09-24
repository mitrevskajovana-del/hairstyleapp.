const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    hairstyle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hairstyle",
      required: true,
    },

    comment: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 1000,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Review", reviewSchema);