import express from "express";
import logger from "../utils/logger.js";

const blackholeRouter = express.Router();

const blackholeTargets = [
  "/backup.sql",
  "/dump.tar.gz",
  "/database.sqlite",
  "/source_code.zip",
];

blackholeRouter.get(blackholeTargets, (req, res) => {
  const attackerIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
  logger.warn(
    `[SEC_OPS] 🕳️ BURACO NEGRO ACIONADO! O IP: ${attackerIp} tentou baixar um backup.`,
  );

  res.writeHead(200, {
    "Content-Type": "application/octet-stream",
    "Content-Disposition": 'attachment; filename="core_dump.bin"',
    Server: "Enoch Engine Data Sink",
  });

  const junkData = "0x666--> Enoch Engine Security <--".repeat(1000) + "\n";

  const drownAttacker = setInterval(() => {
    res.write(junkData);
  }, 100);

  req.on("close", () => {
    clearInterval(drownAttacker);
    logger.info(
      `[SEC_OPS] 🛑 IP: ${attackerIp} desconectou. O scanner não aguentou o abismo.`,
    );
  });
});

export default blackholeRouter;
