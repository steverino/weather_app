import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Favorites from "./Favorites.jsx";
import {
  getFavorites,
  addFavorite,
  deleteFavorite,
} from "../api/weatherApi.js";

vi.mock("../api/weatherApi.js", () => ({
  getFavorites: vi.fn(),
  addFavorite: vi.fn(),
  deleteFavorite: vi.fn(),
}));

const pittsburgh = {
  id: 1,
  city: "Pittsburgh",
  latitude: 40.44062,
  longitude: -79.99589,
};

const selectedPittsburgh = {
  name: "Pittsburgh",
  latitude: 40.44062,
  longitude: -79.99589,
};

describe("Favorites component", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    getFavorites.mockResolvedValue([]);
  });

  afterEach(() => {
    cleanup();
  });

  it("displays saved favorites when loaded", async () => {
    getFavorites.mockResolvedValue([pittsburgh]);

    render(<Favorites selectedLocation={null} onSelectCity={vi.fn()} />);

    expect(
      await screen.findByRole("button", { name: "Pittsburgh" }),
    ).toBeInTheDocument();
  });

  it("saves the selected city", async () => {
    const user = userEvent.setup();
    addFavorite.mockResolvedValue(pittsburgh);

    render(
      <Favorites
        selectedLocation={selectedPittsburgh}
        onSelectCity={vi.fn()}
      />,
    );

    await screen.findByText("No favorite cities yet.");

    await user.click(screen.getByRole("button", { name: "Save Pittsburgh" }));

    await waitFor(() => {
      expect(addFavorite).toHaveBeenCalledWith({
        city: "Pittsburgh",
        latitude: 40.44062,
        longitude: -79.99589,
      });
    });

    expect(
      await screen.findByRole("button", { name: "Already saved" }),
    ).toBeDisabled();
  });

  it("removes a favorite", async () => {
    const user = userEvent.setup();
    getFavorites.mockResolvedValue([pittsburgh]);
    deleteFavorite.mockResolvedValue(undefined);

    render(<Favorites selectedLocation={null} onSelectCity={vi.fn()} />);

    await screen.findByRole("button", { name: "Pittsburgh" });

    await user.click(screen.getByRole("button", { name: "Remove Pittsburgh" }));

    await waitFor(() => {
      expect(deleteFavorite).toHaveBeenCalledWith(1);
    });

    expect(
      await screen.findByText("No favorite cities yet."),
    ).toBeInTheDocument();
  });

  it("displays an API error", async () => {
    getFavorites.mockRejectedValue(new Error("Unable to load favorites"));

    render(<Favorites selectedLocation={null} onSelectCity={vi.fn()} />);

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Unable to load favorites",
    );
  });
});
