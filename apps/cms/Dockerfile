FROM node:22-bookworm-slim AS base
WORKDIR /app
RUN corepack enable
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.base.json .npmrc ./
COPY apps/cms/package.json apps/cms/package.json

FROM base AS deps
RUN pnpm install --filter @dalizebo/cms... --frozen-lockfile

FROM deps AS build
COPY apps/cms apps/cms
RUN pnpm --filter @dalizebo/cms build
RUN pnpm --filter @dalizebo/cms deploy --prod /out/cms

FROM node:22-bookworm-slim AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=1337
COPY --from=build /out/cms/node_modules ./node_modules
COPY --from=build /out/cms/package.json ./package.json
COPY --from=build /app/apps/cms/config ./config
COPY --from=build /app/apps/cms/src ./src
COPY --from=build /app/apps/cms/public ./public
COPY --from=build /app/apps/cms/build ./build
COPY --from=build /app/apps/cms/favicon.png ./favicon.png
EXPOSE 1337
HEALTHCHECK --interval=10s --timeout=5s --retries=10 CMD wget -q -O /dev/null http://127.0.0.1:1337/admin || exit 1
CMD ["./node_modules/.bin/strapi", "start"]
