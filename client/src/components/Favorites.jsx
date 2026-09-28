import { useEffect, useState } from "react";
import {
  getFavorites,
  addFavorite,
  deleteFavorite,
} from "../api/weatherApi.js";

export default function Favorites({ selectedLocation, onSelectCity }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadFavorites() {
      try {
        setFavorites(await getFavorites());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadFavorites();
  }, []);

  async function handleSave() {
    if (!selectedLocation) return;

    setSaving(true);
    setError("");

    try {
      const favorite = await addFavorite({
        city: selectedLocation.name,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      });

      setFavorites((previous) => [favorite, ...previous]);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    setError("");

    try {
      await deleteFavorite(id);
      setFavorites((previous) =>
        previous.filter((favorite) => favorite.id !== id),
      );
    } catch (err) {
      setError(err.message);
    }
  }

  const alreadySaved = favorites.some(
    (favorite) =>
      selectedLocation &&
      favorite.city === selectedLocation.name &&
      favorite.latitude === selectedLocation.latitude &&
      favorite.longitude === selectedLocation.longitude,
  );

  return (
    <section>
      <h2>Favorite Cities</h2>

      {selectedLocation && (
        <button onClick={handleSave} disabled={saving || alreadySaved}>
          {saving
            ? "Saving..."
            : alreadySaved
              ? "Already saved"
              : `Save ${selectedLocation.name}`}
        </button>
      )}

      {loading && <p>Loading favorites...</p>}
      {error && <p role="alert">{error}</p>}

      {!loading && favorites.length === 0 && <p>No favorite cities yet.</p>}

      <ul>
        {favorites.map((favorite) => (
          <li key={favorite.id}>
            <button onClick={() => onSelectCity(favorite)}>
              {favorite.city}
            </button>

            <button
              onClick={() => handleDelete(favorite.id)}
              aria-label={`Remove ${favorite.city}`}
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
