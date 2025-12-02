import jwt from "jsonwebtoken";
import envConfig from "../config/envConfig.js";
import { UnauthorizedError, ForbiddenError } from "../utils/customErrors.js";
import { db } from "../config/database/index.js";

const secretJWT = envConfig.jwt.secret;

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new UnauthorizedError("Token não fornecido."));
  }

  try {
    const decoded = jwt.verify(token, secretJWT);
    const user = await db.login.findByPk(decoded.loginId);

    if (!user) {
      return next(new UnauthorizedError("Usuário não encontrado."));
    }
    if (decoded.tokenVersion !== user.tokenVersion) {
      return next(
        new UnauthorizedError("Sessão inválida. Faça login novamente.")
      );
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return next(new ForbiddenError("Token expirado."));
    }
    return next(new ForbiddenError("Token inválido."));
  }
};

export default authMiddleware;
