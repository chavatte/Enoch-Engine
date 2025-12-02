const envConfig = require("../envConfig.js").default;

const baseConfig = {
  username: envConfig.db.user,
  password: envConfig.db.password,
  database: envConfig.db.database,
  host: envConfig.db.host,
  port: envConfig.db.port,
  dialect: envConfig.db.dialect,
};

module.exports = {
  development: {
    ...baseConfig,
    migrationStorageTableSchema: envConfig.db.schema,
  },
  test: {
    ...baseConfig,
    migrationStorageTableSchema: envConfig.db.schemaTest,
  },
  production: {
    ...baseConfig,
    migrationStorageTableSchema: envConfig.db.schema,
  },
};
