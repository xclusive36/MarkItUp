# MarkItUp v4.0.0 Migration Guide

This guide helps you upgrade from the 3.x series to 4.0.0.

v4 introduces user authentication/authorization, unified AI settings, security header updates, and Plugin Manager UX changes. Some behaviors are breaking vs 3.x—please follow the steps below.

---

## Who should read this

- You self-host MarkItUp (Docker or Node) and are upgrading from 3.x.
- You built integrations against unauthenticated endpoints.
- You use AI features (OpenAI/Anthropic/Gemini/Ollama) or the Plugin Manager.

---

## Summary of breaking changes

- Auth is enabled by default. Anonymous access may be restricted depending on your configuration.
- Duplicate AI configuration in the Plugin Manager is removed. Configure providers in the AI Assistant panel instead.
- CSP/security headers were tightened/modernized; connect-src is relaxed to allow common self-hosting scenarios (LAN/Docker) without manual allowlists.

If you relied on unauthenticated requests or Plugin Manager API key inputs, you will need to adjust.

---

## Upgrade checklist

1. Update your working copy to v4.0.0
2. Create/update your environment file based on `.env.example`
3. Decide whether to enable guest (unauthenticated) mode for local use
4. Verify AI Assistant settings (provider, model, endpoint for Ollama)
5. Start the app and confirm login works
6. Verify plugins load and plugin settings open without console warnings

---

## Environment variables (new/changed)

Copy `.env.example` to your environment file and set these:

- AUTH_SECRET: Required for session/JWT signing
- AUTH_PROVIDER: local (default) or your identity provider if integrated later
- ENFORCE_HTTPS: optional; set to `true` in production behind TLS
- CSP_STYLE_NONCE: optional; provide if you inject nonces
- ALLOWED_CONNECT_HOSTS: optional; extra hosts for CSP (most self-hosting should work without this in v4)

Docker compose example:

```yaml
services:
  markitup:
    environment:
      - AUTH_SECRET=change-me
      - ENFORCE_HTTPS=false
      - HOSTNAME=0.0.0.0
      - PORT=3000
```

> Note: `.env.example` is now committed to the repo to make setup easier. Real `.env*` files remain ignored.

---

## Authentication behavior

- Default: authentication required; authenticated users can manage their own content.
- Guest mode (optional): enable a permissive local workflow for personal usage. See `AUTHENTICATION_SETUP.md` for toggles. If guest mode is disabled, unauthenticated requests will receive `401/403`.

Verification:

- Visit `/` and ensure you can sign in.
- Access APIs you previously used—expect `401/403` unless you’re authenticated or guest mode is enabled.

---

## AI settings unification

- Previous: Plugin Manager displayed provider/API key inputs.
- Now (v4): Configure providers in the AI Assistant panel.
  - Open bottom menu → AI Chat → Settings (⚙️) in the AI Assistant panel header.
  - Choose provider: OpenAI, Anthropic, Gemini, or Ollama.
  - For Ollama, no API key is required; set the server URL if remote.

Plugin Manager will show a notice pointing to the AI Assistant. Plugin-specific settings still exist (e.g., model choices), but provider credentials are centralized.

---

## CSP and security headers

- `connect-src` now allows `http:`, `https:`, `ws:`, `wss:` by default to support LAN/Docker self-hosted AI (e.g., Ollama) without manual allowlists.
- Deprecated Permissions-Policy keys removed (e.g., interest-cohort/browsing-topics). Current limited policy: `camera=()`, `microphone=()`, `geolocation=()`.

If you previously depended on an allowlist, you can still use `ALLOWED_CONNECT_HOSTS` to add hosts explicitly.

---

## Ollama + containers

- If running MarkItUp and Ollama in separate containers:
   - Use service names within the compose network (e.g., `http://ollama:11434`).
   - From a container to the host, use `http://host.docker.internal:11434` on macOS/Windows.
- The built-in proxy includes helpful error diagnostics for common container networking issues.

---

## Plugin Manager changes

- Removed deprecated API key inputs from the Plugin System settings tab.
- Added informational banners that point users to AI Assistant settings.
- Fixed duplicate React key warnings in certain plugin settings (e.g., `custom-templates`).

---

## Step-by-step upgrade

1. Pull v4.0.0
   - Update your deployment to use the new image/tag or pull latest sources.
2. Copy `.env.example` → `.env` and set values
3. Start the application
   - Docker Compose: `docker compose up -d`
   - Node: `npm install && npm run dev`
4. Configure AI providers
   - Bottom menu → AI Chat → Settings (⚙️)
5. Verify authentication
   - Sign in; confirm you can create/edit notes
6. Verify plugins
   - Open Plugin Manager; open settings for a few plugins; ensure no duplicate-key warnings
7. Optional hardening
   - Set `ENFORCE_HTTPS=true` behind TLS
   - Restrict any additional connect-src hosts via `ALLOWED_CONNECT_HOSTS`

---

## Rollback

If needed, you can run the previous 3.7.x image/branch. Note that any auth-related data created in v4 is backward-compatible at the file level (markdown, db), but features requiring auth will not function in 3.7.x.

---

## Troubleshooting

- 401/403 after upgrade: ensure you’re signed in or enable guest mode for local use.
- Ollama connection issues: try `http://ollama:11434` (container) or `http://host.docker.internal:11434` (host from container). Check the proxy error messages for guidance.
- CORS-like errors: confirm CSP and connect-src; in most cases v4 defaults require no extra allowlists.

---

If you run into anything unexpected, please open an issue with environment details and logs.
