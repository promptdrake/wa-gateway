import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import moment from "moment";
import { globalErrorMiddleware } from "./middlewares/error.middleware";
import { notFoundMiddleware } from "./middlewares/notfound.middleware";
import { serve } from "@hono/node-server";
import { env } from "./env";
import { createSessionController } from "./controllers/session";
import { createMessageController } from "./controllers/message";
import { createProfileController } from "./controllers/profile";
import { serveStatic } from "@hono/node-server/serve-static";
import { createHealthController } from "./controllers/health";
import { createAuthController } from "./controllers/dashboard/auth";
import { createDashboardController } from "./controllers/dashboard/dashboard";
import YAML from "yaml";
import fs from "fs";

// Load and parse Swagger documentation
let swaggerDocument: any = {};
try {
  const swaggerFile = fs.readFileSync("./swagger.yaml", "utf8");
  swaggerDocument = YAML.parse(swaggerFile);
  console.log("✅ Swagger documentation loaded successfully");
} catch (error) {
  console.warn(
    "⚠️  Swagger documentation not found or failed to parse. API documentation will not be available."
  );
}

const app = new Hono()
  .use(
    logger((...params) => {
      params.map((e) => console.log(`${moment().toISOString()} | ${e}`));
    })
  )
  .use(cors())

  .onError(globalErrorMiddleware)
  .notFound(notFoundMiddleware)

  /**
   * serve media message static files
   */

  .use(
    "/media/*",
    serveStatic({
      root: "./",
    })
  )
  .use(
    "/assets/*",
    serveStatic({
      root: "./",
    })
  )

  /**
   * session routes
   */
  .route("/", createSessionController())
  /**
   * message routes
   */
  .route("/", createMessageController())
  /**
   * profile routes
   */
  .route("/", createProfileController())

  /**
   * health routes
   */
  .route("/", createHealthController())

  /**
   * Swagger API Documentation
   */
  .get("/swagger.json", (c) => {
    return c.json(swaggerDocument);
  })
  .get("/api-docs", (c) => {
    const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>WhatsApp Gateway API - Swagger UI</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700">
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui.css">
        <style>
          html { box-sizing: border-box; overflow: -moz-scrollbars-vertical; overflow-y: scroll; }
          *, *:before, *:after { box-sizing: inherit; }
          body { margin:0; background: #fafafa; }
        </style>
      </head>
      <body>
        <div id="swagger-ui"></div>
        <script src="https://cdn.jsdelivr.net/npm/swagger-ui-dist@3/swagger-ui-bundle.js"></script>
        <script>
          window.onload = function() {
            const ui = SwaggerUIBundle({
              url: "/swagger.json",
              dom_id: '#swagger-ui',
              deepLinking: true,
              presets: [
                SwaggerUIBundle.presets.apis
              ],
              plugins: [
                SwaggerUIBundle.plugins.DownloadUrl
              ],
              persistAuthorization: true
            })
            window.ui = ui
          }
        </script>
      </body>
    </html>
    `;
    return c.html(html);
  })

  /**
   * auth routes
   */
  .route("/", createAuthController())
  /**
   * dashboard routes
   */
  .route("/", createDashboardController());

const port = env.PORT;

serve({
  fetch: app.fetch,
  port: port,
});
