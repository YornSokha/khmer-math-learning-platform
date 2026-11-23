# Agent Instructions

## Source-of-Truth Documents

Do not duplicate content across these files; read each for its domain:

- [docs/brief.md](docs/brief.md) — original project brief and phased workflow.
- [docs/discovery.md](docs/discovery.md) — Phase 1 research, MoEYS curriculum map, activity engine contract, MVP scope, and milestone plan.
- [docs/product.md](docs/product.md) — core child/parent user journeys and UI/UX direction.
- [openspec/config.yaml](openspec/config.yaml) — stack/hosting decisions, Khmer rules, 8-step lesson template, and reward rules.

---

## Working Rules

1. Research before making important decisions.
2. Use Spec-Driven Development (`openspec`). Do not implement without an approved specification.
3. Keep specifications concise and actionable.
4. Implement one feature at a time.
5. Do not skip acceptance criteria.
6. Do not implement features outside the approved scope without updating the specs.
7. Prioritize working software over excessive documentation.
8. Prioritize educational quality over visual gimmicks.
9. Validate all mathematical content.
10. Use Khmer naturally, not machine-translated wording (native teacher review required before publishing lessons).
11. Keep architecture simple and extensible.
12. Write automated tests for important logic and interactions.
13. Keep the project runnable throughout development.
14. Document how to install, run, test, and deploy the application.
15. Track completed work and remaining tasks.
16. Avoid duplicating information across documents.

---

## Development Commands

### OpenSpec Workflow (Active Now)

```bash
openspec list                     # List specs and active changes
openspec status --change <name>   # Check change status and artifact progress
openspec validate <name>          # Validate change specs and artifacts
```

Standard change loop: `/opsx:propose <change>` → human review → `/opsx:apply` → run tests & verify acceptance criteria → `/opsx:archive`.

### Application Commands

```bash
npm install                       # Install dependencies
npm run dev                       # Start Next.js dev server
npm run build                     # Production build (use `next build --webpack` if Serwist requires webpack)
npm run start                     # Serve production build locally
npm run lint                      # ESLint and Prettier format checks
npm run format                    # Auto-format files with Prettier
npm test                          # Run Vitest unit and Testing Library component tests
npm run test:watch                # Run Vitest in watch mode
npm run test:e2e                  # Run Playwright mobile (360x800) E2E tests
npm run content:validate          # Validate lesson YAML (added in add-lesson-content-schema)
npx prisma migrate dev            # Run local database migrations (Milestone 2+)
npx prisma generate               # Regenerate Prisma 7 client (Milestone 2+)
```

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
