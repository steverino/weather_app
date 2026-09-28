import { describe, it, expect, vi, afterEach } from "vitest";

import request from "supertest";
import { createApp } from "../app.js";
import { createDatabase } from "../db.js";

describe("Weather API", () => {
  const db = createDatabase(":memory:");
  const app = createApp(db);

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("rejects missing coordinates", async () => {
    const response = await request(app).get("/api/weather");

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      "Valid latitude and longitude are required",
    );
  });

  it("returns weather from the provider", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        current: {
          temperature_2m: 22,
        },
      }),
    });

    vi.stubGlobal("fetch", mockFetch);

    const response = await request(app).get("/api/weather").query({
      latitude: 40.44062,
      longitude: -79.99589,
    });

    expect(response.status).toBe(200);
    expect(response.body.current.temperature_2m).toBe(22);
    expect(mockFetch).toHaveBeenCalledOnce();
  });

  it("handles provider errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 503,
        text: async () => "Service unavailable",
      }),
    );

    const response = await request(app).get("/api/weather").query({
      latitude: 40.44062,
      longitude: -79.99589,
    });

    expect(response.status).toBe(502);
    expect(response.body.providerStatus).toBe(503);
  });

  it("rejects invalid provider data", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          current: {},
        }),
      }),
    );

    const response = await request(app).get("/api/weather").query({
      latitude: 40.44062,
      longitude: -79.99589,
    });

    expect(response.status).toBe(502);
    expect(response.body.error).toBe("Weather provider returned invalid data");
  });
});
