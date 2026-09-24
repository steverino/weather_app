import { useEffect, useRef, useState } from "react";
import { searchLocations, fetchWeather } from "./api/weatherApi";

function App() {
  const [city, setCity] = useState("");
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [weather, setWeather] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const searchControllerRef = useRef(null);
  const weatherControllerRef = useRef(null);

  useEffect(() => {
    return () => {
      searchControllerRef.current?.abort();
      weatherControllerRef.current?.abort();
    };
  }, []);

  function handleCityChange(event) {
    searchControllerRef.current?.abort();
    weatherControllerRef.current?.abort();

    searchControllerRef.current = null;
    weatherControllerRef.current = null;

    setCity(event.target.value);
    setLocations([]);
    setSelectedLocation(null);
    setWeather(null);
    setError("");
    setHasSearched(false);
    setSearchLoading(false);
    setWeatherLoading(false);
  }

  async function handleSearch(event) {
    event.preventDefault();

    const trimmedCity = city.trim();

    if (!trimmedCity) {
      setError("City is required");
      return;
    }

    searchControllerRef.current?.abort();
    weatherControllerRef.current?.abort();

    const controller = new AbortController();
    searchControllerRef.current = controller;
    weatherControllerRef.current = null;

    setSearchLoading(true);
    setWeatherLoading(false);
    setHasSearched(true);
    setError("");
    setLocations([]);
    setWeather(null);
    setSelectedLocation(null);

    try {
      const data = await searchLocations(trimmedCity, controller.signal);

      if (searchControllerRef.current === controller) {
        setLocations(data);
      }
    } catch (err) {
      if (
        err.name !== "AbortError" &&
        searchControllerRef.current === controller
      ) {
        setError(err.message);
      }
    } finally {
      if (searchControllerRef.current === controller) {
        searchControllerRef.current = null;
        setSearchLoading(false);
      }
    }
  }

  async function handleGetWeather(location) {
    weatherControllerRef.current?.abort();

    const controller = new AbortController();
    weatherControllerRef.current = controller;

    setWeatherLoading(true);
    setError("");
    setWeather(null);
    setSelectedLocation(location);

    try {
      const data = await fetchWeather(
        location.latitude,
        location.longitude,
        controller.signal,
      );

      if (weatherControllerRef.current === controller) {
        setWeather(data);
      }
    } catch (err) {
      if (
        err.name !== "AbortError" &&
        weatherControllerRef.current === controller
      ) {
        setError(err.message);
      }
    } finally {
      if (weatherControllerRef.current === controller) {
        weatherControllerRef.current = null;
        setWeatherLoading(false);
      }
    }
  }

  const showEmptyState =
    hasSearched && !searchLoading && !error && locations.length === 0;

  return (
    <main>
      <h1>Weather Explorer</h1>
      <p>Search for a city to view its current weather.</p>

      <form onSubmit={handleSearch}>
        <label htmlFor="city">City</label>

        <input
          id="city"
          type="text"
          value={city}
          onChange={handleCityChange}
          placeholder="Enter city"
          required
        />

        <button type="submit" disabled={searchLoading}>
          {searchLoading ? "Searching..." : "Search"}
        </button>
      </form>

      {searchLoading && <p>Searching locations...</p>}

      {locations.map((location) => (
        <div key={location.id}>
          <p>
            {location.name}
            {location.admin1 ? `, ${location.admin1}` : ""}
            {`, ${location.country}`}
          </p>

          <button
            type="button"
            onClick={() => handleGetWeather(location)}
            disabled={weatherLoading}
          >
            {weatherLoading && selectedLocation?.id === location.id
              ? "Getting Weather..."
              : "Get Weather"}
          </button>
        </div>
      ))}

      {weatherLoading && <p>Loading weather...</p>}

      {error && <p role="alert">{error}</p>}

      {weather && selectedLocation && (
        <section>
          <h2>
            {selectedLocation.name}
            {selectedLocation.admin1 ? `, ${selectedLocation.admin1}` : ""}
          </h2>

          <p>{selectedLocation.country}</p>

          <p>
            Temperature:{" "}
            {(weather.current.temperature_2m * 1.8 + 32).toFixed(1)}
            °F
          </p>
        </section>
      )}

      {showEmptyState && <p>No locations found.</p>}
    </main>
  );
}

export default App;
