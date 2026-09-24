const Appointment = require("../models/Appointment");
const Hairstyle = require("../models/Hairstyle");

// Convert HH:MM into minutes
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
};

// Convert minutes back to HH:MM
const minutesToTime = (minutes) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(
    2,
    "0"
  )}`;
};

// Get working hours depending on the day
// 0 = Sunday
// 1 = Monday
// 2 = Tuesday
// 3 = Wednesday
// 4 = Thursday
// 5 = Friday
// 6 = Saturday
const getWorkingHours = (dateString) => {
  const date = new Date(`${dateString}T00:00:00`);
  const day = date.getDay();

  // Wednesday - closed
  if (day === 3) {
    return null;
  }

  // Friday, Saturday, Sunday
  if (day === 5 || day === 6 || day === 0) {
    return {
      open: 5 * 60,
      close: 19 * 60,
    };
  }

  // Monday, Tuesday, Thursday
  return {
    open: 9 * 60,
    close: 17 * 60,
  };
};

// Check if two appointments overlap
const hasTimeConflict = async ({
  date,
  time,
  hairstyleId,
  appointmentId = null,
}) => {
  const hairstyle = await Hairstyle.findById(hairstyleId);

  if (!hairstyle) {
    return {
      error: "Hairstyle not found.",
    };
  }

  const workingHours = getWorkingHours(date);

  if (!workingHours) {
    return {
      error: "The salon is closed on Wednesdays.",
    };
  }

  const newStart = timeToMinutes(time);
  const newEnd = newStart + hairstyle.duration;

  if (
    newStart < workingHours.open ||
    newEnd > workingHours.close
  ) {
    return {
      error: `Appointments must be between ${minutesToTime(
        workingHours.open
      )} and ${minutesToTime(workingHours.close)} on this day.`,
    };
  }

  const existingAppointments = await Appointment.find({
    date,
    ...(appointmentId
      ? { _id: { $ne: appointmentId } }
      : {}),
  }).populate("hairstyle");

  for (const appointment of existingAppointments) {
    if (!appointment.hairstyle) {
      continue;
    }

    const existingStart = timeToMinutes(appointment.time);

    const existingEnd =
      existingStart + appointment.hairstyle.duration;

    const overlap =
      newStart < existingEnd &&
      newEnd > existingStart;

    if (overlap) {
      return {
        error: `This time overlaps with an existing appointment (${appointment.time} - ${minutesToTime(
          existingEnd
        )}).`,
      };
    }
  }

  return {
    error: null,
    duration: hairstyle.duration,
    endTime: minutesToTime(newEnd),
  };
};

// GET AVAILABLE TIMES
exports.getAvailableTimes = async (req, res) => {
  try {
    const { date, hairstyle } = req.query;

    if (!date || !hairstyle) {
      return res.status(400).json({
        message: "Date and hairstyle are required.",
      });
    }

    const selectedHairstyle = await Hairstyle.findById(
      hairstyle
    );

    if (!selectedHairstyle) {
      return res.status(404).json({
        message: "Hairstyle not found.",
      });
    }

    const workingHours = getWorkingHours(date);

    // Wednesday
    if (!workingHours) {
      return res.json({
        closed: true,
        message: "The salon is closed on Wednesdays.",
        availableTimes: [],
        bookedTimes: [],
      });
    }

    const existingAppointments = await Appointment.find({
      date,
    }).populate("hairstyle");

    const availableTimes = [];
    const bookedTimes = [];

    // Generate times every 30 minutes
    for (
      let start = workingHours.open;
      start < workingHours.close;
      start += 30
    ) {
      const end = start + selectedHairstyle.duration;

      // The hairstyle must finish before closing
      if (end > workingHours.close) {
        continue;
      }

      let isBooked = false;

      for (const appointment of existingAppointments) {
        if (!appointment.hairstyle) {
          continue;
        }

        const existingStart = timeToMinutes(
          appointment.time
        );

        const existingEnd =
          existingStart + appointment.hairstyle.duration;

        const overlap =
          start < existingEnd &&
          end > existingStart;

        if (overlap) {
          isBooked = true;
          break;
        }
      }

      const formattedTime = minutesToTime(start);

      if (isBooked) {
        bookedTimes.push(formattedTime);
      } else {
        availableTimes.push(formattedTime);
      }
    }

    res.json({
      closed: false,
      workingHours: {
        open: minutesToTime(workingHours.open),
        close: minutesToTime(workingHours.close),
      },
      duration: selectedHairstyle.duration,
      availableTimes,
      bookedTimes,
    });
  } catch (error) {
    console.error(
      "Get available times error:",
      error
    );

    res.status(500).json({
      message: "Server error while getting available times.",
    });
  }
};

// CREATE APPOINTMENT
exports.createAppointment = async (req, res) => {
  try {
    const { name, date, time, hairstyle } = req.body;

    if (!name || !date || !time || !hairstyle) {
      return res.status(400).json({
        message: "Name, date, time and hairstyle are required.",
      });
    }

    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const conflictCheck = await hasTimeConflict({
      date,
      time,
      hairstyleId: hairstyle,
    });

    if (conflictCheck.error) {
      return res.status(400).json({
        message: conflictCheck.error,
      });
    }

    const appointment = await Appointment.create({
      name: name.trim(),
      date,
      time,
      user: req.user.id,
      hairstyle,
    });

    const populatedAppointment = await Appointment.findById(
      appointment._id
    )
      .populate("hairstyle")
      .populate("user", "name email role");

    res.status(201).json({
      message: "Appointment created successfully.",
      appointment: populatedAppointment,
      duration: conflictCheck.duration,
      endTime: conflictCheck.endTime,
    });
  } catch (error) {
    console.error(
      "Create appointment error:",
      error
    );

    res.status(500).json({
      message: "Server error while creating appointment.",
    });
  }
};

// GET ALL APPOINTMENTS
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate("hairstyle")
      .populate("user", "name email role")
      .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (error) {
    console.error(
      "Get appointments error:",
      error
    );

    res.status(500).json({
      message: "Server error while getting appointments.",
    });
  }
};

// GET MY APPOINTMENTS
exports.getMyAppointments = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Authentication required.",
      });
    }

    const appointments = await Appointment.find({
      user: req.user.id,
    })
      .populate("hairstyle")
      .sort({ date: 1, time: 1 });

    res.json(appointments);
  } catch (error) {
    console.error(
      "Get my appointments error:",
      error
    );

    res.status(500).json({
      message: "Server error while getting your appointments.",
    });
  }
};

// GET ONE APPOINTMENT
exports.getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(
      req.params.id
    )
      .populate("hairstyle")
      .populate("user", "name email role");

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found.",
      });
    }

    // Normal user can see only own appointment
    if (
      req.user.role !== "admin" &&
      appointment.user &&
      appointment.user._id.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message:
          "You can access only your own appointment.",
      });
    }

    res.json(appointment);
  } catch (error) {
    console.error(
      "Get appointment error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while getting appointment.",
    });
  }
};

// UPDATE APPOINTMENT
exports.updateAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(
      req.params.id
    );

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found.",
      });
    }

    // Normal user can edit only own appointment
    if (
      req.user.role !== "admin" &&
      appointment.user.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message:
          "You can edit only your own appointment.",
      });
    }

    const name =
      req.body.name ?? appointment.name;

    const date =
      req.body.date ?? appointment.date;

    const time =
      req.body.time ?? appointment.time;

    const hairstyle =
      req.body.hairstyle ?? appointment.hairstyle;

    if (!name || !date || !time || !hairstyle) {
      return res.status(400).json({
        message:
          "Name, date, time and hairstyle are required.",
      });
    }

    const conflictCheck = await hasTimeConflict({
      date,
      time,
      hairstyleId: hairstyle,
      appointmentId: appointment._id,
    });

    if (conflictCheck.error) {
      return res.status(400).json({
        message: conflictCheck.error,
      });
    }

    appointment.name = name.trim();
    appointment.date = date;
    appointment.time = time;
    appointment.hairstyle = hairstyle;

    await appointment.save();

    const updatedAppointment =
      await Appointment.findById(
        appointment._id
      )
        .populate("hairstyle")
        .populate(
          "user",
          "name email role"
        );

    res.json({
      message:
        "Appointment updated successfully.",
      appointment: updatedAppointment,
      duration:
        conflictCheck.duration,
      endTime:
        conflictCheck.endTime,
    });
  } catch (error) {
    console.error(
      "Update appointment error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while updating appointment.",
    });
  }
};

// DELETE APPOINTMENT
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(
      req.params.id
    );

    if (!appointment) {
      return res.status(404).json({
        message: "Appointment not found.",
      });
    }

    // Normal user can delete only own appointment
    if (
      req.user.role !== "admin" &&
      appointment.user.toString() !== req.user.id
    ) {
      return res.status(403).json({
        message:
          "You can delete only your own appointment.",
      });
    }

    await Appointment.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message:
        "Appointment deleted successfully.",
    });
  } catch (error) {
    console.error(
      "Delete appointment error:",
      error
    );

    res.status(500).json({
      message:
        "Server error while deleting appointment.",
    });
  }
};