const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    date: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },

    time: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },

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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);