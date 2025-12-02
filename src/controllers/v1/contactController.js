/**
 * Enoch Engine API
 * Copyright (c) 2025 João Carlos Chavatte (DevChavatte)
 *
 * This source code is licensed under the MIT License found in the
 * LICENSE file in the root directory of this source tree.
 */

import xss from "xss";
import transporter from "../../config/mailer.js";
import envConfig from "../../config/envConfig.js";
import logger from "../../utils/logger.js";
import { BadRequestError } from "../../utils/customErrors.js";
import catchAsync from "../../utils/catchAsync.js";

const formatAdminEmailBody = (data) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #0056b3;">Nova Mensagem de Contato</h2>
      <hr />
      <p><strong>Nome:</strong> ${data.name}</p>
      <p><strong>Email:</strong> ${data.email}</p>
      <p><strong>Assunto:</strong> ${data.subject || "Sem assunto"}</p>
      <br />
      <h3>Mensagem:</h3>
      <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px;">
        <p style="white-space: pre-wrap;">${data.message}</p>
      </div>
      <hr />
      <p style="font-size: 12px; color: #888;">Enviado via ENOCH ENGINE API</p>
    </div>
  `;
};

const formatConfirmationEmailBody = (data) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
      <h2 style="color: #28a745;">Olá, ${data.name}! 👋</h2>
      <p>Recebemos sua mensagem com sucesso.</p>
      <p>Nossa equipe analisará seu contato e retornará o mais breve possível.</p>
      <hr />
      <p style="font-size: 14px; color: #555;">Cópia da sua mensagem:</p>
      <div style="background-color: #f9f9f9; padding: 10px; border-left: 4px solid #28a745; font-style: italic;">
        "${data.message}"
      </div>
      <br />
      <p>Atenciosamente,</p>
      <p><strong>Equipe de Suporte</strong></p>
      <br />
      <hr />
      <p style="font-size: 11px; color: #999; text-align: center; margin-top: 10px;">
        ⚠️ <strong>Aviso:</strong> Este é um e-mail automático de confirmação de recebimento. 
      </p>
    </div>
  `;
};

export const sendContactEmail = catchAsync(async (req, res, next) => {
  if (req.body._honey && req.body._honey.length > 0) {
    logger.warn(`[Honeypot] Bot detectado IP: ${req.ip}`);
    return res.status(200).json({ message: "Email enviado com sucesso!" });
  }

  const { name, email, message, subject } = req.body;

  if (!name || !email || !message) {
    throw new BadRequestError("Nome, email e mensagem são obrigatórios.");
  }

  const cleanName = xss(name);
  const cleanMessage = xss(message);
  const cleanSubject = xss(subject || "");

  const mailOptionsAdmin = {
    from: `"API Contact System" <${envConfig.email.user}>`,
    to: envConfig.email.adminEmail,
    replyTo: email,
    subject: `[Novo Contato] ${subject || name}`,
    html: formatAdminEmailBody({
      name: cleanName,
      email,
      message: cleanMessage,
      subject: cleanSubject,
    }),
  };

  const mailOptionsUser = {
    from: `"No-Reply" <${envConfig.email.user}>`,
    to: email,
    subject: `Recebemos seu contato: ${subject || "Obrigado!"}`,
    html: formatConfirmationEmailBody({
      name: cleanName,
      message: cleanMessage,
    }),
  };

  logger.info(
    `[Email Service] Iniciando envio de emails para: ${email} e Admin.`
  );

  await Promise.all([
    transporter.sendMail(mailOptionsAdmin),
    transporter.sendMail(mailOptionsUser),
  ]);

  logger.info(`[Email Service] Emails enviados com sucesso.`);

  res
    .status(200)
    .json({ message: "Mensagem enviada e confirmação disparada!" });
});
