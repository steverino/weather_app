export async function searchLocations(city) {
  const url =
    "https://geocoding-api.open-meteo.com/v1/search" +
    `?name=${encodeURIComponent(city)}` +
    "&count=5&language=en&format=json";

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Geocoding API returned ${response.status}`);
  }

  const data = await response.json();

  return data.results || [];
}
