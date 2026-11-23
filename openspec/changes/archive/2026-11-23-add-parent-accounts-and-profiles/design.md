# Design: PostgreSQL + Prisma 7, Parent Auth & Consent, and Child Profiles

## Architecture

### 1. Prisma 7 + PostgreSQL Schema (`prisma/schema.prisma`, `prisma.config.ts`)

- Generator: `provider = "prisma-client"` outputting to `../src/generated/prisma` (ignored by git, ESLint, and Prettier; regenerated on `npm install` via `postinstall` and via `npx prisma generate`).
- Datasource URL is configured in `prisma.config.ts` using `env("DATABASE_URL")` (with safe fallback in `prisma.config.ts` so `prisma generate` succeeds in CI without a live DB connection string).
- Six relational models:
  - `Parent` (`id`, `email` unique, `passwordHash`, `consentAcceptedAt`, `consentVersion`, `createdAt`, `updatedAt`)
  - `ParentSession` (`id`, `tokenHash` unique, `parentId` → `Parent` `onDelete: Cascade`, `expiresAt`, `createdAt`)
  - `ChildProfile` (`id`, `parentId` → `Parent` `onDelete: Cascade`, `nickname`, `avatarId`, `grade`, `numeralPref`, `createdAt`, `updatedAt`)
  - `Attempt` (`id`, `clientEventId` unique, `childProfileId` → `ChildProfile` `onDelete: Cascade`, `lessonId`, `lessonVersion`, `stepId`, `correct`, `hintsUsed`, `misconceptionId`, `durationMs`, `attemptedAt`, `createdAt`)
  - `SkillState` (`id`, `childProfileId` → `ChildProfile` `onDelete: Cascade`, `skillId`, `independentSessions`, `lastMasteredDate`, `masteredAt`, `reviewStage`, `nextReviewAt`, `updatedAt`, `@@unique([childProfileId, skillId])`)
  - `AchievementAward` (`id`, `childProfileId` → `ChildProfile` `onDelete: Cascade`, `achievementId`, `awardedAt`, `@@unique([childProfileId, achievementId])`)

### 2. DataStore Abstraction (`src/lib/server/store.ts`)

- Defines a narrow async `DataStore` interface covering parent accounts, sessions, child profiles, attempts, and skill states.
- `PrismaDataStore` (`src/lib/server/prisma-store.ts`): uses `@prisma/adapter-pg` + `pg.Pool` + generated `PrismaClient` whenever `process.env.DATABASE_URL` is set.
- `MemoryDataStore` (`src/lib/server/memory-store.ts`): preserves identical uniqueness, ownership checks, and cascade deletion in memory (anchored on `globalThis` for Next.js dev/start consistency) when `DATABASE_URL` is not configured. Keeps Vitest, CI, and Playwright E2E completely self-contained and runnable without requiring a running Docker daemon.

### 3. Authentication & Security (`src/lib/server/auth.ts`)

- Passwords hashed with Node's native `crypto.scrypt` (`salt:derivedKey`, 16-byte random salt, 64-byte key) and verified via `crypto.timingSafeEqual`.
- Sessions use a 32-byte cryptographically random token stored client-side in an `HttpOnly`, `SameSite=Lax`, `Path=/`, `Secure` (when `NODE_ENV === "production"` and HTTPS; note: for local `next start` over `http://localhost`, `secure` is set only when request protocol is `https:` or `COOKIE_SECURE=true` so Playwright on `http://localhost:3123` works cleanly while production HTTPS always receives `Secure`).
- Only the SHA-256 hash of the token is stored in `ParentSession.tokenHash`.
- Strict Zod schemas (`.strict()`) enforce `consentAccepted: z.literal(true)` on signup and reject any extra PII properties on child profile creation/updates.

### 4. Client State & Khmer UI (`/parent`)

- `ActiveChildProvider` (`src/components/parent/ActiveChildProvider.tsx`) stores the selected `{ id, nickname, avatarId, grade, numeralPref }` in `localStorage` and synchronizes `NumeralPreferenceProvider` when a child is selected.
- `ChildAvatar` (`src/components/parent/ChildAvatar.tsx`) renders 6 warm, lightweight inline SVG Cambodian-themed child avatars (`mango`, `lotus`, `elephant`, `tuktuk`, `star`, `owl`) — zero uploaded photos.
- `/parent` (`src/app/parent/page.tsx` + `src/components/parent/ParentPortal.tsx`) provides:
  - Parent sign-up form with Khmer under-16 parental consent checkbox and privacy explanation.
  - Parent login form.
  - Signed-in dashboard to add child profiles, switch each child's `១២៣ / 123` numeral preference, hand the device to a child (routes to `/learn`), and permanently delete a child profile with explicit confirmation.
