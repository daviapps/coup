FROM node:22-alpine AS builder
WORKDIR /app

# 1. Build Skeleton
COPY package.json yarn.lock ./
COPY server/package.json ./server/
COPY shared/package.json ./shared/

RUN yarn install --frozen-lockfile

COPY server ./server
COPY shared ./shared

RUN yarn build

# --- RUNNER STAGE ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY --from=builder /app/server/dist ./dist
COPY --from=builder /app/node_modules ./node_modules

COPY shared /app/shared

EXPOSE 3000

# Since deps are hoisted to the root, Node will find them in /app/node_modules
CMD ["npx", "tsx", "dist/server.js"]
