FROM node:22-alpine AS base
WORKDIR /app
RUN corepack enable

FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json .npmrc ./
COPY apps/storefront/package.json apps/storefront/package.json
COPY packages/types/package.json packages/types/package.json
RUN pnpm install --filter @dalizebo/storefront... --frozen-lockfile

FROM deps AS build
COPY apps/storefront apps/storefront
COPY packages/types packages/types
RUN pnpm --filter @dalizebo/storefront build
RUN pnpm --filter @dalizebo/storefront deploy --prod /out/storefront

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/apps/storefront/.next ./apps/storefront/.next
COPY --from=build /out/storefront/node_modules ./node_modules
COPY --from=build /out/storefront/package.json ./apps/storefront/package.json
WORKDIR /app/apps/storefront
EXPOSE 3000
CMD ["../../node_modules/.bin/next", "start", "-p", "3000"]
