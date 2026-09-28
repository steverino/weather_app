import { createApp, allowedOrigins } from "./app.js";
import { getConfig } from "./config.js";

const config = getConfig();

const app = createApp();

app.listen(config.port, config.host, () => {
  console.log(`Weather API listening on ${config.host}:${config.port}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log("Allowed CORS origins:", allowedOrigins);
});
