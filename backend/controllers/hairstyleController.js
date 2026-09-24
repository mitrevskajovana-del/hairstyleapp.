const Hairstyle = require("../models/Hairstyle");
const Appointment = require("../models/Appointment");

// GET ALL HAIRSTYLES
exports.getHairstyles = async (req, res) => {
  try {
    const hairstyles = await Hairstyle.find().sort({ name: 1 });

    res.json(hairstyles);
  } catch (error) {
    console.error("Get hairstyles error:", error);

    res.status(500).json({
      message: "Server error while getting hairstyles.",
    });
  }
};

// GET ONE HAIRSTYLE
exports.getHairstyleById = async (req, res) => {
  try {
    const hairstyle = await Hairstyle.findById(req.params.id);

    if (!hairstyle) {
      return res.status(404).json({
        message: "Hairstyle not found.",
      });
    }

    res.json(hairstyle);
  } catch (error) {
    console.error("Get hairstyle error:", error);

    res.status(500).json({
      message: "Server error while getting hairstyle.",
    });
  }
};

// CREATE HAIRSTYLE
exports.createHairstyle = async (req, res) => {
  try {
    const { name, description, price, image, duration } = req.body;

    if (!name || !description || price === undefined || !image) {
      return res.status(400).json({
        message:
          "Name, description, price and image are required.",
      });
    }

    const hairstyle = await Hairstyle.create({
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      image: image.trim(),
      duration: duration ? Number(duration) : 60,
    });

    res.status(201).json({
      message: "Hairstyle created successfully.",
      hairstyle,
    });
  } catch (error) {
    console.error("Create hairstyle error:", error);

    res.status(500).json({
      message: "Server error while creating hairstyle.",
    });
  }
};

// UPDATE HAIRSTYLE
exports.updateHairstyle = async (req, res) => {
  try {
    const hairstyle = await Hairstyle.findById(req.params.id);

    if (!hairstyle) {
      return res.status(404).json({
        message: "Hairstyle not found.",
      });
    }

    const {
      name,
      description,
      price,
      image,
      duration,
    } = req.body;

    if (name !== undefined) {
      hairstyle.name = name.trim();
    }

    if (description !== undefined) {
      hairstyle.description = description.trim();
    }

    if (price !== undefined) {
      hairstyle.price = Number(price);
    }

    if (image !== undefined) {
      hairstyle.image = image.trim();
    }

    if (duration !== undefined) {
      hairstyle.duration = Number(duration);
    }

    await hairstyle.save();

    res.json({
      message: "Hairstyle updated successfully.",
      hairstyle,
    });
  } catch (error) {
    console.error("Update hairstyle error:", error);

    res.status(500).json({
      message: "Server error while updating hairstyle.",
    });
  }
};

// DELETE HAIRSTYLE
exports.deleteHairstyle = async (req, res) => {
  try {
    const hairstyle = await Hairstyle.findById(req.params.id);

    if (!hairstyle) {
      return res.status(404).json({
        message: "Hairstyle not found.",
      });
    }

    // Не дозволуваме бришење ако постојат резервации
    const appointments = await Appointment.countDocuments({
      hairstyle: hairstyle._id,
    });

    if (appointments > 0) {
      return res.status(400).json({
        message:
          "This hairstyle cannot be deleted because it has existing appointments.",
      });
    }

    await Hairstyle.findByIdAndDelete(req.params.id);

    res.json({
      message: "Hairstyle deleted successfully.",
    });
  } catch (error) {
    console.error("Delete hairstyle error:", error);

    res.status(500).json({
      message: "Server error while deleting hairstyle.",
    });
  }
};

// TOP 3 MOST REQUESTED HAIRSTYLES
exports.getTopHairstyles = async (req, res) => {
  try {
    const top = await Appointment.aggregate([
      {
        $match: {
          hairstyle: { $ne: null },
        },
      },

      {
        $group: {
          _id: "$hairstyle",
          count: { $sum: 1 },
        },
      },

      {
        $sort: {
          count: -1,
        },
      },

      {
        $limit: 3,
      },

      {
        $lookup: {
          from: "hairstyles",
          localField: "_id",
          foreignField: "_id",
          as: "hairstyle",
        },
      },

      {
        $unwind: "$hairstyle",
      },

      {
        $project: {
          _id: "$hairstyle._id",
          name: "$hairstyle.name",
          description: "$hairstyle.description",
          price: "$hairstyle.price",
          image: "$hairstyle.image",
          duration: "$hairstyle.duration",
          count: 1,
        },
      },
    ]);

    res.json(top);
  } catch (error) {
    console.error("Get top hairstyles error:", error);

    res.status(500).json({
      message: "Server error while getting top hairstyles.",
    });
  }
};