import nodemailer from "nodemailer";
import envConfig from "./envConfig.js";
import logger from "../utils/logger.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: envConfig.email.user,
    pass: envConfig.email.pass,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

transporter
  .verify()
  .then(() => {
    logger.info("[Mailer] Serviço de email pronto para envio.");
  })
  .catch((error) => {
    logger.warn(
      "[Mailer] Aviso: Não foi possível conectar ao serviço de email.",
      error.message
    );
  });

export default transporter;
