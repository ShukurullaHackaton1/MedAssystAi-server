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

// TO'LIQ SWAGGER DOCUMENTATION
const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "MedAssystAI API",
    version: "1.0.0",
    description:
      "AI-powered medical symptom analysis API - Meditsina simptomlarini tahlil qiluvchi AI asosidagi API",
    contact: {
      name: "MedAssystAI Support",
      email: "support@medassystai.com",
    },
    license: {
      name: "MIT",
      url: "https://opensource.org/licenses/MIT",
    },
  },
  servers: [
    {
      url: "https://med-assyst-ai-server.vercel.app",
      description: "Production Server",
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description:
          'JWT Authorization header using the Bearer scheme. Example: "Bearer {token}"',
      },
    },
    schemas: {
      // USER SCHEMAS
      User: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            description: "User unique identifier",
            example: "507f1f77bcf86cd799439011",
          },
          name: {
            type: "string",
            description: "User full name",
            example: "John Doe",
          },
          email: {
            type: "string",
            format: "email",
            description: "User email address",
            example: "john@example.com",
          },
          role: {
            type: "string",
            enum: ["user", "admin"],
            description: "User role in the system",
            example: "user",
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Account creation timestamp",
            example: "2024-01-15T10:30:00.000Z",
          },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            example: "507f1f77bcf86cd799439011",
          },
          name: {
            type: "string",
            example: "John Doe",
          },
          email: {
            type: "string",
            example: "john@example.com",
          },
          role: {
            type: "string",
            example: "user",
          },
          token: {
            type: "string",
            description: "JWT access token for authentication",
            example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
          },
        },
      },

      // CHAT SCHEMAS
      Message: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            example: "507f1f77bcf86cd799439012",
          },
          sender: {
            type: "string",
            enum: ["user", "system"],
            description: "Message sender type",
            example: "user",
          },
          content: {
            type: "string",
            description: "Message content",
            example: "У меня болит голова и тошнит",
          },
          timestamp: {
            type: "string",
            format: "date-time",
            description: "Message creation timestamp",
            example: "2024-01-15T10:35:00.000Z",
          },
        },
      },
      Chat: {
        type: "object",
        properties: {
          _id: {
            type: "string",
            description: "Chat unique identifier",
            example: "507f1f77bcf86cd799439013",
          },
          user: {
            type: "string",
            description: "ID of user who owns the chat",
            example: "507f1f77bcf86cd799439011",
          },
          title: {
            type: "string",
            description: "Chat title generated from first symptoms",
            example: "Головная боль и тошнота...",
          },
          messages: {
            type: "array",
            description: "Array of chat messages",
            items: {
              $ref: "#/components/schemas/Message",
            },
          },
          diagnosis: {
            type: "string",
            description: "AI-generated medical diagnosis",
            example:
              "На основе ваших симптомов возможна мигрень или головная боль напряжения...",
          },
          symptoms: {
            type: "array",
            description: "List of symptoms mentioned by user",
            items: {
              type: "string",
            },
            example: ["головная боль", "тошнота", "головокружение"],
          },
          isActive: {
            type: "boolean",
            description: "Whether the chat is still active",
            example: true,
          },
          createdAt: {
            type: "string",
            format: "date-time",
            description: "Chat creation timestamp",
            example: "2024-01-15T10:30:00.000Z",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            description: "Chat last update timestamp",
            example: "2024-01-15T10:35:00.000Z",
          },
        },
      },
      ChatSummary: {
        type: "object",
        description: "Chat summary for listing",
        properties: {
          _id: {
            type: "string",
            example: "507f1f77bcf86cd799439013",
          },
          title: {
            type: "string",
            example: "Головная боль и тошнота...",
          },
          updatedAt: {
            type: "string",
            format: "date-time",
            example: "2024-01-15T10:35:00.000Z",
          },
          diagnosis: {
            type: "string",
            example: "Возможная мигрень",
          },
        },
      },

      // STATISTICS SCHEMAS
      SymptomStat: {
        type: "object",
        properties: {
          symptom: {
            type: "string",
            description: "Symptom description",
            example: "головная боль",
          },
          count: {
            type: "number",
            description: "Number of times this symptom was mentioned",
            example: 25,
          },
        },
      },
      DailyStat: {
        type: "object",
        properties: {
          date: {
            type: "string",
            description: "Date in YYYY-MM-DD or YYYY-MM format",
            example: "2024-01-15",
          },
          count: {
            type: "number",
            description: "Number of chats/consultations on this date",
            example: 12,
          },
        },
      },
      DiagnosisStat: {
        type: "object",
        properties: {
          diagnosis: {
            type: "string",
            description: "Diagnosis description",
            example: "Головная боль напряжения",
          },
          count: {
            type: "number",
            description: "Number of times this diagnosis was given",
            example: 18,
          },
        },
      },
      OverallStats: {
        type: "object",
        properties: {
          totalChats: {
            type: "number",
            description: "Total number of chats in the system",
            example: 1250,
          },
          todayChats: {
            type: "number",
            description: "Number of chats created today",
            example: 15,
          },
          activeUsers: {
            type: "number",
            description:
              "Number of unique users who created chats in last 30 days",
            example: 320,
          },
          uniqueDiagnoses: {
            type: "number",
            description: "Number of unique diagnoses given",
            example: 87,
          },
        },
      },

      // ERROR SCHEMAS
      Error: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "Error message",
            example: "Пользователь не найден",
          },
        },
      },
      ValidationError: {
        type: "object",
        properties: {
          message: {
            type: "string",
            example: "Пожалуйста, заполните все поля",
          },
          field: {
            type: "string",
            example: "email",
          },
        },
      },
    },
  },

  // BARCHA API ENDPOINTS
  paths: {
    // =============== AUTHENTICATION ROUTES ===============
    "/api/auth/register": {
      post: {
        tags: ["👤 Authentication"],
        summary: "Register new user",
        description: "Create a new user account in the system",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password"],
                properties: {
                  name: {
                    type: "string",
                    minLength: 2,
                    maxLength: 50,
                    description: "User full name",
                    example: "John Doe",
                  },
                  email: {
                    type: "string",
                    format: "email",
                    description: "User email address",
                    example: "john@example.com",
                  },
                  password: {
                    type: "string",
                    minLength: 6,
                    description: "User password (minimum 6 characters)",
                    example: "password123",
                  },
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
                schema: {
                  $ref: "#/components/schemas/AuthResponse",
                },
              },
            },
          },
          400: {
            description:
              "Bad request - validation error or user already exists",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                examples: {
                  "validation-error": {
                    value: { message: "Пожалуйста, заполните все поля" },
                  },
                  "user-exists": {
                    value: {
                      message: "Пользователь с таким email уже существует",
                    },
                  },
                },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },

    "/api/auth/login": {
      post: {
        tags: ["👤 Authentication"],
        summary: "Login user",
        description: "Authenticate user and return JWT token",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: {
                    type: "string",
                    format: "email",
                    description: "User registered email",
                    example: "john@example.com",
                  },
                  password: {
                    type: "string",
                    description: "User password",
                    example: "password123",
                  },
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
                schema: {
                  $ref: "#/components/schemas/AuthResponse",
                },
              },
            },
          },
          400: {
            description: "Missing required fields",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          401: {
            description: "Invalid credentials",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  message: "Неверный email или пароль",
                },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },

    "/api/auth/profile": {
      get: {
        tags: ["👤 Authentication"],
        summary: "Get user profile",
        description: "Get current authenticated user profile information",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "User profile retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
          401: {
            description: "Unauthorized - invalid or missing token",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                examples: {
                  "no-token": {
                    value: { message: "Не авторизован" },
                  },
                  "invalid-token": {
                    value: { message: "Токен недействителен" },
                  },
                  "user-not-found": {
                    value: { message: "Пользователь не найден" },
                  },
                },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },

    "/api/auth/create-admin": {
      post: {
        tags: ["👤 Authentication"],
        summary: "Create admin user (Development only)",
        description:
          "Create an admin user account - requires secret key for security",
        security: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "email", "password", "secretKey"],
                properties: {
                  name: {
                    type: "string",
                    description: "Admin full name",
                    example: "Admin User",
                  },
                  email: {
                    type: "string",
                    format: "email",
                    description: "Admin email address",
                    example: "admin@medassystai.com",
                  },
                  password: {
                    type: "string",
                    minLength: 6,
                    description: "Admin password",
                    example: "adminpassword123",
                  },
                  secretKey: {
                    type: "string",
                    description: "Secret key for admin creation",
                    example: "your_admin_secret_key",
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Admin created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/AuthResponse",
                },
              },
            },
          },
          400: {
            description: "Bad request - user already exists",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          401: {
            description: "Invalid secret key",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  message: "Неверный секретный ключ",
                },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },

    // =============== CHAT ROUTES ===============
    "/api/chat": {
      post: {
        tags: ["💬 Chat"],
        summary: "Create new chat",
        description: "Create a new medical consultation chat session",
        security: [{ bearerAuth: [] }],
        responses: {
          201: {
            description: "Chat created successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Chat",
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          403: {
            description: "Forbidden - Admin access required",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },

    "/api/stats/overall": {
      get: {
        tags: ["📊 Statistics (Admin Only)"],
        summary: "Get overall system statistics",
        description:
          "Get overall system statistics including total chats, users, etc. (Admin access required)",
        security: [{ bearerAuth: [] }],
        responses: {
          200: {
            description: "Overall statistics retrieved successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/OverallStats",
                },
              },
            },
          },
          401: {
            description: "Unauthorized",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
          403: {
            description: "Forbidden - Admin access required",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
                example: {
                  message: "Доступ запрещен. Необходимы права администратора.",
                },
              },
            },
          },
          500: {
            description: "Internal server error",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/Error",
                },
              },
            },
          },
        },
      },
    },

    // =============== UTILITY ROUTES ===============
    "/health": {
      get: {
        tags: ["🔧 System"],
        summary: "Health check",
        description: "Check if the API server is running and healthy",
        security: [],
        responses: {
          200: {
            description: "Server is healthy",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      example: "OK",
                    },
                    timestamp: {
                      type: "string",
                      format: "date-time",
                      example: "2024-01-15T10:30:00.000Z",
                    },
                    swagger: {
                      type: "string",
                      example: "/api-docs",
                    },
                  },
                },
              },
            },
          },
        },
      },
    },

    "/api": {
      get: {
        tags: ["🔧 System"],
        summary: "API information",
        description: "Get basic API information and available endpoints",
        security: [],
        responses: {
          200: {
            description: "API information",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: {
                      type: "string",
                      example: "MedAssystAI API",
                    },
                    version: {
                      type: "string",
                      example: "1.0.0",
                    },
                    documentation: {
                      type: "string",
                      example: "/api-docs",
                    },
                    health: {
                      type: "string",
                      example: "/health",
                    },
                  },
                },
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
            font-size: 36px;
        }
        .swagger-ui .info .description {
            font-size: 16px;
            color: #3b4151;
        }
        .swagger-ui .scheme-container {
            background: #fff;
            box-shadow: 0 1px 2px 0 rgba(0,0,0,.15);
        }
        .swagger-ui .opblock.opblock-post {
            border-color: #49cc90;
            background: rgba(73,204,144,.1);
        }
        .swagger-ui .opblock.opblock-get {
            border-color: #61affe;
            background: rgba(97,175,254,.1);
        }
        .swagger-ui .opblock.opblock-put {
            border-color: #fca130;
            background: rgba(252,161,48,.1);
        }
        .swagger-ui .btn.authorize {
            background-color: #49cc90;
            border-color: #49cc90;
        }
        .swagger-ui .btn.authorize:hover {
            background-color: #3eb882;
            border-color: #3eb882;
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
                tryItOutEnabled: true,
                filter: true,
                supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
                onComplete: function() {
                    console.log('MedAssystAI API Documentation loaded successfully!');
                },
                requestInterceptor: function(req) {
                    // Add custom headers if needed
                    req.headers['Content-Type'] = 'application/json';
                    return req;
                },
                responseInterceptor: function(res) {
                    // Log responses for debugging
                    console.log('API Response:', res.status, res.url);
                    return res;
                }
            });

            // Custom authorization setup
            ui.preauthorizeApiKey('bearerAuth', 'Bearer your_jwt_token_here');
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
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

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
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
  });
});

// Root endpoint
app.get("/api", (req, res) => {
  res.json({
    message: "MedAssystAI API",
    version: "1.0.0",
    description: "AI-powered medical symptom analysis API",
    documentation: "/api-docs",
    health: "/health",
    endpoints: {
      authentication: "/api/auth/*",
      chat: "/api/chat/*",
      statistics: "/api/stats/*",
    },
  });
});

// 404 handler for API routes
app.use("/api/*", (req, res) => {
  res.status(404).json({
    message: "API endpoint not found",
    availableEndpoints: "/api-docs",
  });
});

// Serve static assets in production
if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "client/dist")));

  app.get("*", (req, res) => {
    if (req.path.startsWith("/api/") || req.path.startsWith("/api-docs")) {
      return res.status(404).json({ message: "Endpoint not found" });
    }
    res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
  });
}

// Global error handling middleware
app.use((error, req, res, next) => {
  console.error("🔥 Global Error:", error);

  // MongoDB connection errors
  if (error.name === "MongoNetworkError") {
    return res.status(503).json({
      message: "Database temporarily unavailable",
    });
  }

  // JWT errors
  if (error.name === "JsonWebTokenError") {
    return res.status(401).json({
      message: "Invalid authentication token",
    });
  }

  // Validation errors
  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: "Validation error",
      details: error.message,
    });
  }

  // Default error
  res.status(500).json({
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? error.message : undefined,
  });
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("🛑 SIGTERM received, shutting down gracefully");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 SIGINT received, shutting down gracefully");
  process.exit(0);
});

// Start server
app.listen(PORT, () => {
  console.log("🚀 ===============================================");
  console.log(`🚀 MedAssystAI Server running on port ${PORT}`);
  console.log("🚀 ===============================================");
  console.log(
    `📚 API Documentation: https://med-assyst-ai-server.vercel.app/api-docs`
  );
  console.log(
    `❤️  Health Check: https://med-assyst-ai-server.vercel.app/health`
  );
  console.log(`🔗 API Info: https://med-assyst-ai-server.vercel.app/api`);
  console.log("🚀 ===============================================");
});
