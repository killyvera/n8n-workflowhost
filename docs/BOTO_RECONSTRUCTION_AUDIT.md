# BOTO Workflow Host — Reconstruction Audit (Phase 0/1)

**Date:** 2026-09-17  
**Repository:** `killyvera/n8n-workflowhost`  
**Hosting / deploy identity:** [workflowhost.com](https://workflowhost.com)  
**Company site:** [bototech.com.mx](https://bototech.com.mx)  
**Logo source (reuse, do not redraw):** `c:\code\boto-landing\public\brand\` (+ favicons under `public/`)

---

## 1. Current SHA

`485d3b65332b064e11f6879c70d94a4f319102b6` (`master`)

---

## 2. Likely upstream n8n version

| Source | Version |
|--------|---------|
| Root `package.json` | **2.40.0** |
| `packages/cli/package.json` | **2.40.0** |
| `packages/frontend/editor-ui/package.json` | **2.40.0** |

Runtime `N8N_VERSION` comes from CLI package version (`packages/cli/src/constants.ts`).

---

## 3. Build status (local)

| Check | Status |
|-------|--------|
| Docker image `n8n-workflowhost:local` | Built OK after apt-mirror fix |
| Container healthz | Healthy with `N8N_EXPRESSION_ENGINE=legacy` |
| Host `pnpm` monorepo | Partial; prefer Docker / `build:n8n` for production artifacts |

---

## 4. Workspace / package map (relevant)

```text
packages/
├── cli/                 # License → local entitlements; start command
├── frontend/editor-ui/  # Primary BOTO branding surface
├── frontend/@n8n/design-system/  # N8nLogo (upstream; avoid overwrite)
├── frontend/@n8n/composables/    # useDocumentTitle DEFAULT_TITLE
├── frontend/@n8n/i18n/           # about.*, auth.*, usage copy
└── workflow/, core/, nodes-base/ # keep technical names
```

---

## 5. Current branding locations

### Logo / favicon

| Path | Role |
|------|------|
| `@n8n/design-system/.../N8nLogo/Logo.vue` | Canonical logo component |
| `.../logo-icon.svg`, `logo-text.svg` | Upstream mark + wordmark |
| `editor-ui/public/favicon.ico` | Tab icon |
| `editor-ui/index.html` | Title + favicon link |

### Auth / sidebar / about

| Path | Role |
|------|------|
| `AuthView.vue`, `MfaView.vue` | Large `N8nLogo` |
| `MainSidebarHeader.vue` | Sidebar `N8nLogo` |
| `AboutModal.vue` | Version + links to n8n-io GitHub/LICENSE |
| `useDocumentTitle.ts` | Suffix `n8n` |

### i18n

~368 `n8n` substring hits in `en.json`. Phase 2 prioritizes `about.*`, auth titles, not a full rewrite.

---

## 6. Entitlements

| Item | Detail |
|------|--------|
| Doc | `docs/LOCAL_ENTITLEMENTS.md` |
| Code | `packages/cli/src/license.ts` (`License` / local features; **no** license-sdk) |
| Plan name | `Self-Hosted OSS` |
| Stale config | `license.config.ts` still mentions `license.n8n.io` (unused) |

---

## 7. Enterprise / license leftovers

- Runtime `@n8n_io/license-sdk`: **removed**
- `LICENSE_EE.md`: **removed**
- `EnterpriseEdition.vue` / `isLicensed` gates: **still present** (UI for disabled cloud features)
- Comments/docs referencing license-sdk: few

---

## 8. Outbound telemetry / cloud (high level)

| Host | Role |
|------|------|
| `telemetry.n8n.io` | Diagnostics |
| `ph.n8n.io` | PostHog |
| `api.n8n.io` | Templates / versions / banners |
| `docs.n8n.io`, `community.n8n.io` | Help links |

Defaults still enabled; audit before production hardening (Phase 3+).

---

## 9. Auth / RBAC (snapshot)

Upstream community auth + project RBAC remain. Local entitlements unlock invite / projects / source-control style features without Enterprise certs.

---

## 10. Proposed minimal Phase 2 patch set

1. `editor-ui/src/config/boto-branding.ts` — single product metadata (`workflowhost.com` for hosting).
2. `editor-ui/src/assets/boto/*` — logos copied from **boto-landing** (+ dark-fill variant for light UI).
3. `BotoLogo.vue` — login + sidebar; do **not** overwrite design-system `N8nLogo` assets.
4. `useDocumentTitle` + `index.html` — title / favicon.
5. `AboutModal` + i18n `about.*` — BOTO product + Based on n8n + LICENSE/NOTICE.
6. Light CSS tokens `--boto-*` mapped where needed.

**Out of Phase 2:** full i18n sweep, telemetry redirect, EE middleware rewrite.

---

## 11. Test commands (branding)

```bash
pnpm --filter @n8n/composables test -- useDocumentTitle
pnpm --filter n8n-editor-ui typecheck
# Manual: /signin logo, favicon, title, sidebar, About
```

---

## 12. Provenance classification (initial)

| Capability | Source | Status |
|---|---|---|
| Workflow engine | UPSTREAM_COMMUNITY | retained |
| Editor | BOTO_MODIFIED | branding Phase 2 |
| Local entitlements | BOTO_OWNED | active |
| Enterprise `.ee` | REMOVED | prohibited |
| Logos | BOTO_OWNED | from boto-landing |
| Hosting identity | BOTO_OWNED | workflowhost.com |

See also `docs/provenance/` (seeded with Phase 2).
