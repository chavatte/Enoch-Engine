"use strict";

(async () => {
  const { default: chalk } = await import("chalk");

  function printHelp(command, details) {
    console.log(
      "\n" +
        chalk.bgWhite.black.bold(` 🔍 DETALHES DO COMANDO: `) +
        " " +
        chalk.bold.yellow(`yarn ${command}`)
    );

    console.log(
      "\n" + chalk.bold.cyan("  📝 - Descrição: ") + chalk.white(details.desc)
    );

    if (details.usage) {
      console.log(
        chalk.bold.magenta("  ⌨️  - Uso: ") + chalk.dim(details.usage)
      );
    }

    if (details.examples && details.examples.length > 0) {
      console.log(chalk.bold.green("\n  💡 Exemplos:"));
      details.examples.forEach((example) => {
        console.log(`     ${chalk.gray("$")} ${chalk.green(example)}`);
      });
    }
    console.log("\n" + chalk.dim("─".repeat(50)));
  }

  const helpData = {
    start: {
      desc: "Inicia o servidor em modo de produção (otimizado).",
      usage: "yarn start",
    },
    dev: {
      desc: "Inicia o servidor em modo de desenvolvimento com nodemon (reinicia ao salvar).",
      usage: "yarn dev",
    },
    test: {
      desc: "Executa a suíte de testes completa (Vitest) em modo headless.",
      usage: "yarn test [filtro_opcional]",
      examples: ["yarn test", "yarn test auth.integration.spec.js"],
    },
    "test:ui": {
      desc: "Abre a interface gráfica interativa do Vitest no navegador.",
      usage: "yarn test:ui",
    },
    report: {
      desc: "Serve o relatório de testes HTML (gerado pelo Vitest).",
      usage: "yarn report",
    },
    "db:migrate": {
      desc: "Aplica todas as migrations pendentes no banco de dados.",
      usage: "yarn db:migrate",
    },
    "db:migrate:to": {
      desc: "Aplica todas as migrations pendentes ATÉ o arquivo especificado.",
      usage: "yarn db:migrate:to <nome-do-arquivo-da-migration.cjs>",
      examples: ["yarn db:migrate:to 20240101000000-create-initial-auth.cjs"],
    },
    "db:migrate:undo": {
      desc: "Reverte (desfaz) a última migração que foi aplicada.",
      usage: "yarn db:migrate:undo",
    },
    "db:migrate:undo:to": {
      desc: "Reverte todas as migrations aplicadas ATÉ o arquivo especificado.",
      usage: "yarn db:migrate:undo:to <nome-do-arquivo-da-migration.cjs>",
      examples: [
        "yarn db:migrate:undo:to 20240101000000-create-initial-auth.cjs",
      ],
    },
    "db:migration:create": {
      desc: "Cria um novo arquivo de migração (e o renomeia para .cjs).",
      usage: "yarn db:migration:create <nome-da-migration>",
      examples: ["yarn db:migration:create adicionar-campo-perfil-usuario"],
    },
  };

  const commandName = process.argv[2];

  if (!commandName) {
    console.log(
      "\n" +
        chalk.hex("#bfa6ff").bold(" 🛠️ [ENOCH ENGINE-API] CENTRO DE AJUDA") +
        "\n"
    );
    console.log(
      chalk.dim("Dica: Use ") +
        chalk.yellow("yarn usage <comando>") +
        chalk.dim(" para ver detalhes específicos.\n")
    );

    const generalCmds = {};
    const dbCmds = {};

    Object.keys(helpData).forEach((cmd) => {
      if (cmd.startsWith("db:")) {
        dbCmds[cmd] = helpData[cmd];
      } else {
        generalCmds[cmd] = helpData[cmd];
      }
    });

    const printCategory = (title, cmds) => {
      console.log(chalk.bold.magenta(title));
      Object.keys(cmds).forEach((cmd) => {
        const padding = " ".repeat(Math.max(0, 20 - cmd.length));
        console.log(
          `  ${chalk.green("yarn " + cmd)} ${padding} ${chalk.white(
            cmds[cmd].desc
          )}`
        );
      });
      console.log();
    };

    printCategory("📦 - Gerais & Testes", generalCmds);
    printCategory("🗄️ - Banco de Dados ", dbCmds);

    console.log(
      chalk.bgGreen.black(" PRONTO ") + " Escolha um comando para rodar.\n"
    );
  } else if (helpData[commandName]) {
    const cmdDetails = helpData[commandName];
    printHelp(commandName, cmdDetails);
    console.log();
  } else {
    console.log(
      `\n${chalk.bgRed.white.bold(" ERRO ")} Comando "${chalk.bold.yellow(
        commandName
      )}" não encontrado na base de ajuda.`
    );
    console.log(
      `Use ${chalk.cyan(
        "yarn usage"
      )} para ver todos os comandos disponíveis.\n`
    );
  }
})();
