
FROM node:22-bookworm-slim AS builder

RUN corepack enable

WORKDIR /app

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/backend/package.json ./apps/backend/package.json

RUN pnpm install --frozen-lockfile --filter backend...

COPY apps/backend ./apps/backend

WORKDIR /app/apps/backend

# Placeholder URL used only while generating Prisma Client
RUN DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder" \
    pnpm exec prisma generate
    
RUN pnpm build

FROM node:22-bookworm-slim AS runner

RUN corepack enable

WORKDIR /app

COPY --from=builder /app /app

WORKDIR /app/apps/backend

ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

CMD ["node", "dist/server.js"]
