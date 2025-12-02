import swaggerDefinition from "swagger-jsdoc";
import yaml from "js-yaml";
import fs from "fs";
import path from "path";

const loadYaml = (fileName) => {
  const filePath = path.join(process.cwd(), "src", "spec", fileName);
  try {
    return yaml.load(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.warn(`Aviso: Não foi possível carregar ${fileName}.`, error.message);
    return { paths: {}, components: { schemas: {} } };
  }
};

const loginYaml = loadYaml("login.yaml");
const cloudflareR2Yaml = loadYaml("cloudflareR2.yaml");
const contactYaml = loadYaml("contact.yaml");

const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "ENOCH ENGINE API API",
      version: "1.0.0",
      description: `
**Documentação Oficial do Boilerplate.**

Esta API fornece a estrutura base para autenticação segura, upload de arquivos e envio de contatos.
Utilize os endpoints abaixo para integrar com o frontend.

**Autenticação:**
Para rotas protegidas (cadeado), faça login em \`/api-docs/login\`, copie o token e use o botão **Authorize**.
      `,
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor de Desenvolvimento",
      },
    ],
    paths: {
      ...loginYaml.paths,
      ...cloudflareR2Yaml.paths,
      ...contactYaml.paths,
    },
    components: {
      schemas: {
        ...loginYaml.components.schemas,
        ...cloudflareR2Yaml.components.schemas,
        ...contactYaml.components.schemas,
      },
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Insira o token JWT no formato 'Bearer {token}'",
        },
      },
    },
    tags: [
      {
        name: "Login",
        description: "Autenticação (Registro, Login, Senha)",
      },
      {
        name: "CloudflareR2",
        description: "Upload e Gerenciamento de Arquivos",
      },
      {
        name: "Contato",
        description: "Envio de formulários de contato",
      },
    ],
  },
  apis: [], 
};

const openapiSpecification = swaggerDefinition(options);

export default openapiSpecification;
