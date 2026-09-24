const mongoose = require("mongoose");

const hairstyleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    image: {
      type: String,
      required: true,
      trim: true,
    },

    duration: {
      type: Number,
      required: true,
      min: 15,
      default: 60,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Hairstyle", hairstyleSchema);