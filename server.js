import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import swaggerUi from "swagger-ui-express";
import swaggerJsdoc from "swagger-jsdoc";

// Routes
import authRoutes from "./routes/auth.js";
import chatRoutes from "./routes/chat.js";
import statsRoutes from "./routes/stats.js";

// Config
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);
app.use(express.json());

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MedAssystAI API",
      version: "1.0.0",
      description: "AI-powered medical symptom analysis API",
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? "https://your-vercel-app.vercel.app"
            : "http://localhost:5000",
        description:
          process.env.NODE_ENV === "production" ? "Production" : "Development",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.js"],
};

const specs = swaggerJsdoc(swaggerOptions);

// Swagger UI middleware with CDN assets
const swaggerUiOptions = {
  explorer: true,
  customCss: ".swagger-ui .topbar { display: none }",
  customSiteTitle: "MedAssystAI API",
  swaggerOptions: {
    persistAuthorization: true,
  },
};

// Serve swagger-ui assets from CDN in production
if (process.env.NODE_ENV === "production") {
  app.get("/api-docs/swagger-ui-bundle.js", (req, res) => {
    res.redirect(
      "https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"
    );
  });

  app.get("/api-docs/swagger-ui-standalone-preset.js", (req, res) => {
    res.redirect(
      "https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"
    );
  });

  app.get("/api-docs/swagger-ui.css", (req, res) => {
    res.redirect("https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css");
  });
}

// Swagger UI
app.use("/api-docs", swaggerUi.serve);
app.get("/api-docs", swaggerUi.setup(specs, swaggerUiOptions));

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/stats", statsRoutes);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API info endpoint
app.get("/api", (req, res) => {
  res.json({
    message: "MedAssystAI API",
    version: "1.0.0",
    documentation: "/api-docs",
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/dist")));

  app.get("*", (req, res) => {
    // API routes uchun 404 qaytarish
    if (req.path.startsWith("/api/")) {
      return res.status(404).json({ message: "API endpoint not found" });
    }

    // Boshqa barcha route'lar uchun React app'ni serve qilish
    res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`API Documentation: http://localhost:${PORT}/api-docs`);
});
