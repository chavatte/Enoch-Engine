import { db } from "../config/database/index.js";
import logger from "../utils/logger.js";

export async function checkHealth(req, res) {
  const healthcheck = {
    uptime: process.uptime(),
    message: "OK",
    timestamp: Date.now(),
    database: "UNKNOWN",
  };

  try {
    await db.sequelize.authenticate();
    healthcheck.database = "CONNECTED";
    res.status(200).send(healthcheck);
  } catch (error) {
    healthcheck.message = error.message;
    healthcheck.database = "DISCONNECTED";
    logger.error("[HealthCheck] Falha na conexão com o banco:", error);
    res.status(503).send(healthcheck);
  }
}
