# The phone mock (this Next.js app) with the real Un-Said web build inside it at /unsaid.
# Build context is the REPO ROOT (it needs mobile/ and Branched-Frontend/); the file list sent to
# Docker is trimmed by Branched-Frontend/Dockerfile.dockerignore (BuildKit reads it next to this file).
#
#   docker build -f Branched-Frontend/Dockerfile -t unsaid-phone:local \
#     --build-arg EXPO_PUBLIC_API_URL=https://45-32-200-63.sslip.io \
#     --build-arg EXPO_PUBLIC_APP_KEY=<APP_KEY> .
#   docker run --rm -p 3000:3000 unsaid-phone:local      # -> http://localhost:3000/device
#
# deploy/aws/update.sh does this on the server. EXPO_PUBLIC_* values end up in the Un-Said JS bundle,
# which anyone who opens the page can read: the same as any Expo build of the app.

ARG NODE_IMAGE=node:22-bookworm-slim

# ------------------------------------------------------------------ 1. Un-Said web build (mobile/)
# Same as Branched-Frontend/scripts/build-unsaid.sh: a temporary app.config.js (this stage only; the
# repo's mobile/ is never changed) serves the single-page web build under the /unsaid base path.
FROM ${NODE_IMAGE} AS unsaid
WORKDIR /src/mobile
ENV CI=1 EXPO_NO_TELEMETRY=1 NODE_OPTIONS=--max-old-space-size=1536
COPY mobile/package.json mobile/package-lock.json mobile/.npmrc ./
RUN npm ci --no-audit --no-fund
COPY mobile/ ./
RUN test ! -e app.config.js || { echo "mobile/app.config.js exists; this build expects app.json only" >&2; exit 1; } \
 && printf '%s\n' \
    '// Temporary (Branched-Frontend/Dockerfile, build stage only): serve the web build under /unsaid.' \
    'module.exports = ({ config }) => ({' \
    '  ...config,' \
    '  experiments: { ...(config.experiments ?? {}), baseUrl: "/unsaid" },' \
    '  web: { ...(config.web ?? {}), output: "single" },' \
    '});' > app.config.js
# Declared after npm ci, so a new key or host doesn't reinstall the dependencies.
ARG EXPO_PUBLIC_API_URL
ARG EXPO_PUBLIC_APP_KEY=""
ARG EXPO_PUBLIC_DEMO_DATA=1
RUN test -n "$EXPO_PUBLIC_API_URL" \
    || { echo "set --build-arg EXPO_PUBLIC_API_URL=https://<backend host>" >&2; exit 1; } \
 && npx expo export --platform web --output-dir /unsaid-web --clear \
 && test -f /unsaid-web/index.html

# ------------------------------------------------------------------ 2. the phone (Next.js, standalone)
FROM ${NODE_IMAGE} AS phone-build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1 NEXT_OUTPUT=standalone PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 \
    NODE_OPTIONS=--max-old-space-size=1536
COPY Branched-Frontend/package.json Branched-Frontend/package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY Branched-Frontend/ ./
# Copying the export in first also makes this stage wait for stage 1: one big build at a time on 2 GB.
COPY --from=unsaid /unsaid-web ./public/unsaid
RUN npm run build \
 && test -f .next/standalone/server.js

# ------------------------------------------------------------------ 3. run it on :3000
FROM ${NODE_IMAGE} AS runner
WORKDIR /app
ENV NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 PORT=3000 HOSTNAME=0.0.0.0
COPY --from=phone-build --chown=node:node /app/.next/standalone ./
COPY --from=phone-build --chown=node:node /app/.next/static ./.next/static
COPY --from=phone-build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/unsaid').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"]
CMD ["node", "server.js"]
