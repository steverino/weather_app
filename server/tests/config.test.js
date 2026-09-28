import { describe, expect, it } from "vitest";
import { getConfig } from "../config.js";

describe("server configuration", () => {
  it("uses default values when environment variables are missing", () => {
    const config = getConfig({});

    expect(config).toEqual({
      port: 3000,
      host: "0.0.0.0",
      nodeEnv: "development",
    });
  });

  it("uses values supplied by environment variables", () => {
    const config = getConfig({
      PORT: "8080",
      HOST: "127.0.0.1",
      NODE_ENV: "production",
    });

    expect(config).toEqual({
      port: 8080,
      host: "127.0.0.1",
      nodeEnv: "production",
    });
  });

  // Add the three new tests here:

  it("rejects a non-numeric port", () => {
    expect(() => getConfig({ PORT: "abc" })).toThrow("Invalid PORT: abc");
  });

  it("rejects a port below the valid range", () => {
    expect(() => getConfig({ PORT: "0" })).toThrow("Invalid PORT: 0");
  });

  it("rejects a port above the valid range", () => {
    expect(() => getConfig({ PORT: "70000" })).toThrow("Invalid PORT: 70000");
  });

  it("rejects an invalid NODE_ENV", () => {
    expect(() =>
      getConfig({
        NODE_ENV: "potato",
      }),
    ).toThrow("Invalid NODE_ENV: potato");
  });
});
