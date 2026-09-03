FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json .npmrc ./
COPY apps/api/package.json apps/api/package.json
COPY packages/auth/package.json packages/auth/package.json
COPY packages/payments/package.json packages/payments/package.json
COPY packages/types/package.json packages/types/package.json
RUN pnpm install --filter @dalizebo/api... --frozen-lockfile

FROM deps AS build
COPY apps/api apps/api
COPY packages/auth packages/auth
COPY packages/payments packages/payments
COPY packages/types packages/types
RUN pnpm --filter @dalizebo/api build
RUN pnpm --filter @dalizebo/api deploy --prod /out/api

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /out/api/node_modules ./node_modules
COPY --from=build /out/api/package.json ./package.json
EXPOSE 4000
CMD ["node", "dist/server.js"]
