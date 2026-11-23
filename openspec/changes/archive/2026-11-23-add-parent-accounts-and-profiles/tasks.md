# Tasks

## 1. PostgreSQL & Prisma 7 Foundation

- [x] 1.1 Install Prisma 7 (`@prisma/client`, `@prisma/adapter-pg`, `pg`, `dotenv`, `prisma`, `@types/pg`), create `prisma.config.ts`, `prisma/schema.prisma`, `docker-compose.yml`, `.env.example`, and update `package.json`, `.gitignore`, `eslint.config.mjs`, `.prettierignore`, and `.github/workflows/ci.yml`
- [x] 1.2 Generate the Prisma 7 client (`npx prisma generate`) and verify the schema validates cleanly (`npx prisma validate`)

## 2. Server DataStore, Auth, Consent & Child Profile API

- [x] 2.1 Implement `src/lib/server/store.ts`, `src/lib/server/memory-store.ts`, `src/lib/server/prisma-store.ts`, `src/lib/server/auth.ts`, and `src/lib/server/validation.ts` with comprehensive unit tests (`src/lib/server/profiles.test.ts`) covering consent enforcement, password hashing, strict no-PII validation, cross-parent isolation, and cascading deletion
- [x] 2.2 Implement Next.js App Router Route Handlers for `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, `/api/children`, and `/api/children/[childId]`

## 3. Parent Portal UI, Active Child Context & Verification

- [x] 3.1 Add Khmer/English parent portal, consent, and child profile strings to `src/lib/i18n/messages.ts`
- [x] 3.2 Implement `src/components/parent/ChildAvatar.tsx`, `src/components/parent/ActiveChildProvider.tsx`, `src/components/parent/ParentPortal.tsx`, and `src/app/parent/page.tsx`; wrap `RootLayout` in `ActiveChildProvider` and add a parent portal link on `/` (`src/app/page.tsx`)
- [x] 3.3 Add component tests (`src/components/parent/ParentPortal.test.tsx`), mobile `360×800` Playwright E2E test (`e2e/parent-profiles.spec.ts`), update `README.md` with PostgreSQL/Prisma setup, and verify `npm run content:validate`, `npm run lint`, `npm test`, `npm run build`, and `npm run test:e2e` all pass
