# Design

## Context

All 12 Grade 1 lessons are authored, validated, statically prerendered, and precached in Serwist. Learners now need a calm mobile-first learning path dashboard (`/learn`) and a skippable 5-item placement check (`/placement`) backed by local IndexedDB completions and `localStorage` placement state until Milestone 2 backend sync connects PostgreSQL profiles.

## Goals / Non-Goals

**Goals:**
- Pure, deterministic progression & placement logic in `src/lib/path/progression.ts` with 100% unit test coverage.
- Touch-friendly, Khmer-first `/learn` path map and `/placement` visual check with zero horizontal overflow at `360×800`.
- Offline precaching of `/learn` and `/placement` alongside all 12 `/lessons/<id>` routes.

**Non-Goals:**
- Parent accounts, multi-child switching, and server-side PostgreSQL sync (Milestone 2 backend phase).
- Spaced-review daily scheduler and achievements (Milestone 3).

## Decisions

### 1. Placement Recommendation Ladder (`src/lib/path/progression.ts`)
- **Decision**: 5 progressive items covering Grade 1 milestones:
  1. `p1-subitize` (count 4 mangoes → `"4"`)
  2. `p2-compare` (compare 7 vs 4 longans → `">"`)
  3. `p3-bond-10` (`7 + □ = 10` → `"3"`)
  4. `p4-add-10` (`4 + 3 = □` → `"7"`)
  5. `p5-tens-ones` (`20 + 5 = □` → `"25"`)
- **Recommendation rule** (contiguous mastery from item 1):
  - 0 correct from start → Lesson 1 (`g1-01-subitize-1-5`)
  - Item 1 correct → Lesson 2 (`g1-02-count-0-10`)
  - Items 1–2 correct → Lesson 5 (`g1-make-ten`)
  - Items 1–3 correct (bonds-to-10 mastered!) → Lesson 6 (`g1-06-addition-10`)
  - Items 1–4 correct → Lesson 8 (`g1-08-tuktuk-jumps-20`)
  - All 5 items correct → Lesson 10 (`g1-10-patterns`)
- **Rationale**: Directly implements the spec scenario ("WHEN placement shows bonds-to-10 mastered THEN the path starts at lesson 6") while keeping placement short (~2 minutes) and skippable at any item.
