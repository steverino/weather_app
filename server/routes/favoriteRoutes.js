import express from "express";

export function createFavoriteRoutes(db) {
  const router = express.Router();

  // Get all favorites
  router.get("/", (req, res) => {
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

  // Save a favorite
  router.post("/", (req, res) => {
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

  // Delete a favorite
  router.delete("/:id", (req, res) => {
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

  return router;
}
