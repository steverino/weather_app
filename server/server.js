const express = require("express");
const cors = require("cors");

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
  }),
);
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});

app.get("/api/locations", async (req, res) => {
  const city = req.query.city;

  if (!city || city.trim() === "") {
    return res.status(400).json({
      error: "City is required",
    });
  }

  try {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=5&language=en&format=json`;

    const geoResponse = await fetch(geoUrl);

    if (!geoResponse.ok) {
      throw new Error("Location request failed");
    }

    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      return res.json([]);
    }

    res.json(geoData.results);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to retrieve locations",
    });
  }
});

app.get("/api/weather", async (req, res) => {
  const latitude = req.query.latitude;
  const longitude = req.query.longitude;

  if (!latitude || !longitude) {
    return res.status(400).json({
      error: "Latitude and longitude are required",
    });
  }

  const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m`;

  try {
    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error("Weather API request failed");
    }

    const data = await response.json();

    res.json(data);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to retrieve weather data",
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
