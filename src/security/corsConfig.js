import logger from "../utils/logger.js";
import envConfig from "../config/envConfig.js";

const isDevOrTest =
  envConfig.nodeEnv === "development" || envConfig.nodeEnv === "test";

const allowedOrigins = (envConfig.cors.allowedOrigins || "")
  .split(",")
  .filter(Boolean);

if (envConfig.nodeEnv === "production" && allowedOrigins.length === 0) {
  logger.warn(
    "Nenhuma origem de CORS foi definida para o ambiente de produção na variável CORS_ALLOWED_ORIGINS."
  );
}

const originPolicy = (origin, callback) => {
  if (isDevOrTest) {
    return callback(null, true);
  }

  if (
    allowedOrigins.includes("*") ||
    (origin && allowedOrigins.includes(origin))
  ) {
    return callback(null, true);
  }

  logger.warn(`Tentativa de acesso CORS bloqueada para a origem: ${origin}`);
  callback(new Error("Origem não permitida pela política de CORS."));
};

export const CorsOptions = {
  origin: originPolicy,
  methods: ["GET", "PUT", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
  optionsSuccessStatus: 200,
};
