import { describe, it, expect, beforeAll } from "vitest";
import request from "supertest";
import app from "../server.js";
import { dbLogin } from "../src/config/database/index.js";

const { login: Login } = dbLogin;

const testUser = {
  email: `testuser-${Date.now()}@example.com`,
  password: "Password123!",
};

let authToken;

describe("API de Autenticação - Testes de Ciclo de Vida", () => {
  beforeAll(async () => {
    await Login.destroy({ where: { email: testUser.email } });
  });

  it("deve registrar um novo usuário com sucesso (POST /register)", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(testUser);

    expect(response.statusCode).toBe(201);
    expect(response.body.user).toHaveProperty("id");
    expect(response.body.user.email).toBe(testUser.email);
  });

  it("deve retornar 400 Bad Request ao tentar registrar com um email já existente", async () => {
    const response = await request(app)
      .post("/api/v1/auth/register")
      .send(testUser);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toBe("Este email já está em uso.");
  });

  it("deve retornar 401 Unauthorized ao tentar fazer login com uma senha incorreta", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: testUser.email, password: "wrongpassword" });

    expect(response.statusCode).toBe(401);
    expect(response.body.message).toBe("Credenciais inválidas.");
  });

  it("deve fazer login com sucesso e retornar um token JWT", async () => {
    const response = await request(app)
      .post("/api/v1/auth/login")
      .send(testUser);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body.email).toBe(testUser.email);

    authToken = response.body.token;
  });

  describe("PUT /api/v1/auth/password", () => {
    const newPassword = "NewPassword456!";

    it("deve retornar 401 Unauthorized ao tentar alterar a senha sem token", async () => {
      const response = await request(app).put("/api/v1/auth/password").send({
        currentPassword: testUser.password,
        newPassword: newPassword,
      });

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe("Token não fornecido.");
    });

    it("deve retornar 401 Unauthorized ao tentar alterar com a senha atual incorreta", async () => {
      const response = await request(app)
        .put("/api/v1/auth/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          currentPassword: "wrongpassword",
          newPassword: newPassword,
        });

      expect(response.statusCode).toBe(401);
      expect(response.body.message).toBe("A senha atual está incorreta.");
    });

    it("deve retornar 400 Bad Request ao tentar alterar para uma senha nova fraca", async () => {
      const response = await request(app)
        .put("/api/v1/auth/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: "123",
        });

      expect(response.statusCode).toBe(400);
      expect(response.body.message).toContain("A senha deve ter pelo menos");
    });

    it("deve alterar a senha com sucesso com dados válidos", async () => {
      const response = await request(app)
        .put("/api/v1/auth/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: newPassword,
        });

      expect(response.statusCode).toBe(200);
      expect(response.body.message).toBe(
        "Senha atualizada. Todos os outros dispositivos foram desconectados."
      );

      testUser.password = newPassword;
    });

    it("deve rejeitar o token antigo após a alteração de senha (Token Versioning)", async () => {
      const response = await request(app)
        .put("/api/v1/auth/password")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: "AnotherPass123!",
        });
      expect(response.statusCode).toBe(401);
    });

    it("deve ser capaz de fazer login com a nova senha", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: testUser.email,
        password: testUser.password,
      });

      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("token");
      authToken = response.body.token;
    });
  });
});
