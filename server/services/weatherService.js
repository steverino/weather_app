export async function getCurrentWeather(latitude, longitude) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");

  url.searchParams.set("latitude", String(latitude));

  url.searchParams.set("longitude", String(longitude));

  url.searchParams.set("current", "temperature_2m");

  console.log("Requesting weather:", url.toString());

  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.text();

    console.error("Open-Meteo error:", {
      status: response.status,
      body,
    });

    const error = new Error("Weather provider returned an error");

    error.providerStatus = response.status;

    throw error;
  }

  const data = await response.json();

  if (typeof data?.current?.temperature_2m !== "number") {
    console.error("Unexpected weather response:", data);

    throw new Error("Weather provider returned invalid data");
  }

  return data;
}
