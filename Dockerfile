ARG NODE_VERSION=20
FROM node:${NODE_VERSION}-slim as base

LABEL fly_launch_runtime="Node.js"

WORKDIR /app

ENV NODE_ENV=production

FROM base as build

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y build-essential node-gyp pkg-config python-is-python3

    COPY --link package.json yarn.lock ./

RUN yarn install --frozen-lockfile

FROM base as production-deps

COPY --link package.json yarn.lock ./

RUN yarn install --frozen-lockfile --production

FROM base

COPY --from=production-deps /app/node_modules /app/node_modules

COPY --link . .

USER node

EXPOSE 3000

CMD [ "node", "src/server.js" ]