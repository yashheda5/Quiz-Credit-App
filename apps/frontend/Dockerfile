
FROM node:22-bookworm-slim AS builder

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/frontend/package.json ./apps/frontend/package.json

RUN pnpm install --frozen-lockfile --filter frontend...

COPY apps/frontend ./apps/frontend

WORKDIR /app/apps/frontend

ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL

RUN pnpm build

FROM nginx:alpine AS runner

COPY apps/frontend/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/apps/frontend/dist /usr/share/nginx/html

EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
