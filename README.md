<pre style="font-size: 0.5rem;">

                              \\\\\\
                           \\\\\\\\\\\\
                          \\\\\\\\\\\\\\\
-------------,-|           |C>   // )\\\\|    .o88b. db   db  .d8b.  db    db  .d8b.  d888888b d888888b d88888b
           ,','|          /    || ,'/////|   d8P  Y8 88   88 d8' '8b 88    88 d8' '8b '~~88~~' '~~88~~' 88'  
---------,','  |         (,    ||   /////    8P      88ooo88 88ooo88 Y8    8P 88ooo88    88       88    88ooooo 
         ||    |          \\  ||||//''''|    8b      88~~~88 88~~~88 '8b  d8' 88~~~88    88       88    88~~~~~ 
         ||    |           |||||||     _|    Y8b  d8 88   88 88   88  '8bd8'  88   88    88       88    88.   
         ||    |______      ''''\____/ \      'Y88P' YP   YP YP   YP    YP    YP   YP    YP       YP    Y88888P
         ||    |     ,|         _/_____/ \
         ||  ,'    ,' |        /          |                 ___________________________________________
         ||,'    ,'   |       |         \  |              / \                                           \ 
_________|/    ,'     |      /           | |             |  |                                            | 
_____________,'      ,',_____|      |    | |              \ |      chavatte@duck.com                     | 
             |     ,','      |      |    | |                |                       chavatte.vercel.app  | 
             |   ,','    ____|_____/    /  |                |    ________________________________________|___
             | ,','  __/ |             /   |                |  /                                            /
_____________|','   ///_/-------------/   |                 \_/____________________________________________/ 
              |===========,'                                                                                  
			  

</pre>

<div align="center">

# ENOCH ENGINE API
### The Arcane Node.js Foundation

**Robust. Secure. Ready for the Unknown.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-v20+-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

[🇧🇷 Português](#portuguese) | [🇺🇸 English](#english)

</div>

---

## <a id="portuguese"></a>🇧🇷 Português (Brasil)

**Enoch Engine** é uma base sólida (boilerplate) para construção de APIs Node.js escaláveis, seguras e prontas para produção ("Production-Grade"). Ele abstrai a complexidade da configuração inicial, entregando uma arquitetura limpa, segura e resiliente desde o primeiro dia.

### ✨ Funcionalidades Inclusas

* **🔐 Autenticação Blindada:** Sistema completo com Login, Registro e **Token Versioning** (invalidação real de tokens JWT ao trocar senha/logout).
* **🛡️ Segurança Avançada:** Configurado com `Helmet`, `CORS` restritivo, `Rate Limiting`, Sanitização contra XSS e proteção HPP.
* **🔑 Segredos Criptografados:** Integração nativa com **Dotenvx**. Suas variáveis de ambiente são criptografadas e seguras, mesmo no repositório.
* **🗄️ Banco de Dados Multi-Schema:** Arquitetura PostgreSQL + Sequelize configurada para isolamento total entre Produção, Desenvolvimento, Testes e Backup.
* **☁️ Uploads via Stream:** Suporte a upload de arquivos para **Cloudflare R2** (compatível com S3) utilizando `DiskStorage` temporário e Streams, prevenindo estouro de memória RAM.
* **📧 Serviço de Email:** Configuração pronta com **Nodemailer** (Gmail/SMTP) e templates HTML responsivos.
* **🤖 Resiliência:** Implementação de **Graceful Shutdown** (encerramento gracioso de conexões) e tratamento de erros centralizado (`AsyncCatch`).
* **🧪 Testes Automatizados:** Pipeline configurado com **Vitest**, Supertest e Interface Gráfica (UI) para debug.
* **🐳 DevOps:** Dockerfile otimizado, Docker Compose para ambiente completo, Scripts de Ajuda Interativos (`yarn usage`) e Hooks do Git (Husky).

### 🛠️ Como Usar

1.  **Clone o repositório** (ou use como template).
2.  **Instale as dependências:**
    ```bash
    yarn install
    ```
3.  **Configuração de Ambiente:**
    * Copie `.env.example` para `.env`.
    * Preencha com seus dados reais.
    * *(Opcional)* Para criptografia, veja a seção **Dotenvx** abaixo.
4.  **Banco de Dados:**
    ```bash
    yarn db:migrate
    ```
5.  **Rodar:**
    ```bash
    yarn dev
    ```

### 📜 Scripts Disponíveis (Centro de Ajuda)

Este projeto inclui uma CLI interna para facilitar o uso.

```bash
# Lista todos os comandos
yarn usage

# Detalhes de um comando específico
yarn usage db:migrate
```

**Principais Comandos:**

* `yarn dev`: Servidor de desenvolvimento (logs coloridos, restart automático).
* `yarn start`: Servidor de produção (otimizado).
* `yarn test`: Roda todos os testes (Headless).
* `yarn test:ui`: Abre o painel interativo do Vitest no navegador.
* `yarn db:migrate`: Aplica migrações pendentes.

### 🐳 Docker (Recomendado)

A maneira mais simples de rodar a aplicação completa (API + Banco de Dados) é utilizando o  **Docker Compose** .

1. **Subir o ambiente:**
   **Bash**

   ```
   docker-compose up -d
   ```
2. **Acompanhar Logs:**
   **Bash**

   ```
   docker-compose logs -f app
   ```
3. **Rodar Migrações (Banco):**
   Como o banco roda dentro do Docker, execute as migrações através do container da API:
   **Bash**

   ```
   docker-compose exec app yarn db:migrate
   ```
4. **Acessar Banco de Dados (Interface Visual):**
   Acesse **http://localhost:8080** para abrir o  **Adminer** .

   * **Sistema:** PostgreSQL
   * **Servidor:** `db`
   * **Usuário:** `postgres`
   * **Senha:** `postgres`
   * **Banco:** `enoch_db`
5. **Parar tudo:**
   **Bash**

   ```
   docker-compose down
   ```

#### Build Manual (Opcional)

Se desejar construir e rodar apenas a imagem da API isoladamente:

**Bash**

```
docker build -t enoch-engine .
docker run -p 3000:3000 --env-file .env enoch-engine
```

*Debug:* `docker run -it --rm --entrypoint sh enoch-engine`

### 🔐 Gerenciamento de Segredos (Dotenvx)

Utilizamos [@dotenvx/dotenvx](https://dotenvx.com/) para garantir que segredos nunca fiquem em texto plano.

* **Criptografar seu .env:**
  **Bash**

  ```
  npx dotenvx encrypt
  ```
* **Rodar em Produção:**
  Defina a variável `DOTENV_PRIVATE_KEY` no seu servidor (Fly.io, AWS, etc) com a chave gerada no seu arquivo `.env.keys`.

### 📧 Serviço de Email

O sistema de e-mail está configurado em `src/controllers/v1/contactController.js`.

**Configuração (.env):**

**Ini, TOML**

```
GMAIL_USER=seu_email@gmail.com
GMAIL_APP_PASSWORD=senha_de_app_gerada
EMAIL_TO_ADMIN=admin@empresa.com
```

*Nota: Para Gmail, gere uma "Senha de App" nas configurações de segurança do Google.*

### 📂 Estrutura

* `src/controllers`: Lógica de negócio (v1).
* `src/models`: Definições do banco de dados (Sequelize).
* `src/middleware`: Proteções (Auth, Upload, Turnstile).
* `src/utils`: Ferramentas globais (Logger, ErrorHandler, Shutdown).
* `src/config`: Configurações centrais (Env, DB, Mailer).

---

## <a id="english"></a>🇺🇸 English

**Enoch Engine** is a solid foundation (boilerplate) for building scalable, secure, and production-grade Node.js APIs. It abstracts initial setup complexity, delivering a clean, secure, and resilient architecture from day one.

### ✨ Features Included

* **🔐 Armored Authentication:** Complete system with Login, Register, and **Token Versioning** (real JWT invalidation on password change/logout).
* **🛡️ Advanced Security:** Configured with `Helmet`, restrictive `CORS`, `Rate Limiting`, XSS Sanitization, and HPP protection.
* **🔑 Encrypted Secrets:** Native integration with  **Dotenvx** . Environment variables are encrypted and secure, even within the repository.
* **🗄️ Multi-Schema Database:** PostgreSQL + Sequelize architecture configured for total isolation between Production, Development, Testing, and Backup.
* **☁️ Stream Uploads:** File upload support for **Cloudflare R2** (S3 compatible) using temporary `DiskStorage` and Streams, preventing RAM overflow.
* **📧 Email Service:** Ready-to-use configuration with **Nodemailer** (Gmail/SMTP) and responsive HTML templates.
* **🤖 Resilience:** Implementation of **Graceful Shutdown** and centralized error handling (`AsyncCatch`).
* **🧪 Automated Testing:** Pipeline configured with  **Vitest** , Supertest, and Interactive UI for debugging.
* **🐳 DevOps:** Optimized Dockerfile, Docker Compose for full environment, Interactive Help Scripts (`yarn usage`), and Git Hooks (Husky).

### 🛠️ How to Use

1. **Clone the repository** (or use as a template).
2. **Install dependencies:**
   **Bash**

   ```
   yarn install
   ```
3. **Environment Setup:**

   * Copy `.env.example` to `.env`.
   * Fill in with real data.
   * *(Optional)* For encryption, see the **Dotenvx** section below.
4. **Database:**
   **Bash**

   ```
   yarn db:migrate
   ```
5. **Run:**
   **Bash**

   ```
   yarn dev
   ```

### 📜 Available Scripts (Help Center)

This project includes an internal CLI tool to ease usage.

**Bash**

```
# List all commands
yarn usage

# Details for a specific command
yarn usage db:migrate
```

**Key Commands:**

* `yarn dev`: Development server (colored logs, auto-restart).
* `yarn start`: Production server (optimized).
* `yarn test`: Run all tests (Headless).
* `yarn test:ui`: Open Vitest interactive UI in the browser.
* `yarn db:migrate`: Apply pending migrations.

### 🐳 Docker (Recommended)

The easiest way to run the full stack (API + Database) is using  **Docker Compose** .

1. **Start Environment:**
   **Bash**

   ```
   docker-compose up -d
   ```
2. **Follow Logs:**
   **Bash**

   ```
   docker-compose logs -f app
   ```
3. **Run Migrations (Database):**
   Since the DB runs inside Docker, execute migrations via the API container:
   **Bash**

   ```
   docker-compose exec app yarn db:migrate
   ```
4. **Access Database (GUI):**
   Go to **http://localhost:8080** to open  **Adminer** .

   * **System:** PostgreSQL
   * **Server:** `db`
   * **User:** `postgres`
   * **Password:** `postgres`
   * **Database:** `enoch_db`
5. **Stop All:**
   **Bash**

   ```
   docker-compose down
   ```

#### Manual Build (Optional)

If you wish to build and run only the API image:

**Bash**

```
docker build -t enoch-engine .
docker run -p 3000:3000 --env-file .env enoch-engine
```

*Debug:* `docker run -it --rm --entrypoint sh enoch-engine`

### 🔐 Secrets Management (Dotenvx)

We use [@dotenvx/dotenvx](https://dotenvx.com/) to ensure secrets are never committed in plain text.

* **Encrypt your .env:**
  **Bash**

  ```
  npx dotenvx encrypt
  ```
* **Run in Production:**
  Set the `DOTENV_PRIVATE_KEY` environment variable on your server (Fly.io, AWS, etc.) using the key generated in your `.env.keys` file.

### 📧 Email Service

The email system is configured in `src/controllers/v1/contactController.js`.

**Configuration (.env):**

**Ini, TOML**

```
GMAIL_USER=your_email@gmail.com
GMAIL_APP_PASSWORD=generated_app_password
EMAIL_TO_ADMIN=admin@company.com
```

*Note: For Gmail, generate an "App Password" in Google Security settings.*

### 📂 Structure

* `src/controllers`: Business logic (v1).
* `src/models`: Database definitions (Sequelize).
* `src/middleware`: Protections (Auth, Upload, Turnstile).
* `src/utils`: Global tools (Logger, ErrorHandler, Shutdown).
* `src/config`: Central configurations (Env, DB, Mailer).

---

<div align="center">

**Created by [DevChavatte] - João Carlos Chavatte**

</div>
