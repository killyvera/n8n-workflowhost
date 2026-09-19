# Muelle / pull-only deploy — prebuilt ARM64 image (no monorepo compile).
# Muelle runs aarch64; do not use the amd64 :1.0.0 tag.
# Full source build recipe: Dockerfile.build (or master).
FROM ghcr.io/killyvera/n8n-workflowhost:1.0.1
