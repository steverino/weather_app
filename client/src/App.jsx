import { useEffect, useRef, useState } from "react";
import { searchLocations, fetchWeather } from "./api/weatherApi";

function App() {
  const [searchLoading, setSearchLoading] = useState(false);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const hasWeather = weather !== null;
  const showEmptyState =
    hasSearched && !searchLoading && !error && locations.length === 0;
  const searchControllerRef = useRef(null);
  const weatherControllerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (searchControllerRef.current) {
        searchControllerRef.current.abort();
      }

      if (weatherControllerRef.current) {
        weatherControllerRef.current.abort();
      }
    };
  }, []);

  async function handleSearch(event) {
    event.preventDefault();

    const trimmedCity = city.trim();

    if (trimmedCity === "") {
      setError("City is required");
      return;
    }

    setSearchLoading(true);
    setHasSearched(true);
    setError("");
    setLocations([]);
    setWeather(null);
    setSelectedLocation(null);

    if (searchControllerRef.current) {
      searchControllerRef.current.abort();
    }

    const controller = new AbortController();

    searchControllerRef.current = controller;

    try {
      const data = await searchLocations(trimmedCity, controller.signal);

      setLocations(data);
    } catch (error) {
      if (
        error.name !== "AbortError" &&
        searchControllerRef.current === controller
      ) {
        setError(error.message);
      }
    } finally {
      if (searchControllerRef.current === controller) {
        searchControllerRef.current = null;
        setSearchLoading(false);
      }
    }
  }

  async function handleGetWeather(location) {
    setWeatherLoading(true);
    setError("");
    setWeather(null);
    setSelectedLocation(location);

    if (weatherControllerRef.current) {
      weatherControllerRef.current.abort();
    }

    const controller = new AbortController();

    weatherControllerRef.current = controller;

    try {
      const data = await fetchWeather(
        location.latitude,
        location.longitude,
        controller.signal,
      );

      setWeather(data);
    } catch (error) {
      if (
        error.name !== "AbortError" &&
        weatherControllerRef.current === controller
      ) {
        setError(error.message);
      }
    } finally {
      if (weatherControllerRef.current === controller) {
        weatherControllerRef.current = null;
        setWeatherLoading(false);
      }
    }
  }

  function handleCityChange(event) {
    if (searchControllerRef.current) {
      searchControllerRef.current.abort();
      searchControllerRef.current = null;
    }

    if (weatherControllerRef.current) {
      weatherControllerRef.current.abort();
      weatherControllerRef.current = null;
    }

    setWeatherLoading(false);
    setSearchLoading(false);
    setCity(event.target.value);
    setLocations([]);
    setWeather(null);
    setSelectedLocation(null);
    setError("");
    setHasSearched(false);
  }

  return (
    <>
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
      {weatherLoading && <p>Loading weather...</p>}
      {locations.map((location) => (
        <div key={location.id}>
          <p>
            {location.name}, {location.admin1}, {location.country}
          </p>

          <button
            onClick={() => handleGetWeather(location)}
            disabled={weatherLoading}
          >
            {weatherLoading && selectedLocation?.id === location.id
              ? "Getting Weather..."
              : "Get Weather"}
          </button>
        </div>
      ))}

      {error && <p>{error}</p>}

      {hasWeather && selectedLocation && (
        <div>
          <h3>
            {selectedLocation.name}, {selectedLocation.admin1}
          </h3>

          <p>{selectedLocation.country}</p>

          <p>
            Temperature:{" "}
            {(weather.current.temperature_2m * 1.8 + 32).toFixed(1)}°F
          </p>
        </div>
      )}
      {showEmptyState && <p>No locations found.</p>}
    </>
  );
}

export default App;
