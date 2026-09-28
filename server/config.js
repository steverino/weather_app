function parsePort(value) {
  if (value === undefined || value === "") {
    return 3000;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT: ${value}`);
  }

  return port;
}

function parseNodeEnv(value) {
  const nodeEnv = value || "development";

  const validEnvironments = ["development", "test", "production"];

  if (!validEnvironments.includes(nodeEnv)) {
    throw new Error(`Invalid NODE_ENV: ${nodeEnv}`);
  }

  return nodeEnv;
}

export function getConfig(env = process.env) {
  return {
    port: parsePort(env.PORT),
    host: env.HOST || "0.0.0.0",
    nodeEnv: parseNodeEnv(env.NODE_ENV),
  };
}
