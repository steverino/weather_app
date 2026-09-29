import express from "express";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { requestId } from "../middleware/requestId.js";

describe("requestId middleware", () => {
  it("adds a request ID to the request and response", async () => {
    const app = express();

    app.use(requestId);

    app.get("/test", (req, res) => {
      res.json({
        requestId: req.id,
      });
    });

    const response = await request(app).get("/test").expect(200);

    expect(response.body.requestId).toBeDefined();

    expect(response.headers["x-request-id"]).toBe(response.body.requestId);
  });
});
