import { useEffect, useRef, useState } from "react";
import { searchLocations, fetchWeather } from "./api/weatherApi";

export default function App() {
  const [city, setCity] = useState("");
  const [locations, setLocations] = useState([]);
  const [selected, setSelected] = useState(null);
  const [weather, setWeather] = useState(null);
  const [searching, setSearching] = useState(false);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const searchRef = useRef(null);
  const weatherRef = useRef(null);

  useEffect(() => () => {
    searchRef.current?.abort();
    weatherRef.current?.abort();
  }, []);

  function onCityChange(event) {
    searchRef.current?.abort();
    weatherRef.current?.abort();
    searchRef.current = null;
    weatherRef.current = null;
    setCity(event.target.value);
    setLocations([]);
    setSelected(null);
    setWeather(null);
    setSearching(false);
    setLoadingWeather(false);
    setSearched(false);
    setError("");
  }

  async function onSearch(event) {
    event.preventDefault();
    const name = city.trim();
    if (!name) return setError("Enter a city name.");
    searchRef.current?.abort();
    weatherRef.current?.abort();
    weatherRef.current = null;
    const controller = new AbortController();
    searchRef.current = controller;
    setSearching(true);
    setLoadingWeather(false);
    setSearched(true);
    setLocations([]);
    setSelected(null);
    setWeather(null);
    setError("");
    try {
      const result = await searchLocations(name, controller.signal);
      if (searchRef.current === controller) setLocations(result);
    } catch (err) {
      if (err.name !== "AbortError" && searchRef.current === controller) setError(err.message);
    } finally {
      if (searchRef.current === controller) {
        searchRef.current = null;
        setSearching(false);
      }
    }
  }

  async function onSelect(location) {
    weatherRef.current?.abort();
    const controller = new AbortController();
    weatherRef.current = controller;
    setSelected(location);
    setWeather(null);
    setError("");
    setLoadingWeather(true);
    try {
      const result = await fetchWeather(location.latitude, location.longitude, controller.signal);
      if (weatherRef.current === controller) setWeather(result);
    } catch (err) {
      if (err.name !== "AbortError" && weatherRef.current === controller) setError(err.message);
    } finally {
      if (weatherRef.current === controller) {
        weatherRef.current = null;
        setLoadingWeather(false);
      }
    }
  }

  return (
    <main className="container">
      <h1>Weather Explorer</h1>
      <p className="subtitle">Search for a city to view its current weather.</p>
      <form onSubmit={onSearch} className="search-form">
        <label htmlFor="city">City</label>
        <div className="search-row">
          <input id="city" value={city} onChange={onCityChange} placeholder="e.g. Pittsburgh" required />
          <button type="submit" disabled={searching}>{searching ? "Searching…" : "Search"}</button>
        </div>
      </form>
      {error && <p role="alert" className="error">{error}</p>}
      {searching && <p role="status">Searching locations…</p>}
      {!searching && searched && locations.length === 0 && !error && <p>No locations found.</p>}
      {locations.length > 0 && (
        <section aria-label="Locations">
          <h2>Choose a location</h2>
          <ul className="locations">
            {locations.map((location) => (
              <li key={location.id}>
                <span>{[location.name, location.admin1, location.country].filter(Boolean).join(", ")}</span>
                <button type="button" onClick={() => onSelect(location)} disabled={loadingWeather}>
                  {loadingWeather && selected?.id === location.id ? "Loading…" : "Get weather"}
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
      {loadingWeather && <p role="status">Loading weather…</p>}
      {weather && selected && (
        <section className="weather" aria-label="Current weather">
          <h2>{[selected.name, selected.admin1, selected.country].filter(Boolean).join(", ")}</h2>
          <p className="temperature">{(weather.current.temperature_2m * 9 / 5 + 32).toFixed(1)}°F</p>
          <p>Current temperature</p>
        </section>
      )}
    </main>
  );
}
