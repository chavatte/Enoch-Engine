import logger from "../utils/logger.js";

export const mirrorMiddleware = (req, res, next) => {
  const fullUrl = decodeURIComponent(req.originalUrl).toLowerCase();

  const maliciousSignatures = [
    /union\s+select/i,
    /'\s*or\s*1\s*=\s*1/i,
    /<script>/i,
    /\/etc\/passwd/i,
    /\.\.\/\.\.\//i,
  ];

  const isMalicious = maliciousSignatures.some((regex) => regex.test(fullUrl));

  if (isMalicious) {
    const attackerIp =
      req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    logger.error(
      `[SEC_OPS] 🪞 ESPELHO ACIONADO! Payload malicioso detectado do IP: ${attackerIp} - URL: ${req.originalUrl}`,
    );

    return res.status(403).json({
      error: "MALICIOUS_PAYLOAD_REFLECTED",
      message:
        "I see your cheap spells. Did you really think a simple quote mark would break the Enoch Engine? A mirror reflects only the fool.",
    });
  }
  next();
};
