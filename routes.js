/**
 * Enoch Engine API
 * Copyright (c) 2025 João Carlos Chavatte (DevChavatte)
 *
 * This source code is licensed under the MIT License found in the
 * LICENSE file in the root directory of this source tree.
 */

import express from "express";
import cors from "cors";
import { CorsOptions } from "./src/security/corsConfig.js";
import authRouter from "./src/routes/v1/login.js";
import contactRouter from "./src/routes/v1/contact.js";
import cloudflareRouter from "./src/routes/v1/cloudflareR2.js";
import swaggerDocsRouter from "./src/routes/v1/swagger.js";
import { checkHealth } from "./src/controllers/healthController.js";

const routes = express.Router();

routes.get("/robots.txt", (req, res) => {
  res.type("text/plain");
  res.send("User-agent: *\nDisallow: /");
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
