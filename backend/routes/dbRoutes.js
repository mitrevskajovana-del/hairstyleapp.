const express = require("express");
const bcrypt = require("bcryptjs");

const User = require("../models/User");
const Hairstyle = require("../models/Hairstyle");
const Appointment = require("../models/Appointment");
const Barber = require("../models/Barber");
const Review = require("../models/Review");

const router = express.Router();

router.delete("/clear", async (req, res) => {
  try {
    await Promise.all([
      User.deleteMany({}),
      Hairstyle.deleteMany({}),
      Appointment.deleteMany({}),
      Barber.deleteMany({}),
      Review.deleteMany({}),
    ]);

    res.json({
      message: "Database cleared successfully.",
    });
  } catch (error) {
    console.error("Clear database error:", error);

    res.status(500).json({
      message: "Error while clearing database.",
      error: error.message,
    });
  }
});

router.post("/seed", async (req, res) => {
  try {
    await Promise.all([
      User.deleteMany({}),
      Hairstyle.deleteMany({}),
      Appointment.deleteMany({}),
      Barber.deleteMany({}),
      Review.deleteMany({}),
    ]);

    const adminPassword = await bcrypt.hash("admin123", 10);
    const userPassword = await bcrypt.hash("user123", 10);

    const admin = await User.create({
      name: "Hair Lux Admin",
      email: "admin@hairlux.com",
      password: adminPassword,
      role: "admin",
    });

    const user = await User.create({
      name: "Jovana",
      email: "jovana@hairlux.com",
      password: userPassword,
      role: "user",
    });

    const hairstyles = await Hairstyle.insertMany([
      {
        name: "Bridal Updo",
        description:
          "Elegant bridal updo with a polished finish, perfect for weddings, ceremonies and special occasions.",
        price: 3500,
        image:
          "https://images.unsplash.com/photo-1519699047748-de8e457a634e",
        duration: 120,
      },
      {
        name: "Hollywood Waves",
        description:
          "Glamorous soft waves with a smooth and polished finish inspired by classic Hollywood styling.",
        price: 2200,
        image:
          "https://images.unsplash.com/photo-1560869713-7d0f294a2a30",
        duration: 75,
      },
      {
        name: "Luxury Ponytail",
        description:
          "Sleek and elegant ponytail with a refined finish, ideal for celebrations, evenings and special events.",
        price: 2000,
        image:
          "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e",
        duration: 90,
      },
      {
        name: "Soft Glam Waves",
        description:
          "Natural-looking soft waves with volume and movement for an elegant everyday or special-event look.",
        price: 1800,
        image:
          "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f",
        duration: 60,
      },
      {
        name: "Classic Haircut & Styling",
        description:
          "Professional haircut followed by blow-dry and styling for a clean, fresh and polished appearance.",
        price: 1200,
        image:
          "https://images.unsplash.com/photo-1562322140-8baeececf3df",
        duration: 60,
      },
    ]);

    const barbers = await Barber.insertMany([
      {
        name: "Elena",
        specialization: "Bridal Hairstyles",
        rating: 5,
      },
      {
        name: "Mila",
        specialization: "Hollywood Waves & Glam Styling",
        rating: 4.8,
      },
      {
        name: "Ana",
        specialization: "Modern Hairstyles & Styling",
        rating: 4.9,
      },
    ]);

    await Review.insertMany([
      {
        user: user._id,
        barber: barbers[0]._id,
        comment:
          "Prekrasna frizura za mojata svadba. Elena beshe mnogu profesionalna i vnimatelna.",
        rating: 5,
      },
      {
        user: user._id,
        barber: barbers[1]._id,
        comment:
          "Hollywood waves izgledaa preubavo i izdrzhaa cela vecer. Prezadovolna sum.",
        rating: 5,
      },
      {
        user: user._id,
        barber: barbers[2]._id,
        comment:
          "Mnogu prijatna atmosfera i odlicno sredena kosa. Definitivno bi se vratila.",
        rating: 4,
      },
    ]);

    res.status(201).json({
      message: "Database seeded successfully.",
      data: {
        users: 2,
        hairstyles: hairstyles.length,
        barbers: barbers.length,
        reviews: 3,
        appointments: 0,
      },
      login: {
        admin: {
          email: "admin@hairlux.com",
          password: "admin123",
        },
        user: {
          email: "jovana@hairlux.com",
          password: "user123",
        },
      },
    });
  } catch (error) {
    console.error("Seed database error:", error);

    res.status(500).json({
      message: "Error while seeding database.",
      error: error.message,
    });
  }
});

module.exports = router;