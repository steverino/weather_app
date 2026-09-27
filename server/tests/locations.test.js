import { describe, it, expect, vi, afterEach } from "vitest";

import request from "supertest";
import { createApp } from "../app.js";
import { createDatabase } from "../db.js";

describe("Locations API", () => {
  const db = createDatabase(":memory:");
  const app = createApp(db);

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects an empty city", async () => {
    const response = await request(app)
      .get("/api/locations")
      .query({ city: "   " });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("City is required");
  });

  it("returns matching locations", async () => {
    const locations = [
      {
        id: 5206379,
        name: "Pittsburgh",
        latitude: 40.44062,
        longitude: -79.99589,
        country: "United States",
      },
    ];

    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: locations }),
    });

    vi.stubGlobal("fetch", mockFetch);

    const response = await request(app)
      .get("/api/locations")
      .query({ city: "Pittsburgh" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(locations);

    const requestedUrl = mockFetch.mock.calls[0][0];
    expect(requestedUrl).toContain("name=Pittsburgh");
  });

  it("returns an empty array when no locations match", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({}),
      }),
    );

    const response = await request(app)
      .get("/api/locations")
      .query({ city: "NonexistentCity" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("handles a geocoding provider failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
      }),
    );

    const response = await request(app)
      .get("/api/locations")
      .query({ city: "Pittsburgh" });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe("Unable to retrieve locations");
  });
});
