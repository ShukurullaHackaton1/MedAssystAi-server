import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

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

// Swagger JSON ma'lumotlar
const swaggerDocument = {
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
          ? "https://med-assyst-ai-server.vercel.app"
          : "http://localhost:5000",
      description: "API Server",
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
    schemas: {
      User: {
        type: "object",
        properties: {
          _id: { type: "string" },
          name: { type: "string" },
          email: { type: "string" },
          role: { type: "string", enum: ["user", "admin"] },
        },
      },
      Chat: {
        type: "object",
        properties: {
          _id: { type: "string" },
          title: { type: "string" },
          messages: {
            type: "array",
            items: { $ref: "#/components/schemas/Message" },
          },
          diagnosis: { type: "string" },
          symptoms: {
            type: "array",
            items: { type: "string" },
          },
        },
      },
      Message: {
        type: "object",
        properties: {
          sender: { type: "string", enum: ["user", "system"] },
          content: { type: "string" },
          timestamp: { type: "string", format: "date-time" },
        },
      },
      Error: {
        type: "object",
        properties: {
          message: { type: "string" },
        },
      },
    },
  },
  paths: {
    "/api/auth/register": {
      post: {
        tags: ["Authentication"],
        summary: "Register new user",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: { type: "string", example: "John Doe" },
                  email: { type: "string", example: "john@example.com" },
                  password: { type: "string", example: "password123" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "User registered successfully",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
          400: {
            description: "Bad request",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Error" },
              },
            },
          },
        },
      },
    },
    "/api/auth/login": {
      post: {
        tags: ["Authentication"],
        summary: "Login user",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "john@example.com" },
                  password: { type: "string", example: "password123" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Login successful",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/User" },
              },
            },
          },
        },
      },
    },
    "/api/chat": {
      post: {
        tags: ["Chat"],
        summary: "Create new chat",
        security: [{ bearerAuth: [] }],
        responses: {
          201: {
            description: "Chat created",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Chat" },
              },
            },
          },
        },
      },
      get: {
        tags: ["Chat"],
        summary: "Get user chats",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "List of chats",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Chat" },
                },
              },
            },
          },
        },
      },
    },
    "/api/chat/{id}/messages": {
      post: {
        tags: ["Chat"],
        summary: "Send message",
        security: [{ bearerAuth: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  content: {
                    type: "string",
                    example: "У меня болит голова и тошнит",
                  },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Message sent and analyzed",
            content: {
              "application/json": {
                schema: { $ref: "#/components/schemas/Chat" },
              },
            },
          },
        },
      },
    },
  },
};

// Custom Swagger HTML page (CDN orqali)
const swaggerHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MedAssystAI API Documentation</title>
    <link rel="stylesheet" type="text/css" href="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css" />
    <style>
        html {
            box-sizing: border-box;
            overflow: -moz-scrollbars-vertical;
            overflow-y: scroll;
        }
        *, *:before, *:after {
            box-sizing: inherit;
        }
        body {
            margin: 0;
            background: #fafafa;
        }
        .swagger-ui .topbar {
            display: none;
        }
        .swagger-ui .info {
            margin: 50px 0;
        }
        .swagger-ui .info .title {
            color: #2d5aa0;
        }
    </style>
</head>
<body>
    <div id="swagger-ui"></div>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js"></script>
    <script src="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-standalone-preset.js"></script>
    <script>
        window.onload = function() {
            const ui = SwaggerUIBundle({
                spec: ${JSON.stringify(swaggerDocument)},
                dom_id: '#swagger-ui',
                deepLinking: true,
                presets: [
                    SwaggerUIBundle.presets.apis,
                    SwaggerUIStandalonePreset
                ],
                plugins: [
                    SwaggerUIBundle.plugins.DownloadUrl
                ],
                layout: "StandaloneLayout",
                persistAuthorization: true,
                displayRequestDuration: true,
                tryItOutEnabled: true
            });
        };
    </script>
</body>
</html>
`;

// Swagger routes
app.get("/api-docs", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  res.send(swaggerHtml);
});

app.get("/api-docs.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.json(swaggerDocument);
});

// Database connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/stats", statsRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    swagger: "/api-docs",
  });
});

// Root endpoint
app.get("/api", (req, res) => {
  res.json({
    message: "MedAssystAI API",
    version: "1.0.0",
    documentation: "/api-docs",
    health: "/health",
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/dist")));

  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/") || req.path.startsWith("/api-docs")) {
      return res.status(404).json({ message: "API endpoint not found" });
    }
    res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
  });
}

// Error handling
app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(500).json({
    message: "Internal server error",
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api-docs`);
  console.log(`❤️  Health check: http://localhost:${PORT}/health`);
});
