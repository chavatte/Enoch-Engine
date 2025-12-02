import { execSync } from "child_process";
import chalk from "chalk";
import envConfig from "./src/config/envConfig.js";
import { dbLogin } from "./src/config/database/index.js";
import { dbLoginBackup } from "./src/config/database/backup.js";

const dbInstances = [dbLogin, dbLoginBackup];

const cleanDatabase = async (dbInstance) => {
  if (!dbInstance || !dbInstance.sequelize) return;

  const sequelize = dbInstance.sequelize;
  sequelize.options.logging = false;

  try {
    await sequelize.query("SET CONSTRAINTS ALL DEFERRED;", {
      raw: true,
      logging: false,
    });
    await sequelize.truncate({
      cascade: true,
      restartIdentity: true,
      logging: false,
    });
    await sequelize.query("SET CONSTRAINTS ALL IMMEDIATE;", {
      raw: true,
      logging: false,
    });
  } catch (err) {
    console.warn(chalk.yellow(` ⚠️  Aviso ao limpar banco: ${err.message}`));
  }
};

export async function setup() {
  console.log(
    chalk.bgBlue.white.bold("\n ⚙️  GLOBAL TEST SETUP ") +
      chalk.blue("  Inicializando ambiente de testes...")
  );

  if (envConfig.nodeEnv !== "test") {
    const errorMsg =
      "A configuração global de testes só pode ser executada em ambiente de teste (NODE_ENV=test).";
    console.error(
      chalk.bgRed.white.bold(" ⛔ AMBIENTE INVÁLIDO ") +
        " " +
        chalk.red(errorMsg)
    );
    throw new Error(errorMsg);
  }

  try {
    console.log(chalk.cyan.bold("\n1️⃣  Banco de Dados (Migrations)"));
    console.log(chalk.dim("   ↳ Executando migrations via Yarn..."));
    execSync("yarn cross-env NODE_ENV=test sequelize-cli db:migrate", {
      stdio: "inherit",
    });

    console.log(chalk.green("   ✔ Migrations aplicadas com sucesso."));
    console.log(chalk.cyan.bold("\n2️⃣  Higienização (Clean Database)"));
    console.log(
      chalk.yellow(
        "   ↳ Limpando dados de " + dbInstances.length + " conexões..."
      )
    );

    const startTime = Date.now();
    await Promise.all(dbInstances.map(cleanDatabase));
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(
      chalk.green(
        `   ✔ Banco de dados limpo e pronto em ${chalk.bold(duration + "s")}.`
      )
    );
    console.log(
      chalk.bgGreen.white.bold("\n ✅ SISTEMA PRONTO ") +
        chalk.green("  Testes autorizados a iniciar.\n")
    );
  } catch (error) {
    console.error(
      chalk.bgRed.white.bold("\n 🛑 FATAL ERROR ") +
        chalk.red("  Falha na configuração global de testes.")
    );
    console.error(chalk.red.bold("\nStack Trace:"));
    console.error(error);
    process.exit(1);
  }
}

export async function teardown() {
  console.log(
    chalk.bgMagenta.white.bold("\n 🏁 GLOBAL TEST TEARDOWN ") +
      chalk.magenta("  Finalizando ambiente e conexões...")
  );

  try {
    console.log(chalk.cyan.bold("\n1️⃣  Banco de Dados (Shutdown)"));
    console.log(chalk.yellow("   ↳ Encerrando conexões do Sequelize..."));

    const startTime = Date.now();
    const closeConnection = async (dbInstance) => {
      if (dbInstance && dbInstance.sequelize) {
        await dbInstance.sequelize.close();
      }
    };

    await Promise.all(dbInstances.map(closeConnection));

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log(
      chalk.green(
        `   ✔ Conexões fechadas com sucesso em ${chalk.bold(duration + "s")}.`
      )
    );

    console.log(
      chalk.bgGreen.white.bold("\n 👋 TESTES CONCLUÍDOS ") +
        chalk.green("  Processo finalizado.\n")
    );
  } catch (error) {
    console.error(
      chalk.bgRed.white.bold("\n ⚠️  TEARDOWN ERROR ") +
        chalk.red("  Falha ao encerrar conexões.")
    );
    console.error(chalk.red.bold("Detalhes do erro:"));
    console.error(error);
  }
}
