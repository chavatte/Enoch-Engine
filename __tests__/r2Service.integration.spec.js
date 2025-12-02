import { describe, it, expect, beforeAll, vi } from "vitest";
import request from "supertest";
import path from "path";
import fs from "fs";
import bcrypt from "bcrypt";
import app from "../server.js";
import envConfig from "../src/config/envConfig.js";
import { dbLogin } from "../src/config/database/index.js";

vi.mock("../src/services/r2Services.js", () => ({
  uploadFileToR2: vi.fn(),
}));
import { uploadFileToR2 } from "../src/services/r2Services.js";

const { login: Login } = dbLogin;

let authToken;

const testUser = {
  email: `r2-test-${Date.now()}@example.com`,
  password: "Password123!",
};

const testFilesDir = path.resolve(__dirname, "test-files");
const imagePath = path.join(testFilesDir, "test-image-r2.png");

beforeAll(async () => {
  if (!testUser.email || !testUser.password) {
    throw new Error("As variáveis de ambiente de teste não estão definidas.");
  }

  const hashedPassword = await bcrypt.hash(
    testUser.password,
    envConfig.bcrypt.saltRounds
  );

  await Login.findOrCreate({
    where: { email: testUser.email },
    defaults: {
      email: testUser.email,
      password: hashedPassword,
      tokenVersion: 0,
    },
  });

  const loginResponse = await request(app)
    .post("/api/v1/auth/login")
    .send(testUser);

  expect(loginResponse.statusCode).toBe(
    200,
    "O login para obter o token de teste falhou."
  );
  authToken = loginResponse.body.token;

  if (!fs.existsSync(testFilesDir)) fs.mkdirSync(testFilesDir);
  const pngBuffer = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=",
    "base64"
  );
  fs.writeFileSync(imagePath, pngBuffer);
});

describe("Tratamento de Erros de Serviços Externos (500)", () => {
  it("deve retornar 500 Internal Server Error se o serviço R2 falhar durante o upload", async () => {
    uploadFileToR2.mockImplementation(() => {
      throw new Error("Simulação de falha de conexão com o R2");
    });
    const response = await request(app)
      .post("/api/v1/cloudflare/upload")
      .set("Authorization", `Bearer ${authToken}`)
      .attach("r2file", imagePath);

    expect(response.statusCode).toBe(500);
    if (process.env.NODE_ENV === "production") {
      expect(response.body.message).toBe("Erro inesperado no servidor.");
    } else {
      expect(response.body.message).toContain(
        "Simulação de falha de conexão com o R2"
      );
    }
  });
});
