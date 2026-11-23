# Proposal: Add PostgreSQL + Prisma 7 Schema, Parent Auth & Consent, and Child Profiles

## Why

Milestone 2 requires persistent parent accounts with explicit under-16 parental consent (aligned with Cambodia's draft Personal Data Protection Law) and privacy-safe child profiles containing zero child PII (nickname, SVG avatar, grade, and numeral preference only). Establishing PostgreSQL + Prisma 7 and the parent/child account layer now unlocks multi-child households, per-child numeral preferences, full data deletion, and subsequent offline-to-cloud attempt sync.

## What Changes

- Configure **PostgreSQL + Prisma 7** (`prisma.config.ts`, `prisma/schema.prisma`, `@prisma/adapter-pg`, `docker-compose.yml`, `.env.example`, and `postinstall` client generation) storing only `Parent`, `ParentSession`, `ChildProfile`, `Attempt`, `SkillState`, and `AchievementAward` (never lesson content), with `onDelete: Cascade` from `ChildProfile` to all learning records.
- Introduce a clean server data-store layer (`src/lib/server/store.ts`) backed by `PrismaDataStore` when `DATABASE_URL` is configured and a parity `MemoryDataStore` fallback when `DATABASE_URL` is absent (for unit tests, CI, and zero-setup local runs).
- Implement secure parent authentication (`scrypt` password hashing, SHA-256 hashed opaque DB session tokens in `HttpOnly` cookies) and Route Handlers:
  - `POST /api/auth/signup` (enforcing explicit under-16 parental consent)
  - `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me`
  - `GET /api/children`, `POST /api/children`, `PATCH /api/children/[childId]`, `DELETE /api/children/[childId]` (strict no-PII schema, owner authorization, cascading deletion).
- Add `ActiveChildProvider` to persist the selected child profile locally and sync the child's `១២៣ / 123` numeral preference.
- Build the Khmer-first `/parent` portal for parent signup/consent, login, child profile creation/editing/deletion, and handing the device to a child (`/learn`), linked from `/`.
- Update `README.md`, `.gitignore`, `eslint.config.mjs`, `.prettierignore`, and `.github/workflows/ci.yml` for Prisma 7 workflows.

## Capabilities

### New Capabilities

- `profiles-consent`: Parent account creation with explicit under-16 parental consent, session authentication, child profiles with zero child PII (nickname, avatar, grade, numeral preference), and full cascading deletion of a child's learning data.

### Modified Capabilities

- None.

## Impact

- Dependencies added: `@prisma/client`, `@prisma/adapter-pg`, `pg`, `dotenv`, `prisma` (dev), `@types/pg` (dev).
- New backend/config files: `prisma.config.ts`, `prisma/schema.prisma`, `docker-compose.yml`, `.env.example`, `src/lib/server/*`, `src/app/api/auth/*`, `src/app/api/children/*`.
- New UI files: `src/components/parent/*`, `src/app/parent/page.tsx`.
- Modified files: `package.json`, `.gitignore`, `eslint.config.mjs`, `.github/workflows/ci.yml`, `src/lib/i18n/messages.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `README.md`.
