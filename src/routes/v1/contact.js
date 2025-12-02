import express from "express";
import rateLimit from "express-rate-limit";
import { sendContactEmail } from "../../controllers/v1/contactController.js";
import { verifyTurnstile } from "../../middleware/turnstileValidator.js";
import { CorsOptions } from "../../security/corsConfig.js";
import cors from "cors";

const contactRouter = express.Router();

const emailLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    status: "error",
    message:
      "Muitas tentativas de contato. Por favor, tente novamente em 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

contactRouter.use(cors(CorsOptions));
contactRouter.post("/", emailLimiter, verifyTurnstile, sendContactEmail);

export default contactRouter;
