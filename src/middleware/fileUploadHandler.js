import fs from "fs/promises";
import { fileTypeFromBuffer, fileTypeFromFile } from "file-type";
import { uploadFileToR2 } from "../services/r2Services.js";
import { BadRequestError } from "../utils/customErrors.js";
import logger from "../utils/logger.js";

const isValidUrl = (urlString) => {
  try {
    new URL(urlString);
    return true;
  } catch (e) {
    return false;
  }
};

const validateFileType = async (file, allowedTypes) => {
  let fileType;

  if (file.buffer) {
    fileType = await fileTypeFromBuffer(file.buffer);
  } else if (file.path) {
    fileType = await fileTypeFromFile(file.path);
  }
  const detectedMime = fileType?.mime || file.mimetype;

  if (!allowedTypes.includes(detectedMime)) {
    const errorMsg = `Tipo de arquivo inválido para o campo ${
      file.fieldname
    }. Permitidos: ${allowedTypes.join(", ")}. Detectado: ${detectedMime}`;

    logger.warn(`[FileUploadHandler] ${errorMsg}`);
    throw new BadRequestError(errorMsg);
  }
};

export const processFiles = (fileConfig) => async (req, res, next) => {
  req.processedFiles = {};
  const filesCleanupQueue = [];

  try {
    for (const fieldName in fileConfig) {
      const config = fileConfig[fieldName];
      const uploadedFile = req.files?.[fieldName]?.[0];
      const existingUrl =
        req.body[
          `existing${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}Url`
        ];

      let finalUrl = undefined;

      if (uploadedFile) {
        if (uploadedFile.path) {
          filesCleanupQueue.push(uploadedFile.path);
        }

        await validateFileType(uploadedFile, config.allowedTypes);
        finalUrl = await uploadFileToR2(uploadedFile, config.path);
        logger.info(
          `[FileUploadHandler] Upload para o campo ${fieldName} bem-sucedido. URL: ${finalUrl}`
        );
      } else if (existingUrl !== undefined) {
        if (
          existingUrl &&
          typeof existingUrl === "string" &&
          isValidUrl(existingUrl)
        ) {
          finalUrl = existingUrl.trim();
        } else if (
          existingUrl === null ||
          (typeof existingUrl === "string" && existingUrl.trim() === "")
        ) {
          finalUrl = null;
        } else {
          throw new BadRequestError(
            `A URL existente fornecida para o campo '${fieldName}' é inválida.`
          );
        }
      }
      if (finalUrl !== undefined) {
        req.processedFiles[config.urlField] = finalUrl;
      }
    }
    next();
  } catch (error) {
    next(error);
  } finally {
    for (const path of filesCleanupQueue) {
      try {
        await fs.unlink(path);
      } catch (err) {
        logger.warn(`Falha ao remover arquivo temporário ${path}:`, err);
      }
    }
  }
};
