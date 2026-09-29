import express from "express";
import cors from "cors";
import defaultDb from "./db.js";

import { requestLogger } from "./middleware/requestLogger.js";
import { requestId } from "./middleware/requestId.js";
import { errorHandler } from "./middleware/errorHandler.js";

import healthRoutes from "./routes/healthRoutes.js";
import { createFavoriteRoutes } from "./routes/favoriteRoutes.js";

import locationRoutes from "./routes/locationRoutes.js";
import weatherRoutes from "./routes/weatherRoutes.js";

export const allowedOrigins = [
  "https://weather-app-frontend-g863.onrender.com",
  "http://localhost:5173",
  "http://localhost:4173",
  "http://192.168.1.159",
];

export function createApp(db = defaultDb) {
  const app = express();

  // CORS
  app.use(
    cors({
      origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        console.error("CORS blocked:", origin);

        return callback(new Error("Not allowed by CORS"));
      },
    }),
  );

  // General middleware
  app.use(express.json());
  app.use(requestId);
  app.use(requestLogger);

  // Health check
  app.use("/api/health", healthRoutes);

  app.use("/api/locations", locationRoutes);

  // Get current weather using latitude and longitude
  app.use("/api/weather", weatherRoutes);
  // Favorites
  app.use("/api/favorites", createFavoriteRoutes(db));

  // Error-handling middleware must be last
  app.use(errorHandler);

  return app;
}

export default createApp;
