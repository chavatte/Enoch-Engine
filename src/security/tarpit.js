import express from "express";
import logger from "../utils/logger.js";

const tarpitRouter = express.Router();

const bruteForceTargets = [
  "/api/admin/login",
  "/api/auth/login",
  "/administrator",
  "/admin/login",
  "/login.php",
];

tarpitRouter.all(bruteForceTargets, (req, res) => {
  const attackerIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

  logger.warn(
    `[SEC_OPS] ⏱️ TARPIT ACIONADO! Ferramenta de Brute Force capturada do IP: ${attackerIp}`,
  );
  setTimeout(() => {
    res.status(401).json({
      status: "TRAPPED",
      system: "Enoch Engine Defense",
      message:
        "Eternity is a heavy burden. You tried to force the gates, now feel the weight of time standing still.",
    });
  }, 15000);
});

export default tarpitRouter;
