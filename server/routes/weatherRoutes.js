import express from "express";
import { getCurrentWeather } from "../services/weatherService.js";

const router = express.Router();

router.get("/", async (req, res) => {
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
    const weather = await getCurrentWeather(latitude, longitude);

    return res.status(200).json(weather);
  } catch (error) {
    if (error.providerStatus) {
      return res.status(502).json({
        error: "Weather provider returned an error",
        providerStatus: error.providerStatus,
      });
    }

    return res.status(502).json({
      error: error.message,
    });
  }
});

export default router;
