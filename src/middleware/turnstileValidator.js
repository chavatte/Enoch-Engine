import envConfig from "../config/envConfig.js";
import { ForbiddenError } from "../utils/customErrors.js";
import logger from "../utils/logger.js";

export const verifyTurnstile = async (req, res, next) => {
  if (envConfig.nodeEnv === "test") return next();

  const token =
    req.body.cf_turnstile_response || req.headers["x-turnstile-token"];

  if (!token) {
    return next(
      new ForbiddenError("Validação de segurança (CAPTCHA) ausente.")
    );
  }

  try {
    const secretKey =
      envConfig.nodeEnv === "development"
        ? "1x0000000000000000000000000000000AA"
        : envConfig.security.turnstileSecret;

    const formData = new FormData();
    formData.append("secret", secretKey);
    formData.append("response", token);
    formData.append("remoteip", req.ip);

    const result = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body: formData,
      }
    );

    const outcome = await result.json();

    if (!outcome.success) {
      logger.warn(
        `[Turnstile] Falha na validação para IP ${req.ip}:`,
        outcome["error-codes"]
      );
      return next(
        new ForbiddenError(
          "Falha na validação de segurança. Tente recarregar a página."
        )
      );
    }

    next();
  } catch (error) {
    logger.error("[Turnstile] Erro de comunicação com Cloudflare:", error);
    return next(
      new ForbiddenError("Erro ao validar segurança. Tente mais tarde.")
    );
  }
};
