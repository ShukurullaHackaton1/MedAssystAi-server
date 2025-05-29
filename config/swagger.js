import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "MedAssystAI API",
      version: "1.0.0",
      description: "AI-powered medical symptom analysis API",
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
        url: "http://localhost:5000",
        description: "Development server",
      },
      {
        url: "med-assyst-ai-server.vercel.app",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT Authorization header using the Bearer scheme",
        },
      },
      schemas: {
        User: {
          type: "object",
          required: ["name", "email", "password"],
          properties: {
            _id: {
              type: "string",
              description: "User ID",
            },
            name: {
              type: "string",
              description: "User full name",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
            },
            role: {
              type: "string",
              enum: ["user", "admin"],
              description: "User role",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Account creation date",
            },
          },
        },
        Chat: {
          type: "object",
          properties: {
            _id: {
              type: "string",
              description: "Chat ID",
            },
            user: {
              type: "string",
              description: "User ID who owns the chat",
            },
            title: {
              type: "string",
              description: "Chat title",
            },
            messages: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Message",
              },
            },
            diagnosis: {
              type: "string",
              description: "AI-generated diagnosis",
            },
            symptoms: {
              type: "array",
              items: {
                type: "string",
              },
              description: "List of symptoms mentioned",
            },
            isActive: {
              type: "boolean",
              description: "Whether the chat is active",
            },
            createdAt: {
              type: "string",
              format: "date-time",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
            },
          },
        },
        Message: {
          type: "object",
          properties: {
            sender: {
              type: "string",
              enum: ["user", "system"],
              description: "Message sender type",
            },
            content: {
              type: "string",
              description: "Message content",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "Message timestamp",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "Error message",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            _id: {
              type: "string",
            },
            name: {
              type: "string",
            },
            email: {
              type: "string",
            },
            role: {
              type: "string",
            },
            token: {
              type: "string",
              description: "JWT access token",
            },
          },
        },
        StatsResponse: {
          type: "object",
          properties: {
            totalChats: {
              type: "number",
            },
            todayChats: {
              type: "number",
            },
            activeUsers: {
              type: "number",
            },
            uniqueDiagnoses: {
              type: "number",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ["./routes/*.js", "./controllers/*.js"], // Swagger comment'lar joylashgan fayllar
};

const specs = swaggerJsdoc(options);

export { specs, swaggerUi };
