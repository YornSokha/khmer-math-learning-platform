# Tasks

## 1. Grade 1 Curriculum YAML Lessons (Lessons 1–12)

- [x] 1.1 Update `content/lessons/g1-make-ten.yaml` with `order: 5` and author Lessons 1–4 (`g1-01-subitize-1-5.yaml`, `g1-02-count-0-10.yaml`, `g1-03-five-and-more.yaml`, `g1-04-compare-groups.yaml`) under `content/lessons/`
- [x] 1.2 Author Lessons 6–9 (`g1-06-addition-10.yaml`, `g1-07-subtraction-10.yaml`, `g1-08-tuktuk-jumps-20.yaml`, `g1-09-tens-and-ones.yaml`) under `content/lessons/`
- [x] 1.3 Author Lessons 10–12 (`g1-10-patterns.yaml`, `g1-11-halves.yaml`, `g1-12-riel-money.yaml`) under `content/lessons/`

## 2. Ordered Loader, Dynamic Serwist Precaching & Verification

- [x] 2.1 Update `src/lib/content/loader.ts` to sort lessons by `order`, update `next.config.ts` to precache all discovered `/lessons/<id>` routes dynamically, and expand `src/lib/content/loader.test.ts` to verify all 12 ordered lessons
- [x] 2.2 Run `npm run content:validate`, `npm run lint`, `npm test`, `npm run build`, and `npm run test:e2e` and confirm all 12 lesson routes prerender cleanly and all checks exit with code `0`
