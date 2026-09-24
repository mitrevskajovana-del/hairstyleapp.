const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const connectDB = require("./config/db");

const app = express();

app.use(cors());
app.use(express.json());

app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ===============================
// Swagger JSON
// ===============================

const swaggerPath = path.join(__dirname, "config", "swagger.json");

let swaggerSpec;

try {
  swaggerSpec = JSON.parse(
    fs.readFileSync(swaggerPath, "utf8")
  );

  console.log("✅ Swagger JSON loaded");
} catch (error) {
  console.error("❌ Cannot load swagger.json");
  console.error(error.message);
  process.exit(1);
}

// Swagger JSON endpoint
app.get("/api/swagger.json", (req, res) => {
  res.json(swaggerSpec);
});
// Swagger UI
app.get("/api/docs", (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">

  <title>Hair Lux API Documentation</title>

  <link
    rel="stylesheet"
    href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css"
  >
</head>

<body>

  <div id="swagger-ui"></div>

  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>

  <script>
    window.onload = function () {

      const spec = ${JSON.stringify(swaggerSpec)};

      SwaggerUIBundle({
        spec: spec,
        dom_id: "#swagger-ui",
        deepLinking: true,
        displayRequestDuration: true,
        persistAuthorization: true,
        presets: [
          SwaggerUIBundle.presets.apis
        ],
        layout: "BaseLayout"
      });

    };
  </script>

</body>
</html>
  `);
});

// ===============================
// API Routes
// ===============================

app.use("/api/auth", require("./routes/authRoutes"));

app.use(
  "/api/hairstyles",
  require("./routes/hairstyleRoutes")
);
app.use(
  "/api/barbers",
  require("./routes/barberRoutes")
);
app.use(
  "/api/reviews",
  require("./routes/reviewRoutes")
);
app.use(
  "/api/uploads",
  require("./routes/uploadRoutes")
);

app.use(
  "/api/appointments",
  require("./routes/appointmentRoutes")
);

app.use(
  "/api/db",
  require("./routes/dbRoutes")
);

// ===============================
// Root
// ===============================

app.get("/", (req, res) => {
  res.json({
    message: "Hair Lux API is working!"
  });
});

// ===============================
// 404
// ===============================

app.use((req, res) => {
  res.status(404).json({
    message: "Route not found"
  });
});

// ===============================
// Error handler
// ===============================

app.use((err, req, res, next) => {
  console.error("❌ Server error:", err);

  res.status(500).json({
    message: "Internal server error"
  });
});

// ===============================
// Start server
// ===============================

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {

    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📖 Swagger JSON: http://localhost:${PORT}/api/swagger.json`);
      console.log(`📚 Swagger UI: http://localhost:${PORT}/api/docs`);
    });

  } catch (error) {

    console.error(
      "❌ Failed to start server:",
      error.message
    );

    process.exit(1);
  }
};

startServer();