import { describe, it, expect, beforeEach, afterEach } from "vitest";

import request from "supertest";
import { createApp } from "../app.js";
import { createDatabase } from "../db.js";

const db = createDatabase(":memory:");
const app = createApp(db);

describe("Favorites API", () => {
  let db;
  let app;

  const pittsburgh = {
    city: "Pittsburgh",
    latitude: 40.44062,
    longitude: -79.99589,
  };

  beforeEach(() => {
    db = createDatabase(":memory:");
    app = createApp(db);
  });

  afterEach(() => {
    db.close();
  });

  it("GET returns an empty array initially", async () => {
    const response = await request(app).get("/api/favorites");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([]);
  });

  it("POST saves a favorite city", async () => {
    const response = await request(app).post("/api/favorites").send(pittsburgh);

    expect(response.status).toBe(201);
    expect(response.body).toMatchObject(pittsburgh);
    expect(response.body.id).toEqual(expect.any(Number));

    const saved = await request(app).get("/api/favorites");

    expect(saved.body).toHaveLength(1);
    expect(saved.body[0].city).toBe("Pittsburgh");
  });

  it("POST rejects invalid coordinates", async () => {
    const response = await request(app).post("/api/favorites").send({
      city: "Pittsburgh",
      latitude: 100,
      longitude: -79.99589,
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it("POST rejects duplicate favorites", async () => {
    await request(app).post("/api/favorites").send(pittsburgh);

    const response = await request(app).post("/api/favorites").send(pittsburgh);

    expect(response.status).toBe(409);

    const saved = await request(app).get("/api/favorites");

    expect(saved.body).toHaveLength(1);
  });

  it("DELETE removes an existing favorite", async () => {
    const created = await request(app).post("/api/favorites").send(pittsburgh);

    const response = await request(app).delete(
      `/api/favorites/${created.body.id}`,
    );

    expect(response.status).toBe(204);

    const saved = await request(app).get("/api/favorites");

    expect(saved.body).toEqual([]);
  });

  it("DELETE returns 404 for a missing favorite", async () => {
    const response = await request(app).delete("/api/favorites/999");

    expect(response.status).toBe(404);
  });

  it("DELETE rejects an invalid ID", async () => {
    const response = await request(app).delete("/api/favorites/abc");

    expect(response.status).toBe(400);
  });
});
