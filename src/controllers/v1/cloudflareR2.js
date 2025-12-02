/**
 * Enoch Engine API
 * Copyright (c) 2025 João Carlos Chavatte (DevChavatte)
 *
 * This source code is licensed under the MIT License found in the
 * LICENSE file in the root directory of this source tree.
 */

import logger from "../../utils/logger.js";
import {
  listFilesFromR2,
  uploadFileToR2,
  deleteFileFromR2,
} from "../../services/r2Services.js";
import envConfig from "../../config/envConfig.js";
import { BadRequestError } from "../../utils/customErrors.js";
import catchAsync from "../../utils/catchAsync.js";

export const listR2Files = catchAsync(async (req, res, next) => {
  const currentPrefix = req.query.folder || "";

  logger.info(
    `[Cloudflare Controller] Requisição para listar arquivos R2 da pasta: '${currentPrefix}'`
  );

  const r2Response = await listFilesFromR2(currentPrefix);
  const files = (r2Response.Contents || []).map((file) => ({
    key: file.Key,
    size: file.Size,
    lastModified: file.LastModified,
    url: `${envConfig.cloudflare.r2.publicUrl}/${file.Key}`,
    type: "file",
  }));

  const folders = (r2Response.CommonPrefixes || []).map((folder) => ({
    prefix: folder.Prefix,
    name: folder.Prefix.replace(currentPrefix, "").replace(/\/$/, ""),
    type: "folder",
  }));

  res.status(200).send({
    currentPrefix: currentPrefix,
    folders: folders,
    files: files,
  });
});

export const uploadR2File = catchAsync(async (req, res, next) => {
  const targetPath = req.body.path || "";
  const file = req.file;

  logger.info(
    `[Cloudflare Controller] Recebido upload para path: '${targetPath}'`
  );

  if (!file) {
    throw new BadRequestError("Nenhum arquivo enviado.");
  }

  const publicUrl = await uploadFileToR2(file, targetPath);

  res
    .status(201)
    .send({ message: "Arquivo enviado com sucesso!", url: publicUrl });
});

export const deleteR2File = catchAsync(async (req, res, next) => {
  const fileKey = req.body.key;

  logger.info(
    `[Cloudflare Controller] Recebida requisição para deletar key: '${fileKey}'`
  );

  if (!fileKey) {
    throw new BadRequestError(
      "Nenhuma chave de arquivo fornecida para exclusão."
    );
  }

  await deleteFileFromR2(fileKey);
  res
    .status(200)
    .send({ message: `Arquivo '${fileKey}' deletado com sucesso.` });
});
