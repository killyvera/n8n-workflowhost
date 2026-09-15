# Deploy automático desde el repo (Railway, Render, Coolify, Dokploy, etc.).
# Usa la imagen oficial de n8n: build rápido, sin compilar el monorepo.
# Sube N8N_VERSION cuando quieras actualizar n8n en el próximo deploy.
#
# En la plataforma:
# - Exponer/mapear el puerto 5678 (o N8N_PORT)
# - Montar volumen persistente en /home/node/.n8n
# - Configurar WEBHOOK_URL, N8N_ENCRYPTION_KEY y (opcional) Postgres vía env

ARG N8N_VERSION=2.40.0
FROM docker.n8n.io/n8nio/n8n:${N8N_VERSION}

ENV NODE_ENV=production \
	N8N_PORT=5678 \
	N8N_LISTEN_ADDRESS=0.0.0.0

EXPOSE 5678

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
	CMD node -e "fetch('http://127.0.0.1:'+(process.env.N8N_PORT||5678)+'/healthz').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
