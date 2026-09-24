const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

if (!API_URL) {
  console.error("Missing VITE_API_URL. Set it in frontend/.env or your hosting environment.");
}

async function request(path, signal) {
  if (!API_URL) throw new Error("Missing VITE_API_URL configuration");
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, { signal });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new Error(`Cannot reach the weather API at ${API_URL}. Check its URL and CORS settings.`);
  }

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`API returned an invalid response (HTTP ${response.status})`);
  }
  if (!response.ok) throw new Error(data.error || `API request failed (HTTP ${response.status})`);
  return data;
}

export async function searchLocations(city, signal) {
  const data = await request(`/api/locations?city=${encodeURIComponent(city)}`, signal);
  if (!Array.isArray(data)) throw new Error("API returned invalid location data");
  return data;
}

export async function fetchWeather(latitude, longitude, signal) {
  const data = await request(`/api/weather?latitude=${encodeURIComponent(latitude)}&longitude=${encodeURIComponent(longitude)}`, signal);
  if (typeof data?.current?.temperature_2m !== "number") {
    throw new Error("API returned invalid weather data");
  }
  return data;
}
