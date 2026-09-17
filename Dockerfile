# syntax=docker/dockerfile:1.7
# Build THIS fork (local entitlements). Multi-stage: pnpm build:n8n → runtime.

ARG NODE_VERSION=26.7.0

# -----------------------------------------------------------------------------
# Builder
# -----------------------------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm AS builder

RUN set -eux; \
	apt-get update; \
	apt-get install -y --no-install-recommends python3 make g++ git ca-certificates; \
	rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@12.3.4

WORKDIR /src

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json tsconfig.json tsconfig.configs.json ./
COPY patches ./patches
COPY scripts ./scripts
COPY packages ./packages
COPY biome.jsonc ./
COPY NOTICE LICENSE.md README.md ./

# CI/DOCKER_BUILD skip lefthook in scripts/prepare.mjs.
# Keep NODE_ENV unset during install so build tooling (devDeps) is installed.
ENV CI=true \
	DOCKER_BUILD=1 \
	NODE_OPTIONS=--max-old-space-size=4096 \
	TURBO_TELEMETRY_DISABLED=1 \
	DO_NOT_TRACK=1 \
	PNPM_NETWORK_CONCURRENCY=8 \
	PNPM_CHILD_CONCURRENCY=4

RUN pnpm install --frozen-lockfile
ENV NODE_ENV=production
RUN pnpm run build:n8n

# -----------------------------------------------------------------------------
# Runtime — full bookworm (has ca-certificates); no apt at runtime (avoids mirror 503s)
# -----------------------------------------------------------------------------
FROM node:${NODE_VERSION}-bookworm AS runtime

ARG N8N_VERSION=workflowhost
ENV NODE_ENV=production \
	N8N_RELEASE_TYPE=stable \
	N8N_PORT=5678 \
	N8N_LISTEN_ADDRESS=0.0.0.0 \
	N8N_USER_FOLDER=/home/node \
	SHELL=/bin/sh \
	N8N_EXPRESSION_ENGINE=legacy

RUN mkdir -p /home/node/.n8n /usr/local/lib/node_modules \
	&& chown -R node:node /home/node

COPY --from=builder --chown=node:node /src/compiled /usr/local/lib/node_modules/n8n
COPY --chown=root:root docker/images/n8n/docker-entrypoint.sh /docker-entrypoint.sh

RUN chmod +x /docker-entrypoint.sh \
	&& find /usr/local/lib/node_modules/n8n/bin -type f -exec sed -i 's/\r$//' {} + \
	&& sed -i 's/\r$//' /docker-entrypoint.sh \
	&& ln -sf /usr/local/lib/node_modules/n8n/bin/n8n /usr/local/bin/n8n

WORKDIR /home/node
USER node
EXPOSE 5678

HEALTHCHECK --interval=30s --timeout=10s --start-period=90s --retries=5 \
	CMD node -e "fetch('http://127.0.0.1:'+(process.env.N8N_PORT||5678)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

# Node as PID1 is fine for compose/PaaS; entrypoint execs n8n.
ENTRYPOINT ["/docker-entrypoint.sh"]

LABEL org.opencontainers.image.title="n8n-workflowhost" \
	org.opencontainers.image.description="Self-hosted n8n fork with local entitlements (no Enterprise license server)" \
	org.opencontainers.image.source="https://github.com/killyvera/n8n-workflowhost" \
	org.opencontainers.image.version="${N8N_VERSION}"
