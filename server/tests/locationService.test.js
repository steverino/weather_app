import { describe, it, expect, vi } from "vitest";
import { searchLocations } from "../services/locationService.js";

describe("locationService", () => {
  it("returns locations from Open-Meteo", async () => {
    const locations = [
      {
        id: 5206379,
        name: "Pittsburgh",
        latitude: 40.44062,
        longitude: -79.99589,
      },
    ];

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        results: locations,
      }),
    });

    vi.stubGlobal("fetch", fetchMock);

    try {
      const result = await searchLocations("Pittsburgh");

      expect(result).toEqual(locations);

      expect(fetchMock).toHaveBeenCalledOnce();

      expect(fetchMock).toHaveBeenCalledWith(
        "https://geocoding-api.open-meteo.com/v1/search" +
          "?name=Pittsburgh&count=5&language=en&format=json",
      );
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("returns an empty array when no locations match", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    vi.stubGlobal("fetch", fetchMock);

    try {
      const result = await searchLocations("NonexistentCity");

      expect(result).toEqual([]);
      expect(fetchMock).toHaveBeenCalledOnce();
    } finally {
      vi.unstubAllGlobals();
    }
  });

  it("throws an error when the provider returns 503", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: false,
      status: 503,
    });

    vi.stubGlobal("fetch", fetchMock);

    try {
      await expect(searchLocations("Pittsburgh")).rejects.toThrow(
        "Geocoding API returned 503",
      );

      expect(fetchMock).toHaveBeenCalledOnce();
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
