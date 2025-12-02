import { describe, it, expect, vi, beforeEach } from "vitest";
import request from "supertest";
import app from "../server.js";

const { mockSendMail } = vi.hoisted(() => {
  return {
    mockSendMail: vi.fn(),
  };
});

vi.mock("../src/config/mailer.js", () => ({
  default: {
    sendMail: mockSendMail,
    verify: vi.fn().mockResolvedValue(true),
  },
}));

const validPayload = {
  name: "Test User",
  email: "test@example.com",
  subject: "Integration Test",
  message: "This is a test message from Vitest.",
};

const invalidPayload = {
  email: "test@example.com",
};

describe("API de Contato - POST /api/v1/contact", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSendMail.mockResolvedValue(true);
  });

  it("deve enviar e-mail com sucesso e retornar 200 OK", async () => {
    const response = await request(app)
      .post("/api/v1/contact")
      .send(validPayload);

    expect(response.statusCode).toBe(200);
    expect(response.body.message).toContain("enviada");
    expect(mockSendMail).toHaveBeenCalledTimes(2);

    const calls = mockSendMail.mock.calls;
    const sentToUser = calls.some((call) => call[0].to === validPayload.email);
    expect(sentToUser).toBeTruthy();
  });

  it("deve retornar 400 Bad Request se campos obrigatórios estiverem faltando", async () => {
    const response = await request(app)
      .post("/api/v1/contact")
      .send(invalidPayload);

    expect(response.statusCode).toBe(400);
    expect(response.body.message).toContain("obrigatórios");
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it("deve retornar 500 Internal Server Error se o Gmail falhar", async () => {
    mockSendMail.mockRejectedValue(new Error("Gmail Connection Error"));

    const response = await request(app)
      .post("/api/v1/contact")
      .send(validPayload);

    expect(response.statusCode).toBe(500);
    expect(mockSendMail).toHaveBeenCalled();
  });

  const honeypotPayload = {
    name: "Honeypot User",
    email: "honeypot@vitest.com",
    subject: "Honeypot Test",
    message: "This should be blocked by the honeypot.",
    _honey: "preenchido",
    cf_turnstile_response: "token-de-teste-valido",
  };

  it("deve retornar 200 OK, mas bloquear o envio de email se o Honeypot for preenchido", async () => {
    const response = await request(app)
      .post("/api/v1/contact")
      .send(honeypotPayload);

    expect(response.body.message).toBe("Email enviado com sucesso!");
    expect(mockSendMail).not.toHaveBeenCalled();
  });

  it("deve sanitizar o payload XSS (remover tags perigosas) antes do envio", async () => {
    const xssPayload = {
      name: "XSS Injector <script>alert('XSS')</script>",
      email: "xss@hacker.com",
      subject: "XSS Test",
      message: "Ataque: <img src=x onerror=alert('ImageXSS')>",
      cf_turnstile_response: "token-de-teste-valido",
    };

    await request(app).post("/api/v1/contact").send(xssPayload);
    const [firstCallArgs] = mockSendMail.mock.calls[0];
    const emailBody = firstCallArgs.html;
    expect(emailBody).not.toContain("<script>");
    expect(emailBody).not.toContain("onerror");
    expect(emailBody).not.toContain("alert('ImageXSS')");
    expect(emailBody).toContain("&lt;script&gt;alert('XSS')&lt;/script&gt;");
  });
});
