/**
 * Enoch Engine API
 * Copyright (c) 2025 João Carlos Chavatte (DevChavatte)
 *
 * This source code is licensed under the MIT License found in the
 * LICENSE file in the root directory of this source tree.
 */

import express from "express";
import cors from "cors";
import path from "path";
import { CorsOptions } from "./src/security/corsConfig.js";
import authRouter from "./src/routes/v1/login.js";
import contactRouter from "./src/routes/v1/contact.js";
import cloudflareRouter from "./src/routes/v1/cloudflareR2.js";
import swaggerDocsRouter from "./src/routes/v1/swagger.js";
import { checkHealth } from "./src/controllers/healthController.js";
import { canaryMiddleware } from "./src/security/canary.js";
import { mirrorMiddleware } from "./src/security/mirror.js";
import tarpitRouter from "./src/security/tarpit.js";
import honeypotRouter from "./src/security/honeypot.js";
import blackholeRouter from "./src/security/blackhole.js";

const routes = express.Router();

routes.use((req, res, next) => {
  res.removeHeader("X-Powered-By");
  res.setHeader("X-Powered-By", "PHP/5.2.4");
  res.setHeader("Server", "Apache/2.2.8 (Ubuntu)");
  next();
});

routes.use(
  canaryMiddleware,
  mirrorMiddleware,
  tarpitRouter,
  honeypotRouter,
  blackholeRouter,
);

routes.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send("User-agent: *\nDisallow: /");
});

routes.get("/favicon.ico", (req, res) => {
  const faviconPath = path.join(process.cwd(), "public", "favicon.ico");
  res.sendFile(faviconPath, (err) => {
    if (err) res.status(204).end();
  });
});

routes.get("/", (req, res) => {
  res.render("index");
});

routes.get("/health", checkHealth);

routes.use("/docs", swaggerDocsRouter);

const apiV1 = express.Router();

apiV1.use(cors(CorsOptions));

apiV1.use("/auth", authRouter);
apiV1.use("/contact", contactRouter);
apiV1.use("/cloudflare", cloudflareRouter);

routes.use("/api/v1", apiV1);

export default routes;
