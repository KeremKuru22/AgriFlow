const express = require("express");
const cors = require("cors");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

const initDb = require("./database/initDb");
const swaggerSpec = require("./config/swagger");

const authRoutes = require("./routes/authRoutes");
const fieldRoutes = require("./routes/fieldRoutes");
const activityRoutes = require("./routes/activityRoutes");
const harvestRoutes = require("./routes/harvestRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Frontend static files
app.use(express.static(path.join(__dirname, "../../frontend")));

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/fields", fieldRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/harvests", harvestRoutes);
app.use("/api/dashboard", dashboardRoutes);

// API health check
app.get("/api/status", (req, res) => {
  res.json({
    message: "AgriFlow API is running",
  });
});

const PORT = process.env.PORT || 3000;

initDb();

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});