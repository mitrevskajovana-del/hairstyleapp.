const Barber = require("../models/Barber");

// GET ALL BARBERS
exports.getBarbers = async (req, res) => {
  try {
    const barbers = await Barber.find().sort({ name: 1 });

    res.json(barbers);
  } catch (error) {
    console.error("Get barbers error:", error);

    res.status(500).json({
      message: "Server error while getting barbers.",
    });
  }
};

// GET ONE BARBER
exports.getBarberById = async (req, res) => {
  try {
    const barber = await Barber.findById(req.params.id);

    if (!barber) {
      return res.status(404).json({
        message: "Barber not found.",
      });
    }

    res.json(barber);
  } catch (error) {
    console.error("Get barber error:", error);

    res.status(500).json({
      message: "Server error while getting barber.",
    });
  }
};