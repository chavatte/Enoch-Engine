/**
 * Enoch Engine API
 * Copyright (c) 2025 João Carlos Chavatte (DevChavatte)
 *
 * This source code is licensed under the MIT License found in the
 * LICENSE file in the root directory of this source tree.
 */

import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import path from "path";
import chalk from "chalk";
import { fileURLToPath } from "url";
import compression from "compression";
import routes from "./routes.js";
import envConfig from "./src/config/envConfig.js";
import { AppError, BadRequestError } from "./src/utils/customErrors.js";
import logger from "./src/utils/logger.js";
import { HelmetPolicesConfig } from "./src/security/helmetPolices.js";
import { initGracefulShutdown } from "./src/utils/gracefulShutdown.js";
import { dbLogin } from "./src/config/database/index.js";
import { dbLoginBackup } from "./src/config/database/backup.js";

process.on("unhandledRejection", (reason, promise) => {
  const errorMsg = chalk.bgRed.white.bold(" 💀 UNHANDLED REJECTION ");
  logger.error(`${errorMsg}`, { promise, reason: reason?.stack || reason });
  if (envConfig.nodeEnv !== "test") process.exit(1);
});

process.on("uncaughtException", (error) => {
  const errorMsg = chalk.bgRed.white.bold(" 💥 UNCAUGHT EXCEPTION ");
  logger.error(`${errorMsg}: ${chalk.red(error.message)}`, {
    stack: error.stack,
  });
  if (envConfig.nodeEnv !== "test") process.exit(1);
});

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/src/views"));

app.use(morgan("combined", { stream: logger.stream }));
app.use(helmet({ ...HelmetPolicesConfig }));
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);

app.use((req, res, next) => {
  next(new AppError(`Ops! A rota ${req.originalUrl} não foi encontrada.`, 404));
});

app.use((err, req, res, next) => {
  if (err.name === "SequelizeValidationError") {
    const message = err.errors.map((e) => e.message).join(", ");
    err = new BadRequestError(message);
  }
  if (err.name === "SequelizeUniqueConstraintError") {
    const isEmailError = err.errors?.some((e) => e.path === "email");
    if (isEmailError) {
      err = new BadRequestError("Este email já está em uso.");
    } else {
      err = new BadRequestError(
        "O valor inserido já existe (campo duplicado)."
      );
    }
  }
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  logger.error(
    `${chalk.red(err.statusCode)} - ${err.message} - ${req.originalUrl} - ${
      req.method
    } - ${req.ip}`,
    { errorMessage: err.message, errorStack: err.stack }
  );

  const isProduction = envConfig.nodeEnv === "production";

  if (err.isOperational) {
    res
      .status(err.statusCode)
      .json({ status: err.status, message: err.message });
  } else {
    res.status(500).json({
      status: "error",
      message: isProduction ? "Erro inesperado no servidor." : err.message,
      ...(!isProduction && { stack: err.stack }),
    });
  }
});

const startServer = () => {
  try {
    const server = app.listen(envConfig.port, envConfig.host, () => {
      const modeMap = {
        development: chalk.yellow("Desenvolvimento"),
        production: chalk.green("Produção"),
        test: chalk.magenta("Teste"),
      };
      const displayMode = modeMap[envConfig.nodeEnv] || envConfig.nodeEnv;
      const displayHost =
        envConfig.host === "0.0.0.0" ? "localhost" : envConfig.host;
      const url = chalk.underline.cyan(
        `http://${displayHost}:${envConfig.port}`
      );

      console.log();
      logger.info(
        chalk
          .hex("#bfa6ff")
          .bold("🚀 [ENOCH ENGINE-API] - ONLINE ") +
          ` Rodando em modo: [${displayMode}]`
      );
      logger.info(`👉 Acesso local: ${url}`);
      logger.info(`📚 Swagger Docs: ${url}/docs`);
      console.log();
    });

    initGracefulShutdown(server, [dbLogin, dbLoginBackup]);
  } catch (error) {
    logger.error(
      chalk.bgRed.white.bold(" ❌ FALHA CRÍTICA NA INICIALIZAÇÃO "),
      {
        message: error.message,
        stack: error.stack,
      }
    );
    process.exit(1);
  }
};

startServer();

export default app;
