import express from "express";
import request from "supertest";
import { describe, expect, it, vi } from "vitest";
import { requestLogger } from "../middleware/requestLogger.js";
import { requestId } from "../middleware/requestId.js";

describe("requestLogger middleware", () => {
  it("logs the method, URL, status code, and duration", async () => {
    const app = express();

    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    app.use(requestId);
    app.use(requestLogger);

    app.get("/test", (req, res) => {
      res.status(200).json({ message: "ok" });
    });

    await request(app).get("/test").expect(200);

    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringMatching(/^\[[0-9a-f-]+\] GET \/test 200 \d+ms$/),
    );

    consoleSpy.mockRestore();
  });
});
