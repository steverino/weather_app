import express from "express";
import cors from "cors";
import db from "./db.js";

const app = express();

const PORT = process.env.PORT || 3000;

// Your actual Render frontend and local development addresses.
const allowedOrigins = [
  "https://weather-app-frontend-g863.onrender.com",
  "http://localhost:5173",
  "http://localhost:4173",
  "http://192.168.1.159",
];

// IMPORTANT: CORS must be configured before the API routes.
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

app.use(express.json());

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "weather-api",
  });
});

// Search for locations by city name
app.get("/api/locations", async (req, res) => {
  const city = String(req.query.city || "").trim();

  if (!city) {
    return res.status(400).json({
      error: "City is required",
    });
  }

  try {
    const url =
      "https://geocoding-api.open-meteo.com/v1/search" +
      `?name=${encodeURIComponent(city)}` +
      "&count=5&language=en&format=json";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Geocoding API returned ${response.status}`);
    }

    const data = await response.json();

    res.json(data.results || []);
  } catch (error) {
    console.error("Location search failed:", error);

    res.status(500).json({
      error: "Unable to retrieve locations",
    });
  }
});

// Get current weather using latitude and longitude
app.get("/api/weather", async (req, res) => {
  const latitude = Number(req.query.latitude);
  const longitude = Number(req.query.longitude);

  if (
    req.query.latitude == null ||
    req.query.longitude == null ||
    req.query.latitude === "" ||
    req.query.longitude === "" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return res.status(400).json({
      error: "Valid latitude and longitude are required",
    });
  }

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");

    url.searchParams.set("latitude", String(latitude));
    url.searchParams.set("longitude", String(longitude));
    url.searchParams.set("current", "temperature_2m");

    console.log("Requesting weather:", url.toString());

    const response = await fetch(url);

    if (!response.ok) {
      const body = await response.text();

      console.error("Open-Meteo error:", {
        status: response.status,
        body,
      });

      return res.status(502).json({
        error: "Weather provider returned an error",
        providerStatus: response.status,
      });
    }

    const data = await response.json();

    if (typeof data?.current?.temperature_2m !== "number") {
      console.error("Unexpected weather response:", data);

      return res.status(502).json({
        error: "Weather provider returned invalid data",
      });
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error("Weather request failed:", error);

    return res.status(502).json({
      error: "Unable to contact weather provider",
    });
  }
});

app.get("/api/favorites", (req, res) => {
  try {
    const favorites = db
      .prepare("SELECT * FROM favorites ORDER BY created_at DESC, id DESC")
      .all();

    res.json(favorites);
  } catch (error) {
    console.error("Error retrieving favorites:", error);
    res.status(500).json({
      error: "Unable to retrieve favorites",
    });
  }
});

app.post("/api/favorites", (req, res) => {
  const { city, latitude, longitude } = req.body;

  if (
    typeof city !== "string" ||
    !city.trim() ||
    typeof latitude !== "number" ||
    typeof longitude !== "number" ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return res.status(400).json({
      error: "Valid city, latitude and longitude are required",
    });
  }

  try {
    const result = db
      .prepare(
        `
      INSERT INTO favorites (city, latitude, longitude)
      VALUES (?, ?, ?)
    `,
      )
      .run(city.trim(), latitude, longitude);

    const favorite = db
      .prepare("SELECT * FROM favorites WHERE id = ?")
      .get(result.lastInsertRowid);

    res.status(201).json(favorite);
  } catch (error) {
    if (error.code?.startsWith("SQLITE_CONSTRAINT")) {
      return res.status(409).json({
        error: "This city is already in your favorites",
      });
    }

    console.error("Error saving favorite:", error);
    res.status(500).json({
      error: "Unable to save favorite",
    });
  }
});

app.delete("/api/favorites/:id", (req, res) => {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({
      error: "Invalid favorite ID",
    });
  }

  try {
    const result = db.prepare("DELETE FROM favorites WHERE id = ?").run(id);

    if (result.changes === 0) {
      return res.status(404).json({
        error: "Favorite not found",
      });
    }

    res.status(204).send();
  } catch (error) {
    console.error("Error deleting favorite:", error);
    res.status(500).json({
      error: "Unable to delete favorite",
    });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`Weather API listening on ${HOST}:${PORT}`);
  console.log("Allowed CORS origins:", allowedOrigins);
});
