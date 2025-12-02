const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const sequelizerc = require("../.sequelizerc");
const migrationsPath = path.resolve(sequelizerc["migrations-path"]);

const migrationName = process.argv[2];

if (!migrationName) {
  console.error("❌ Erro: Por favor, forneça um nome para a migração.");
  console.log("💡 Exemplo: yarn db:migration:create adicionar-campo-usuario");
  process.exit(1);
}

try {
  console.log(`🚀 Gerando migração "${migrationName}"...`);
  execSync(`npx sequelize-cli migration:generate --name ${migrationName}`, {
    stdio: "inherit",
  });

  console.log("🔎 Procurando pelo arquivo de migração recém-criado...");

  const newMigrationFile = fs
    .readdirSync(migrationsPath)
    .filter((file) => path.extname(file) === ".js")
    .map((file) => ({
      name: file,
      time: fs.statSync(path.join(migrationsPath, file)).mtime.getTime(),
    }))
    .sort((a, b) => b.time - a.time)[0];

  if (!newMigrationFile) {
    throw new Error(
      "Não foi possível encontrar o novo arquivo de migração na pasta."
    );
  }

  const jsFilePath = path.join(migrationsPath, newMigrationFile.name);
  const cjsFilePath = jsFilePath.replace(/\.js$/, ".cjs");

  console.log(`✅ Arquivo encontrado: ${newMigrationFile.name}`);
  console.log(`Renomeando para "${path.basename(cjsFilePath)}"...`);

  fs.renameSync(jsFilePath, cjsFilePath);

  console.log(`✅ Sucesso! Migração criada em: ${cjsFilePath}`);
} catch (error) {
  console.error("🔥 Falha ao criar a migração:", error.message);
  process.exit(1);
}
