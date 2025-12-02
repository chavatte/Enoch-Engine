import winston from "winston";
import envConfig from "../config/envConfig.js";

const { combine, timestamp, printf, colorize, json, splat } = winston.format;

const consoleFormat = printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}]: ${message} `;
  if (metadata && Object.keys(metadata).length > 0) {
    const metaString = Object.entries(metadata)
      .filter(
        ([key]) =>
          key !== "level" &&
          key !== "message" &&
          key !== "timestamp" &&
          key !== "splat" &&
          key !== "Symbol(level)" &&
          key !== "Symbol(message)"
      )
      .map(([key, value]) => {
        if (value instanceof Error) {
          return `\n  ${key}: ${value.stack || value.message}`;
        }
        if (typeof value === "object" && value !== null) {
          try {
            return `\n  ${key}: ${JSON.stringify(value, null, 2)}`;
          } catch (e) {
            return `\n  ${key}: [Unserializable Object]`;
          }
        }
        return `\n  ${key}: ${value}`;
      })
      .join("");
    if (metaString) {
      msg += metaString;
    }
  }
  return msg;
});

const logger = winston.createLogger({
  level: envConfig.logLevel,
  format: combine(
    timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
    splat(),
    json()
  ),
  transports: [
    new winston.transports.Console({
      format: combine(
        colorize(),
        timestamp({ format: "DD-MM-YYYY HH:mm:ss" }),
        splat(),
        consoleFormat
      ),
    }),
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxsize: 5242880,
      maxFiles: 5,
      tailable: true,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      maxsize: 5242880,
      maxFiles: 5,
      tailable: true,
    }),
  ],
});

logger.stream = {
  write: function (message, encoding) {
    logger.info(message.trim());
  },
};

export default logger;
