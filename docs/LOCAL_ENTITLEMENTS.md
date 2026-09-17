# Local entitlements (n8n-workflowhost fork)

This fork does not use `@n8n_io/license-sdk` or `license.n8n.io`.

Provider: [`packages/cli/src/license.ts`](packages/cli/src/license.ts)

## Enabled (OSS / local modules)

- sharing, folders, variables
- **user invites** with Pro roles (`global:member`, `global:admin`) and unlimited users
- team projects (unlimited) + project roles (admin / editor / viewer)
- advanced permissions, custom roles, API key scopes
- **source control (Git sync)** — connect repo, SSH keys, push/pull branches
- external secrets
- LDAP, SAML, OIDC, MFA enforcement
- log streaming
- advanced execution filters, debug in editor
- binary / execution data S3 and Azure (when storage is configured)
- multiple main instances, worker view, worker pools
- community nodes custom registry
- insights summary / dashboard / hourly data
- workflow diffs, named versions

## Disabled (cloud / billing / deferred)

- AI credits, AI gateway, Ask AI, AI assistant cloud, AI builder
- **Environments v2 / Git connections / promotions** (module not shipped; use Source Control instead)
- instance reporting to n8n
- dynamic credentials, workflow reviews, evaluations UI
- personal space policy, token exchange, data redaction EE, otel custom spans
- node type policies, non-production license banner

## Quotas

Users, active workflows, variables, team projects, and workflow history prune are unlimited (`-1`). AI credit quotas stay at `0`.

## Notes

- Invites create pending users and return `inviteAcceptUrl` even if SMTP is not configured (`emailSent: false`). Configure SMTP to send mail automatically.
- Settings → Source Control is the Pro Git path that works in this fork.
