import { describe, it, expect, vi } from "vitest";

import { getCurrentWeather } from "../services/weatherService.js";

describe("weatherService", () => {
  it("returns current weather from Open-Meteo", async () => {
    const weatherData = {
      current: {
        temperature_2m: 22.5,
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => weatherData,
    });

    vi.stubGlobal("fetch", fetchMock);

    try {
      const result = await getCurrentWeather(40.44062, -79.99589);

      expect(result).toEqual(weatherData);

      expect(fetchMock).toHaveBeenCalledOnce();

      const expectedUrl =
        "https://api.open-meteo.com/v1/forecast" +
        "?latitude=40.44062" +
        "&longitude=-79.99589" +
        "&current=temperature_2m";

      expect(fetchMock).toHaveBeenCalledWith(new URL(expectedUrl));
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("throws an error with the provider status when Open-Meteo fails", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => "Service unavailable",
    });

    vi.stubGlobal("fetch", fetchMock);

    try {
      let caughtError;

      try {
        await getCurrentWeather(40.44062, -79.99589);
      } catch (error) {
        caughtError = error;
      }

      expect(caughtError).toBeInstanceOf(Error);

      expect(caughtError.message).toBe("Weather provider returned an error");

      expect(caughtError.providerStatus).toBe(503);

      expect(fetchMock).toHaveBeenCalledOnce();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("throws an error when weather data is invalid", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        current: {},
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    try {
      await expect(getCurrentWeather(40.44062, -79.99589)).rejects.toThrow(
        "Weather provider returned invalid data",
      );

      expect(fetchMock).toHaveBeenCalledOnce();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("throws an error when the network request fails", async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError("fetch failed"));

    vi.stubGlobal("fetch", fetchMock);

    try {
      await expect(getCurrentWeather(40.44062, -79.99589)).rejects.toThrow(
        "fetch failed",
      );

      expect(fetchMock).toHaveBeenCalledOnce();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
