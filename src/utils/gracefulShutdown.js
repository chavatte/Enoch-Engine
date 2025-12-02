import chalk from "chalk";
import readline from "readline";
import logger from "./logger.js";
import envConfig from "../config/envConfig.js";

export const initGracefulShutdown = (server, dbConnections = []) => {
  const shutdown = async (signal) => {
    console.log();
    logger.info(
      chalk.bgYellow.whiteBright.bold(` 🛑 ${signal} RECEBIDO `) +
        chalk.yellow(" Iniciando encerramento...")
    );

    if (server) {
      if (server.closeAllConnections) server.closeAllConnections();
      else if (server.closeIdleConnections) server.closeIdleConnections();

      await new Promise((resolve) => {
        server.close((err) => {
          if (err) {
            logger.error(chalk.red("Erro ao fechar servidor HTTP:"), err);
          } else {
            logger.info(
              chalk.dim("HTTP:") +
                " Servidor fechado. Novas conexões recusadas."
            );
          }
          resolve();
        });
      });
    }

    try {
      logger.info(
        chalk.blue("SQL:") + " Fechando conexões com o Banco de Dados..."
      );

      await Promise.all(
        dbConnections.map((db) => {
          if (db && db.sequelize) return db.sequelize.close();
          return Promise.resolve();
        })
      );

      logger.info(
        chalk.green("✅ Conexões com o Banco de Dados encerradas com sucesso.")
      );

      if (signal === "SIGUSR2") {
        process.kill(process.pid, "SIGUSR2");
      } else {
        logger.info(chalk.bgGreen.whiteBright.bold(" 👋 BYE BYE "));
        process.exit(0);
      }
    } catch (err) {
      logger.error(chalk.bgRed.white.bold(" ❌ ERRO DE SHUTDOWN "), err);
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGUSR2", () => shutdown("SIGUSR2"));

  if (process.platform === "win32" && envConfig.nodeEnv !== "development") {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.on("SIGINT", () => {
      process.emit("SIGINT");
    });
  }
};
