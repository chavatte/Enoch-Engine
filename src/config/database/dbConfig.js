import envConfig from "../envConfig.js";

const dbConfig = {
  HOST: envConfig.db.host,
  PORT: envConfig.db.port,
  USER: envConfig.db.user,
  PASSWORD: envConfig.db.password,
  DB: envConfig.db.database,
  DIALECT: envConfig.db.dialect,
  SCHEMA: envConfig.db.schema,
  SCHEMA_TEST: envConfig.db.schemaTest,
  SCHEMA_BACKUP: envConfig.db.schemaBackup,
  SCHEMA_SWAGGER: envConfig.db.schemaSwagger,
  POOL: envConfig.db.pool,
};

export default dbConfig;
