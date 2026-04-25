import express from "express";
import logger from "../utils/logger.js";

const honeypotRouter = express.Router();

const trappedRoutes = [
  "/.env",
  "/.git",
  "/admin",
  "/wp-admin",
  "/wp-login.php",
  "/phpmyadmin",
  "/config.json"
];

trappedRoutes.forEach((route) => {
  honeypotRouter.all(route, (req, res) => {
    const attackerIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    logger.warn(`[SEC_OPS] 🚨 HONEYPOT ACIONADO! IP: ${attackerIp} tentou acessar: ${route}`);

    res.status(403).json({
      status: "BLOCKED",
      system: "Enoch Engine Anti-Intrusion",
      message: "You seek shortcuts within the predictable habits of careless men. But blind machines cannot comprehend the architecture of the abyss.",
      ip_logged: true,
      timestamp: new Date().toISOString()
    });
  });
});

export default honeypotRouter;
