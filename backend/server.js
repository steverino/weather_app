import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = (process.env.ALLOWED_ORIGINS || "http://localhost:5173,http://localhost:4173")
  .split(",")
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", service: "weather-api" });
});

app.get("/api/locations", async (req, res) => {
  const city = String(req.query.city || "").trim();
  if (!city) return res.status(400).json({ error: "City is required" });
  if (city.length > 100) return res.status(400).json({ error: "City is too long" });

  try {
    const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
    url.search = new URLSearchParams({ name: city, count: "5", language: "en", format: "json" });
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`Geocoding service returned ${response.status}`);
    const data = await response.json();
    res.json(Array.isArray(data.results) ? data.results : []);
  } catch (error) {
    console.error("Location lookup failed:", error);
    res.status(502).json({ error: "Location service is temporarily unavailable" });
  }
});

app.get("/api/weather", async (req, res) => {
  const { latitude, longitude } = req.query;
  if (latitude === undefined || longitude === undefined || latitude === "" || longitude === "") {
    return res.status(400).json({ error: "Latitude and longitude are required" });
  }
  const lat = Number(latitude);
  const lon = Number(longitude);
  if (!Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return res.status(400).json({ error: "Invalid latitude or longitude" });
  }

  try {
    const url = new URL("https://api.open-meteo.com/v1/forecast");
    url.search = new URLSearchParams({ latitude: String(lat), longitude: String(lon), current: "temperature_2m" });
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!response.ok) throw new Error(`Weather service returned ${response.status}`);
    const data = await response.json();
    if (typeof data?.current?.temperature_2m !== "number") {
      throw new Error("Weather service returned invalid data");
    }
    res.json(data);
  } catch (error) {
    console.error("Weather lookup failed:", error);
    res.status(502).json({ error: "Weather service is temporarily unavailable" });
  }
});

app.use((req, res) => res.status(404).json({ error: "API route not found" }));
app.listen(PORT, "0.0.0.0", () => console.log(`Weather API listening on port ${PORT}`));
