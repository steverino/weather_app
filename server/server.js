import { createApp, allowedOrigins } from "./app.js";

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

const app = createApp();

app.listen(PORT, HOST, () => {
  console.log(`Weather API listening on ${HOST}:${PORT}`);
  console.log("Allowed CORS origins:", allowedOrigins);
});
