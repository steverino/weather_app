import express from "express";
import { searchLocations } from "../services/locationService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const city = String(req.query.city || "").trim();

  if (!city) {
    return res.status(400).json({
      error: "City is required",
    });
  }

  try {
    const locations = await searchLocations(city);

    res.json(locations);
  } catch (error) {
    console.error("Location search failed:", error);

    res.status(500).json({
      error: "Unable to retrieve locations",
    });
  }
});

export default router;
