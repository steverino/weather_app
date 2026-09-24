import express from "express";
import cors from "cors";

const app = express();

const PORT = process.env.PORT || 3000;

// Your actual Render frontend and local development addresses.
const allowedOrigins = [
  "https://weather-app-frontend-g863.onrender.com",
  "http://localhost:5173",
  "http://localhost:4173",
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
  const { latitude, longitude } = req.query;

  if (
    latitude === undefined ||
    longitude === undefined ||
    latitude === "" ||
    longitude === ""
  ) {
    return res.status(400).json({
      error: "Latitude and longitude are required",
    });
  }

  const lat = Number(latitude);
  const lon = Number(longitude);

  if (
    !Number.isFinite(lat) ||
    !Number.isFinite(lon) ||
    lat < -90 ||
    lat > 90 ||
    lon < -180 ||
    lon > 180
  ) {
    return res.status(400).json({
      error: "Invalid latitude or longitude",
    });
  }

  try {
    const url =
      "https://api.open-meteo.com/v1/forecast" +
      `?latitude=${lat}` +
      `&longitude=${lon}` +
      "&current=temperature_2m";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API returned ${response.status}`);
    }

    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error("Weather request failed:", error);

    res.status(500).json({
      error: "Unable to retrieve weather data",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Weather API running on port ${PORT}`);
  console.log("Allowed CORS origins:", allowedOrigins);
});
