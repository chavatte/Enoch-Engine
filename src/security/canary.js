import logger from "../utils/logger.js";

export const canaryMiddleware = (req, res, next) => {
  const POISONED_TOKEN =
    "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzeXN0ZW0iOiJFbm9jaEVuZ2luZSIsInJvbGUiOiJhZG1pbiIsInVzZXIiOiJNZWZ5c3RvIiwiZXhwIjo0MTAyNDQ0ODAwfQ.b_K9X8V4j_HlM2sZ-QcW1xTyU7vN-mP3kR_5_abc123";
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader === POISONED_TOKEN) {
    const attackerIp =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    logger.error(
      `[SEC_OPS] 🐦 CANARY TOKEN USADO! Atacante tentou escalar privilégios. IP: ${attackerIp}`,
    );

    return res.status(403).json({
      error: "CRITICAL_OVERRIDE_FAILED",
      message:
        "You stole a key that opens no doors, it only wakes the guardian. Your intrusion has been logged.",
    });
  }
  next();
};
