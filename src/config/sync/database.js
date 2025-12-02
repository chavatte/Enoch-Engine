import logger from "../../utils/logger.js";
import { dbLogin } from "../database/index.js";
import { dbLoginBackup } from "../database/backup.js";

async function syncDatabase() {
  try {
    logger.info("🔄 Sincronizando tabelas do banco de dados...");
    
    await Promise.all([
      dbLogin.sequelize.sync(),
      dbLoginBackup.sequelize.sync(),
    ]);
    
    logger.info("✅ Sincronização concluída.");
  } catch (err) {
    logger.error("❌ Erro ao sincronizar modelos:", err);
  }
}

export { syncDatabase };
