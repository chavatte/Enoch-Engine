/**
 * Enoch Engine API
 * Copyright (c) 2025 João Carlos Chavatte (DevChavatte)
 *
 * This source code is licensed under the MIT License found in the
 * LICENSE file in the root directory of this source tree.
 */

import "@dotenvx/dotenvx/config";

const requiredEnvVars = [
  "NODE_ENV",
  "CORS_ALLOWED_ORIGINS",
  "HOST_DB",
  "PORT_DB",
  "USER_DB",
  "PASSWORD_DB",
  "DB",
  "DIALECT_DB",
  "SCHEMA_DB",
  "SCHEMA_DB_BACKUP",
  "SCHEMA_DB_DEV",
  "SCHEMA_DB_BACKUP_DEV",
  "JWT_EXPIRES_IN",
  "JWT_SECRET",
  "BCRYPT_SALT_ROUNDS",
  "CLOUDFLARE_ZONE_ID",
  "CLOUDFLARE_API_TOKEN",
  "CLOUDFLARE_R2_ENDPOINT",
  "CLOUDFLARE_ACCESS_KEY_ID",
  "CLOUDFLARE_SECRET_ACCESS_KEY",
  "CLOUDFLARE_R2_BUCKET_NAME",
  "CLOUDFLARE_R2_PUBLIC_URL",
  "TEST_USER_EMAIL",
  "TEST_USER_PASSWORD",
  "GMAIL_USER",
  "GMAIL_APP_PASSWORD",
  "EMAIL_TO_ADMIN",
  "TURNSTILE_SECRET_KEY",
];

requiredEnvVars.forEach((varName) => {
  if (process.env[varName] === undefined) {
    throw new Error(
      `Erro Crítico: A variável de ambiente "${varName}" não está definida.`
    );
  }
});

const envConfig = {
  nodeEnv: process.env.NODE_ENV,
  logLevel: process.env.LOG_LEVEL || "info",
  port: process.env.PORT || 3000,
  host: process.env.HOST || "0.0.0.0",

  cors: {
    allowedOrigins: process.env.CORS_ALLOWED_ORIGINS || "",
  },

  db: {
    host: process.env.HOST_DB,
    port: parseInt(process.env.PORT_DB, 10),
    user: process.env.USER_DB,
    password: process.env.PASSWORD_DB,
    database: process.env.DB,
    dialect: process.env.DIALECT_DB,
    schema:
      process.env.NODE_ENV === "production"
        ? process.env.SCHEMA_DB
        : process.env.SCHEMA_DB_DEV,
    schemaBackup:
      process.env.NODE_ENV === "production"
        ? process.env.SCHEMA_DB_BACKUP
        : process.env.SCHEMA_DB_BACKUP_DEV,
    schemaTest: process.env.SCHEMA_DB_TEST,

    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN,
  },

  bcrypt: {
    saltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS, 10),
  },

  cloudflare: {
    zoneId: process.env.CLOUDFLARE_ZONE_ID,
    apiToken: process.env.CLOUDFLARE_API_TOKEN,
    r2: {
      endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
      accessKeyId: process.env.CLOUDFLARE_ACCESS_KEY_ID,
      secretAccessKey: process.env.CLOUDFLARE_SECRET_ACCESS_KEY,
      bucketName: process.env.CLOUDFLARE_R2_BUCKET_NAME,
      publicUrl: process.env.CLOUDFLARE_R2_PUBLIC_URL,
      domainURL: process.env.CLOUDFLARE_R2_DOMAIN_URL,
      region: "auto",
    },
  },

  tests: {
    user: process.env.TEST_USER_EMAIL,
    password: process.env.TEST_USER_PASSWORD,
  },

  email: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
    adminEmail: process.env.EMAIL_TO_ADMIN,
  },

  security: {
    turnstileSecret: process.env.TURNSTILE_SECRET_KEY,
  },
};

export default envConfig;
