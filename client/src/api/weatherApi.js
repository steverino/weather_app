const API_URL = import.meta.env.VITE_API_URL;

function validateWeather(data) {
  if (
    !data ||
    !data.current ||
    typeof data.current.temperature_2m !== "number"
  ) {
    throw new Error("Invalid weather data received");
  }

  return data;
}

async function handleResponse(response, fallbackMessage) {
  if (!response.ok) {
    let message = fallbackMessage;

    try {
      const data = await response.json();
      message = data.error || fallbackMessage;
    } catch {
      // Preserve the fallback message.
    }

    throw new Error(message);
  }

  try {
    return await response.json();
  } catch {
    throw new Error("Invalid response from server");
  }
}

export async function searchLocations(city, signal) {
  const response = await fetch(
    `${API_URL}/api/locations?city=${encodeURIComponent(city)}`,
    { signal },
  );

  return handleResponse(response, "Unable to find locations");
}

export async function fetchWeather(latitude, longitude, signal) {
  const response = await fetch(
    `${API_URL}/api/weather?latitude=${latitude}&longitude=${longitude}`,
    { signal },
  );

  const data = await handleResponse(response, "Unable to retrieve weather");

  return validateWeather(data);
}
