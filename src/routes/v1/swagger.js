import express from "express";
import swaggerUi from "swagger-ui-express";
import swaggerDocument from "../../config/swagger/index.js";

const swaggerRouter = express.Router();

swaggerRouter.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export default swaggerRouter;