# Design

## Context

All 12 Grade 1 activity types are now registered in `ActivityRenderer` and validated by `lessonSchema`. This change authors the remaining 11 Grade 1 YAML lessons (completing Lessons 1–12), enforces deterministic ordering in `loader.ts`, and updates `next.config.ts` to automatically precache every lesson route in `public/sw.js`.

## Goals / Non-Goals

**Goals:**
- Author concise, natural, pedagogically sound Grade 1 YAML lessons (Lessons 1–4 and 6–12, plus adding `order: 5` to `g1-make-ten.yaml`), each with `intro` → `explore` → guided `activity` → `explain` → independent/mastery `activity`, culturally grounded Cambodian scenarios, misconceptions, and 1–3 progressive hints.
- Mark all newly authored Khmer copy `reviewStatus: { math: "approved", khmer: "draft", reviewer: "Pending Khmer primary teacher review" }` so the dual-approval publish gate remains honest until native teacher sign-off.
- Sort `getAllLessons()` by `order` ascending and precache all `/lessons/<id>` routes dynamically in `next.config.ts`.

**Non-Goals:**
- Learning path UI, locked/available/mastered badges, and placement test (next change: `add-learning-path-and-placement`).
- Recording or generating MP3 audio files (deferred until teacher review finalizes Khmer wording).

## Decisions

### 1. Dynamic Lesson Route Discovery in `next.config.ts`
- **Decision**: Read `content/lessons/*.yaml` filenames / `id:` lines in `next.config.ts` at build time to populate `additionalPrecacheEntries` with `{ url: "/lessons/<id>", revision }` for every lesson.
- **Rationale**: Prevents forgetting to add new lesson routes to Serwist precaching as the curriculum grows from 12 lessons into Grades 2–6.
