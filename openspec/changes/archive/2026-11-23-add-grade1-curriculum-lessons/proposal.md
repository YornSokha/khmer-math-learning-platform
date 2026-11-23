# Proposal

## Why

With all 12 Grade 1 SVG activity types implemented and verified in `activity-engine`, the platform is ready to populate the complete Grade 1 learning path (*លេខដំបូងរបស់ខ្មែរ*, Lessons 1–12 aligned to MoEYS Grade 1 units). Authoring all 12 lessons as validated YAML files—and automatically precaching all 12 lesson routes in the Serwist service worker—turns the single-lesson walking skeleton into a complete offline Grade 1 curriculum ready for teacher review and the learning path UI.

## What Changes

- Author 11 new Grade 1 MoEYS-aligned YAML lessons under `content/lessons/` and add `order: 5` to `content/lessons/g1-make-ten.yaml`, completing all 12 lessons of *លេខដំបូងរបស់ខ្មែរ*:
  1. `g1-01-subitize-1-5.yaml` (Quick look 1–5, `G1-U3`)
  2. `g1-02-count-0-10.yaml` (Count 0–10 and zero, `G1-U5`)
  3. `g1-03-five-and-more.yaml` (Five and some more, `G1-U6`)
  4. `g1-04-compare-groups.yaml` (More, less, same, `G1-U6`, `G1-U11`)
  5. `g1-make-ten.yaml` (Make 5, make 10, `G1-U7`)
  6. `g1-06-addition-10.yaml` (Putting together within 10, `G1-U14`)
  7. `g1-07-subtraction-10.yaml` (Taking away within 10, `G1-U15`)
  8. `g1-08-tuktuk-jumps-20.yaml` (Tuk-tuk jumps within 20, `G1-U16`)
  9. `g1-09-tens-and-ones.yaml` (Tens and ones to 99, `G1-U8`)
  10. `g1-10-patterns.yaml` (Repeating patterns, `G1-U4`)
  11. `g1-11-halves.yaml` (Equal halves, `G1-U13`, `G1-U24`)
  12. `g1-12-riel-money.yaml` (Paying with R50 and R100 riel notes, `G1-U17`)
- Update `src/lib/content/loader.ts` so `getAllLessons()` returns lessons sorted in curriculum `order` (1 → 12) and verify all 12 lessons pass `npm run content:validate` with ZWSP word segmentation and zero negative/non-integer parameter violations.
- Update `next.config.ts` to dynamically discover all lesson IDs in `content/lessons/` and precache every `/lessons/[lessonId]` route via Serwist so all 12 Grade 1 lessons work offline.
- Add curriculum integrity unit tests in `src/lib/content/loader.test.ts` verifying all 12 ordered lessons load cleanly, cover every MoEYS Grade 1 strand/skill, and pass expression/option validation across parameter ranges.

## Capabilities

### New Capabilities
*(None — extends existing `lesson-content` and `offline-pwa` capabilities.)*

### Modified Capabilities
- `lesson-content`: Requires deterministic curriculum ordering (`order`) and complete validated Grade 1 curriculum coverage (Lessons 1–12) using culturally familiar Cambodian contexts.
- `offline-pwa`: Extends Serwist precaching to include all Grade 1 lesson routes discovered from `content/lessons/`.

## Impact

- **New content files**: 11 YAML lessons under `content/lessons/` + `order: 5` added to `content/lessons/g1-make-ten.yaml`.
- **Modified files**: `src/lib/content/loader.ts`, `src/lib/content/loader.test.ts`, `next.config.ts`.
- **Static build**: Prerenders all 12 `/lessons/[lessonId]` and `/preview/[lessonId]` routes as static HTML.
