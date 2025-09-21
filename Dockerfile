# Base dependencies
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json ./
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/mobile/package.json ./apps/mobile/
RUN npm install

# Build API
FROM base AS api-build
COPY . .
RUN npm run generate --workspace apps/api && npm run build --workspace apps/api

# Build Web
FROM base AS web-build
COPY . .
RUN npm run build --workspace apps/web

# Production API image
FROM node:22-alpine AS api
RUN apk add --no-cache curl
WORKDIR /app
ENV NODE_ENV=production
COPY --from=base /app/node_modules ./node_modules
COPY --from=api-build /app/apps/api/dist ./apps/api/dist
COPY apps/api/package.json ./apps/api/package.json
COPY apps/api/prisma ./apps/api/prisma
EXPOSE 4000
CMD ["node", "apps/api/dist/server.js"]

# Production Web image
FROM node:22-alpine AS web
RUN apk add --no-cache curl
WORKDIR /app
ENV NODE_ENV=production
COPY --from=web-build /app/apps/web/.next/standalone ./
COPY --from=web-build /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=web-build /app/apps/web/public ./apps/web/public
EXPOSE 3000
CMD ["node", "server.js"]
