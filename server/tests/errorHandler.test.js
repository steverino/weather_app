import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { requestId } from "../middleware/requestId.js";
import { errorHandler } from "../middleware/errorHandler.js";

describe("errorHandler middleware", () => {
  it("returns a 500 response with the request ID", async () => {
    const app = express();

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    app.use(requestId);

    app.get("/error", (req, res, next) => {
      next(new Error("Test error"));
    });

    app.use(errorHandler);

    const response = await request(app).get("/error").expect(500);

    expect(response.body.error).toBe("Internal server error");

    expect(response.body.requestId).toBeDefined();

    expect(response.headers["x-request-id"]).toBe(response.body.requestId);

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
