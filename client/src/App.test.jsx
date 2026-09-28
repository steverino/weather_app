import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { render, screen, waitFor, cleanup } from "@testing-library/react";

import userEvent from "@testing-library/user-event";
import App from "./App.jsx";

import { getFavorites, fetchWeather } from "./api/weatherApi.js";

vi.mock("./api/weatherApi.js", () => ({
  getFavorites: vi.fn(),
  addFavorite: vi.fn(),
  deleteFavorite: vi.fn(),
  searchLocations: vi.fn(),
  fetchWeather: vi.fn(),
}));

describe("App and Favorites integration", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    getFavorites.mockResolvedValue([
      {
        id: 1,
        city: "Pittsburgh",
        latitude: 40.44062,
        longitude: -79.99589,
      },
    ]);

    fetchWeather.mockResolvedValue({
      current: {
        temperature_2m: 22,
      },
    });
  });

  afterEach(() => {
    cleanup();
  });

  it("loads weather when a saved city is selected", async () => {
    const user = userEvent.setup();

    render(<App />);

    const favorite = await screen.findByRole("button", {
      name: "Pittsburgh",
    });

    await user.click(favorite);

    await waitFor(() => {
      expect(fetchWeather).toHaveBeenCalledWith(
        40.44062,
        -79.99589,
        expect.any(AbortSignal),
      );
    });

    expect(await screen.findByText("71.6°F")).toBeInTheDocument();
  });
  it("temporary CI failure test", () => {
    expect(true).toBe(false);
  });
});
