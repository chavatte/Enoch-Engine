import { Sequelize } from "sequelize";
import dbConfig from "./dbConfig.js";
import loginModel from "../../models/login.js";
import envConfig from "../envConfig.js";

const schema =
  envConfig.nodeEnv === "test" ? dbConfig.SCHEMA_TEST : dbConfig.SCHEMA;

const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.DIALECT,
  schema: schema,
  operatorsAliases: false,
  pool: dbConfig.POOL,
  logging: false,
});

const db = {
  Sequelize,
  sequelize,
  login: loginModel(sequelize, Sequelize),
};

export { db };
export const dbLogin = db;
