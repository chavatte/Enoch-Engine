import EventEmitter from "events";
import { dbBackup } from "../config/database/backup.js";
import logger from "./logger.js";

class BackupObserver extends EventEmitter {}
const backupObserver = new BackupObserver();
const handleBackup = async (modelName, operation, data) => {
  try {
    const Model = dbBackup[modelName];

    if (!Model) {
      throw new Error(`Modelo ${modelName} não encontrado no banco de backup.`);
    }

    if (operation === "create") {
      await Model.create(data);
    } else if (operation === "update") {
      await Model.update(data, { where: { id: data.id } });
    } else if (operation === "delete") {
      await Model.destroy({ where: { id: data.id } });
    }

    logger.info(
      `[BACKUP] Sucesso: ${modelName} (${operation}) - ID: ${data.id}`
    );
  } catch (error) {
    logger.error(
      `[BACKUP ERROR] Falha em ${modelName} (${operation}) - ID: ${data?.id}:`,
      error
    );
  }
};

backupObserver.on("login:backup", (op, data) =>
  handleBackup("login", op, data)
);

export default backupObserver;
