import express from "express";
import rateLimit from "express-rate-limit";
import auth from "../../middleware/auth.js";
import { verifyTurnstile } from "../../middleware/turnstileValidator.js";
import { register, login, updatePassword } from "../../controllers/v1/login.js";
import envConfig from "../../config/envConfig.js";

const loginRouter = express.Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    message:
      "Muitas tentativas de autenticação a partir deste IP, por favor tente novamente após 15 minutos.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const limiter =
  envConfig.nodeEnv === "test" ? (req, res, next) => next() : authLimiter;

loginRouter.post("/register", limiter, register);
loginRouter.post("/login", limiter, verifyTurnstile, login);
loginRouter.put("/password", limiter, auth, updatePassword);

export default loginRouter;
