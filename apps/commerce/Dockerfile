FROM node:22-bookworm-slim AS base
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json .npmrc ./
COPY apps/commerce/package.json apps/commerce/package.json

FROM base AS deps
RUN pnpm install --filter @dalizebo/commerce... --frozen-lockfile

FROM deps AS build
COPY apps/commerce apps/commerce
RUN pnpm --filter @dalizebo/commerce build
RUN pnpm --filter @dalizebo/commerce deploy --prod /out/commerce

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=9000
ENV XDG_CONFIG_HOME=/app/.medusa-config
COPY --from=build /out/commerce/node_modules ./node_modules
COPY --from=build /out/commerce/package.json ./package.json
COPY --from=build /app/apps/commerce/.medusa ./.medusa
COPY --from=build /app/apps/commerce/medusa-config.ts ./medusa-config.ts
COPY --from=build /app/apps/commerce/instrumentation.ts ./instrumentation.ts
EXPOSE 9000
HEALTHCHECK --interval=10s --timeout=5s --retries=10 CMD wget -q -O - http://127.0.0.1:9000/health || exit 1
CMD ["./node_modules/.bin/medusa", "start"]
