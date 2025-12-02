"use strict";

const envConfig = require("../../config/envConfig.js").default;
const schemas = [
  envConfig.db.schema,
  envConfig.db.schemaBackup,
  envConfig.db.schemaTest
];

module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      for (const schema of schemas) {
        if (!schema) continue;
        await queryInterface.createTable(
          { tableName: "Logins", schema },
          {
            id: {
              allowNull: false,
              autoIncrement: true,
              primaryKey: true,
              type: Sequelize.INTEGER,
            },
            email: {
              type: Sequelize.STRING,
              allowNull: false,
              unique: true,
            },
            password: {
              type: Sequelize.STRING,
              allowNull: false,
            },
            tokenVersion: {
              type: Sequelize.INTEGER,
              defaultValue: 0,
              allowNull: false,
            },
            createdAt: {
              allowNull: false,
              type: Sequelize.DATE,
            },
            updatedAt: {
              allowNull: false,
              type: Sequelize.DATE,
            },
          },
          { transaction }
        );
        console.log(`✅ Tabela 'Logins' criada no schema: ${schema}`);
      }
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      for (const schema of schemas) {
        if (!schema) continue;
        await queryInterface.dropTable(
          { tableName: "Logins", schema },
          { transaction }
        );
      }
      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  },
};