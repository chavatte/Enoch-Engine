/**
 * Enoch Engine API
 * Copyright (c) 2025 João Carlos Chavatte (DevChavatte)
 *
 * This source code is licensed under the MIT License found in the
 * LICENSE file in the root directory of this source tree.
 */

import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { dbLogin } from "../../config/database/index.js";
import envConfig from "../../config/envConfig.js";
import {
  BadRequestError,
  UnauthorizedError,
  NotFoundError,
} from "../../utils/customErrors.js";
import backupObserver from "../../utils/backupObserver.js";
import catchAsync from "../../utils/catchAsync.js";

const { login: Login } = dbLogin;

const { secret: secretJWT, expiresIn: jwtExpiresIn } = envConfig.jwt;
const { saltRounds } = envConfig.bcrypt;

function validatePasswordStrength(password) {
  if (!password) {
    throw new BadRequestError("A senha é obrigatória.");
  }

  const minLength = 8;
  const errors = [];

  if (password.length < minLength)
    errors.push(`A senha deve ter pelo menos ${minLength} caracteres.`);
  if (!/[a-z]/.test(password))
    errors.push("A senha deve conter pelo menos uma letra minúscula.");
  if (!/[A-Z]/.test(password))
    errors.push("A senha deve conter pelo menos uma letra maiúscula.");
  if (!/[0-9]/.test(password))
    errors.push("A senha deve conter pelo menos um número.");
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password))
    errors.push(
      "A senha deve conter pelo menos um caractere especial (ex: !@#$%^&*)."
    );

  if (errors.length > 0) {
    throw new BadRequestError(errors[0]);
  }
}

export const register = catchAsync(async (req, res, next) => {
  const result = await dbLogin.sequelize.transaction(async (transaction) => {
    const { email, password: plainPassword } = req.body;

    if (!email || !plainPassword) {
      throw new BadRequestError("Email e senha são obrigatórios.");
    }

    validatePasswordStrength(plainPassword);

    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

    return await Login.create(
      {
        email: email,
        password: hashedPassword,
        tokenVersion: 0,
      },
      { transaction }
    );
  });
  backupObserver.emit("login:backup", "create", result.get({ plain: true }));

  res.status(201).send({
    message: "Usuário criado com sucesso!",
    user: { id: result.id, email: result.email },
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password: plainPassword } = req.body;

  if (!email || !plainPassword) {
    throw new BadRequestError("Email e senha são obrigatórios.");
  }

  const user = await Login.findOne({ where: { email: email } });
  const passwordCheck = user
    ? await bcrypt.compare(plainPassword, user.password)
    : false;

  if (!user || !passwordCheck) {
    throw new UnauthorizedError("Credenciais inválidas.");
  }

  const token = jwt.sign(
    {
      loginId: user.id,
      loginEmail: user.email,
      tokenVersion: user.tokenVersion,
    },
    secretJWT,
    { expiresIn: jwtExpiresIn }
  );

  res.status(200).send({
    message: "Login bem-sucedido",
    email: user.email,
    token,
  });
});

export const updatePassword = catchAsync(async (req, res, next) => {
  const userId = req.user.loginId;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    throw new BadRequestError("Senha atual e nova senha são obrigatórias.");
  }

  const result = await dbLogin.sequelize.transaction(async (transaction) => {
    const user = await Login.findByPk(userId, { transaction });
    if (!user) {
      throw new NotFoundError("Usuário não encontrado.");
    }

    const passwordCheck = await bcrypt.compare(currentPassword, user.password);
    if (!passwordCheck) {
      throw new UnauthorizedError("A senha atual está incorreta.");
    }

    validatePasswordStrength(newPassword);
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    return await user.update(
      {
        password: hashedPassword,
        tokenVersion: user.tokenVersion + 1,
      },
      { transaction }
    );
  });

  backupObserver.emit("login:backup", "update", result.get({ plain: true }));

  res.status(200).send({
    message:
      "Senha atualizada. Todos os outros dispositivos foram desconectados.",
  });
});
