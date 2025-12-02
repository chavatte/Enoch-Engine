import fs from "fs";
import {
  S3Client,
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import logger from "../utils/logger.js";
import envConfig from "../config/envConfig.js";

const r2Config = envConfig.cloudflare.r2;

const s3Client = new S3Client({
  region: r2Config.region,
  endpoint: r2Config.endpoint,
  credentials: {
    accessKeyId: r2Config.accessKeyId,
    secretAccessKey: r2Config.secretAccessKey,
  },
});

export async function uploadFileToR2(file, folderName = "uploads") {
  if (!file) {
    throw new Error("Nenhum arquivo fornecido para upload.");
  }

  const hasBuffer = file.buffer;
  const hasPath = file.path;

  if (!hasBuffer && !hasPath) {
    throw new Error("Arquivo inválido (sem buffer ou caminho).");
  }

  const baseFolder =
    folderName && !folderName.endsWith("/") ? `${folderName}/` : folderName;
  const keyInR2 = `${baseFolder}${file.originalname}`.replace(/^\//, "");

  logger.info(
    `[R2 Service] Enviando arquivo: ${file.originalname} para ${keyInR2}`
  );

  const fileBody = hasPath ? fs.createReadStream(file.path) : file.buffer;

  const putCommand = new PutObjectCommand({
    Bucket: r2Config.bucketName,
    Key: keyInR2,
    Body: fileBody,
    ContentType: file.mimetype,
  });

  try {
    const response = await s3Client.send(putCommand);
    logger.info("[R2 Service] Upload bem-sucedido:", response);

    const publicUrl = `${r2Config.publicUrl}/${keyInR2}`;
    return publicUrl;
  } catch (err) {
    logger.error("[R2 Service] Erro ao enviar para o R2:", err);
    throw new Error(`Falha no upload do arquivo para o R2: ${err.message}`);
  }
}

export async function listFilesFromR2(folderName = "") {
  if (!s3Client) {
    throw new Error(
      "Configuração do R2 está incompleta ou inválida para listar arquivos."
    );
  }

  const prefix =
    folderName && !folderName.endsWith("/") ? `${folderName}/` : folderName;

  const params = {
    Bucket: r2Config.bucketName,
    Prefix: prefix,
    Delimiter: "/",
  };

  logger.info(
    `[R2 Service] Listando arquivos com prefixo: '${params.Prefix}' e Delimiter: '${params.Delimiter}'`
  );

  try {
    const listCommand = new ListObjectsV2Command(params);
    const response = await s3Client.send(listCommand);
    logger.info(
      `[R2 Service] Listagem bem-sucedida. ${
        (response.KeyCount || 0) + (response.CommonPrefixes?.length || 0)
      } itens encontrados (arquivos + pastas).`
    );
    return response;
  } catch (err) {
    logger.error(
      `[R2 Service] Erro ao listar arquivos do R2 (prefixo: ${prefix}):`,
      err
    );
    throw new Error(`Falha ao listar arquivos do R2: ${err.message}`);
  }
}

export async function deleteFileFromR2(fileKey) {
  if (!fileKey) {
    throw new Error("Nenhuma chave de arquivo fornecida para exclusão.");
  }
  if (!s3Client) {
    throw new Error(
      "Configuração do R2 está incompleta ou inválida para exclusão."
    );
  }

  logger.info(
    `[R2 Service] Tentando deletar arquivo: Key='${fileKey}' do bucket ${r2Config.bucketName}`
  );

  const deleteCommand = new DeleteObjectCommand({
    Bucket: r2Config.bucketName,
    Key: fileKey,
  });

  try {
    const response = await s3Client.send(deleteCommand);
    logger.info(
      `[R2 Service] Arquivo '${fileKey}' deletado com sucesso:`,
      response
    );
    return response;
  } catch (err) {
    logger.error(
      `[R2 Service] Erro ao deletar arquivo '${fileKey}' do R2:`,
      err
    );
    if (err.name === "NoSuchKey") {
      logger.warn(
        `[R2 Service] Arquivo '${fileKey}' não encontrado para deleção.`
      );
      return {
        message: "Arquivo não encontrado, mas operação considerada concluída.",
      };
    }
    throw new Error(`Falha ao deletar o arquivo do R2: ${err.message}`);
  }
}
