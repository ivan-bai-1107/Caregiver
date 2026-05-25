FROM node:22-alpine AS build

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

COPY client/package.json client/pnpm-lock.yaml client/pnpm-workspace.yaml ./client/
WORKDIR /app/client
RUN pnpm install --frozen-lockfile

WORKDIR /app
COPY client/ ./client/
COPY admin/ ./admin/

ARG VITE_API_BASE_URL=
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL}

WORKDIR /app/client
RUN pnpm build

FROM nginx:1.27-alpine

COPY client/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/client/dist /usr/share/nginx/html

EXPOSE 5173
