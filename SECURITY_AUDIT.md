# ATHLETIX — AppSec audit and hardening

Date: 2026-11-01 · Branch: `arena/3d7cd59a-marabras` · Scope: repository, Supabase project `tazszwllacwqccfjnglk`, Vercel configuration, dependencies, auth/AI/DB flows.

This report distinguishes **implemented**, **verified**, and **external/pending**. A passing build is not treated as proof of security.

## 1. Findings and remediation

| # | Severity | Finding | Status | Evidence / files |
|---|----------|---------|--------|------------------|
| 1 | High | `saved_workouts` permissive `ALL` policy (`own OR is_public`) allowed cross-user UPDATE/DELETE of public rows (IDOR). | **Fixed + applied live.** Split into owner `ALL` and public `SELECT`; anon removed. | `supabase/migrations/20261101130000_appsec_hardening.sql`; live `pg_policies` shows `saved_workouts_owner` / `saved_workouts_public_read`. |
| 2 | High | Excessive table grants (`TRUNCATE/TRIGGER/REFERENCES`, anon writes) and broad admin profile access. | **Fixed + applied live.** Deny-by-default grants; explicit API surface; column-level profile grants; minimal admin directory view; admin role provisioning service-role-only. | migration above; live `pg_class.relacl`, `information_schema.column_privileges`; `src/pages/AdminPage.tsx`. |
| 3 | High | Database HTTP egress (`http`, `pg_net`) executable by API roles despite no app use (SSRF primitive). | **Fixed + applied live.** Unused extensions dropped with `RESTRICT`; `public.http_*` count 0, `net` schema absent. | `20261101140000_drop_unused_network_extensions.sql`; live catalog verification. |
| 4 | Medium | Privileged/trigger functions used `search_path=public`; trigger helpers executable as RPCs. | **Fixed + applied live.** Empty `search_path`, qualified names, trigger-helper EXECUTE revoked, deny-by-default function grants. | migration; live `pg_proc.proconfig/proacl`. |
| 5 | High | AI endpoints lacked shared cost/abuse controls, replay protection, strict egress and output validation. | **Fixed in code; DB quota live. API deploy pending.** Bearer-header auth, origin/JSON/body bounds, UUID request IDs, DB lease/quota, provider HTTPS allowlist, no redirects, 40s timeout, bounded response, strict schemas, catalog authority from DB. | `api/_lib/security.ts`, `api/_lib/provider.ts`, `api/_lib/planContract.ts`, `api/ai/*`, `src/services/aiCoach.ts`. |
| 6 | Medium | Prompt injection / unsafe AI output could influence plans or chat. | **Mitigated + tested.** System prompts mark user/context/catalog as untrusted; no tools; strict output schemas; unknown exercises discarded; client revalidates. | `api/_lib/planContract.ts`; `tests/security/api-boundaries.test.ts`. |
| 7 | Medium | Personal drafts persisted in `localStorage`; logout/account switch could leave data on shared devices. | **Fixed + tested.** Drafts moved to tab-scoped `sessionStorage`; logout/SIGNED_OUT clears current+legacy personal keys and caches; global sign-out with local fallback. | `src/lib/privateStorage.ts`, `src/stores/auth.ts`, `src/services/trainingProfile.ts`, `src/pages/WorkoutSessionPage.tsx`. |
| 8 | Medium | Recovery could enumerate accounts; weak password UX; no browser cooldown. | **Partially fixed.** Generic recovery message, UI min 12, per-subject cooldown, reset signs out. **Server-side Supabase Auth policy still pending** (see §4). | `src/services/auth.ts`, `src/pages/auth/*`. |
| 9 | Medium | Missing CSP and some security headers. | **Implemented; applies on next Vercel deploy.** CSP, COOP, no-sniff, DENY, referrer, permissions, HSTS. | `vercel.json`. |
| 10 | High/Critical (deps) | 29 npm audit findings incl. critical/high in dev/build chain. | **Reduced to 5 residual (0 critical/high).** Verified registry metadata before install; clean `npm ci` passes. Residual are build-time PWA/workbox transitive issues. | `package.json`, `package-lock.json`; `/tmp/athletix-audit6.json`. |
| 11 | Info | Secrets in code/history/frontend. | **No matches** for scanned secret formats across 26 commits; public anon key only in frontend; no `service_role` in browser. Scan is format-based, not exhaustive. | history scan; `.env.example`; Vercel env names. |

## 2. Verification performed

Local (isolated, non-destructive):

- `npm ci --ignore-scripts` — clean install from lockfile.
- `npm run typecheck`, `npm run typecheck:api`, `npm run lint` — PASS.
- `npm test` — **178 passed / 14 files** (includes sign-out local-fallback regression tests).
- `npm run test:security` — **10 API/client tests passed** + **28 PostgreSQL security scenarios** (two isolated users + anon; grants, cross-tenant IDs, public-row writes, admin boundary, malicious JSON, quota/replay across transactions).
- `npm run test:db` — migration/ownership/atomic completion/meal rollback PASS.
- `npm run test:i18n` — **648 strings** covered.
- `npm run test:browser` — **3 passed** (login/i18n/overflow, authenticated shell/meal, workout set persistence/rest).
- `npm run build` — PASS; PWA **46 precache entries (1017.24 KiB)**; no inline scripts in `dist/index.html`; SW navigation fallback excludes `/api/`.
- GitHub Actions CI — **PASS** on Node 22.13 (run `41314907762`). Node engine is now `>=22.13.0` because Supabase realtime-js needs native WebSocket in the client-hardening security tests; Vercel builds on Node 26.

Live Supabase (read-only preflight, then transactional migrations):

- Preflight: cross-tenant violations **0**; `saved_workouts` **0**; active admins **0**; profiles **3** preserved.
- Applied migrations: `appsec_hardening`, `drop_unused_network_extensions`.
- Post-apply: `saved_workouts` policies split; `ai_usage` RLS enabled with no client table grants; ownership triggers **4**; `public.http_*` **0**; `net` schema **0**; profile column grants restricted; project health **ACTIVE_HEALTHY**.

## 3. Residual dependency risk

`npm audit`: **0 critical, 0 high, 3 moderate, 2 low**. Remaining packages are build-time transitive dependencies of `vite-plugin-pwa`/`workbox-build` (`glob`, `minimatch`, `workbox-build`, `deepmerge`, `@rollup/plugin-node-resolve`). They are not shipped as runtime app code. `vite-plugin-pwa` was kept at **1.1.0** because 2.0.0 produced an empty precache manifest with this Vite 6 setup. Overrides pin `tinypool`, `ejs`, and scoped `minimatch` where compatible. Re-audit when workbox publishes a fixed glob chain.

## 4. External configuration still required

These are **not** silently ignored; they need dashboard/credentials beyond this repo:

1. **Supabase Auth server policy** (Dashboard → Authentication): set `password_min_length >= 12`, enable leaked-password protection (HIBP), enable CAPTCHA for signup/recovery, require reauthentication/current password for password change, set session inactivity timeout/timebox, enable password-changed notifications, configure custom SMTP (default Supabase email sending is limited to 2/hour). Live re-read: min length 6, HIBP/CAPTCHA off, reauth off, inactivity/timebox 0, SMTP unset. Refresh rotation is reported enabled (`refresh_token_rotation_enabled=true`, reuse interval 10s), but the connector's `security_refresh_token_rotation_enabled` field returned null; confirm in the dashboard. The UI cooldown is UX only, **not** a security boundary.
2. **Redirect allowlist**: review/remove unused legacy domains (`marabas.vercel.app`, `projeto-maramba.vercel.app`) and localhost entries for production if not needed.
3. **AI provider**: `AI_API_KEY` is not set in Vercel, so `/api/ai/*` returns 503 and the app uses the deterministic generator. To enable, set server-side `AI_API_KEY`, optional `AI_BASE_URL` (allowlisted HTTPS hosts only) and `AI_MODEL`. Configure provider-side spend alerts; DB quotas cap per-user usage but are not a billing alert.
4. **Google OAuth**: provider is disabled in Supabase; the UI button remains but the service returns a comprehensible error instead of redirecting. Enable/configure the provider if the button should succeed.
5. **Vercel deployment**: a **private preview** is READY (`dpl_FPEXYvvDYGkhFX7mdDagquwFZ7GJ`, commit `bdf9257`, SSO-protected; not end-to-end tested from this sandbox). **Production is unchanged** (`dpl_6geU419BmYTUBg2UfsYVwX4Xo6eB` @ `5bdfae9`). Merge PR #7 and promote/deploy to production for the frontend/API/CSP fixes to take effect; DB hardening is already live.

## 5. Recommended next steps

- Merge/deploy this branch, then smoke-test production login, workout persistence, nutrition, admin directory, and AI 503 fallback.
- Apply the Supabase Auth policy items above and re-run `get_auth_config`.
- Add monitoring/alerting for `ai_usage` (daily tokens, quota denials) and Supabase auth rate-limit events.
- Periodically re-run `npm run audit:dependencies`, `npm run test:security`, and the two-user DB suite after schema changes.
- Consider MFA enforcement for admin accounts and a formal penetration test before handling sensitive health data at scale.
