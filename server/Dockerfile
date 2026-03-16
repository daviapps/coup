FROM node:22-alpine AS builder
WORKDIR /app

# 1. Build Skeleton
COPY package.json yarn.lock ./
COPY server/package.json ./server/
# If you have a 'common' or 'shared' package, COPY it here too!

RUN yarn install --frozen-lockfile

# 2. Build Source
COPY server ./server
# If your build depends on other folders (like /common), COPY them here
RUN yarn build

# --- RUNNER STAGE ---
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# 3. Copy root AND workspace configs for production install
COPY package.json yarn.lock ./
COPY server/package.json ./server/

# This installs only production deps and hoists them to /app/node_modules
RUN yarn install --production --frozen-lockfile

# 4. Copy the build artifact from the builder stage
# Note the path: /app/server/dist
COPY --from=builder /app/server/dist ./dist

EXPOSE 3000

# Since deps are hoisted to the root, Node will find them in /app/node_modules
CMD ["node", "dist/server.js"]
