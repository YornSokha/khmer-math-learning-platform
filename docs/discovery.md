# Khmer Math Learning Platform — Phase 1 Discovery: Findings and Recommendations

**Build a Khmer-first, offline-capable PWA (Next.js + TypeScript + SVG) where every lesson is a short, data-driven sequence of visual activities (concrete → pictorial → abstract). Start with Grade 1–2 number sense, because that is where the MoEYS curriculum puts most of its weight and where Cambodian children fall behind.**

## TL;DR

- **Product:** Make a "learn by doing" path for ages 6–9 first, not a full 6–12 catalog. Ship 12 short Khmer lessons for Grade 1 (counting, comparing, making 10, +/−, tens and ones, riel money, halves, shapes). Each lesson uses reusable activity types such as ten-frame, number line, drag-to-group and riel payment, with hints, retrieval review and calm, non-addictive rewards.
- **Stack:** Next.js (App Router) + React + TypeScript + Tailwind CSS. Use PostgreSQL + Prisma 7 for users and progress only. Store lesson content as versioned JSON/YAML in git, validated with Zod. Draw interactives with SVG and Pointer Events. Add offline support with Serwist. Use Kantumruy Pro / Noto Sans Khmer at line-height ≈1.7–1.8, and pre-recorded or Azure `km-KH` neural audio.
- **Next step in Claude Code:** Run `openspec init --tools claude`. Then run `/opsx:propose` for the first change, "walking skeleton: one Khmer lesson end-to-end, offline". It covers the content schema, three activity types, the lesson player, hints and local progress. Review it, then `/opsx:apply` and `/opsx:archive`.

---

## Key Findings

### 1. Brilliant's method: what works (copy the principles, not the look)

- **Interaction comes before explanation.** Brilliant describes its lessons as visual and interactive problems instead of video or dense text. [vantaige](https://vantaige.io/ai-tool/brilliant) [scholarships360](https://scholarships360.org/college-admissions/what-is-brilliant/) Its FAQ says learners "build understanding by solving interactive problems and exploring visual models." [brilliant](https://brilliant.org/faq/)
- **Practice is built into every lesson, with many variations.** Its About page says "Every lesson has associated practice sets", and that learners "progress through levels of progressively more difficult problem solving in a topic." Brilliant's blog adds: "You need a lot of variations to let learners master a concept." [brilliant](https://brilliant.org/about/) [brilliant](https://blog.brilliant.org/hand-crafted-machine-made/)
- **Humans review all content.** Brilliant says AI-generated problems go "through multiple rounds of human review for design and correctness." It also says "currently, AI can't meet the bar for level design." [brilliant](https://blog.brilliant.org/hand-crafted-machine-made/)
- **Feedback "feel" matters.** Brilliant says the content is designed to feel fun "from the pedagogical design of the interactives and problem progression, to the types of sounds, feedback, and haptics." It also uses in-lesson celebrations and "moments of encouragement when learners are struggling", as the ustwo case study describes. [brilliant](https://brilliant.org/about/) [ustwo](https://ustwo.com/work/brilliant/)

**What this means for us:** Copy the *loop*: problem → manipulate → attempt → instant feedback → hint → visual explanation → harder variation. Also copy the *content pipeline*: parameterized variations plus human review. Do not copy Brilliant's visuals, characters or brand, and do not copy its AI tutor (an AI tutor is out of MVP scope anyway).

### 2. What the evidence says about teaching math to ages 6–12

| Principle | Evidence | Design rule for our app |
|---|---|---|
| Concrete → pictorial → abstract (CPA), manipulatives | EEF: pupils should be "explicitly taught the link between the manipulatives and the concepts", and manipulatives should be "temporary and used as a removable scaffold." [researchschool](https://researchschool.org.uk/norfolk/news/mathematical-manipulatives-why-and-how) | Each lesson shows objects first, then a model (ten-frame or number line), then the symbols. The final challenge removes the objects. |
| Number lines | IES/WWC 2021 practice guide: number lines rated **strong evidence**. "Before using a number line, introduce students to number lines using a number path." [ed](https://ies.ed.gov/ncee/wwc/practiceguide/26) [ed](https://files.eric.ed.gov/fulltext/ED611018.pdf) | Use a number path (counting steps) in G1, then a number line. Reuse the same component later for fractions and decimals. |
| Representations + precise language | WWC 2021: "Use a well-chosen set of concrete and semi-concrete representations"; teach "clear and concise mathematical language". [ed](https://ies.ed.gov/ncee/wwc/practiceguide/26) | Keep one fixed set of models across the app. Each lesson introduces 1–2 Khmer math terms. |
| Word problems | WWC 2021: deliberate word-problem instruction rated strong evidence. [ed](https://ies.ed.gov/ncee/wwc/practiceguide/26) | Every lesson includes one real-life Cambodian scenario (market, tuk-tuk, family). |
| Fluency | WWC 2021: "Regularly include timed activities as one way to build fluency." [ed](https://ies.ed.gov/ncee/wwc/practiceguide/26) | Add optional, untimed-by-default fact practice. Timers stay gentle and never punish. |
| Retrieval + spacing | Dunlosky et al. (2013): practice testing and distributed practice are the only "high utility" techniques. "Practice testing with feedback also consistently outperforms practice testing alone." [kent](https://www.kent.edu/psychology/all-study-strategies-not-created-equal-according-kent-state-researchers) [whz](https://www.whz.de/fileadmin/lehre/hochschuldidaktik/docs/dunloskiimprovingstudentlearning.pdf) | Run a daily review of earlier skills on a spaced schedule, always with feedback. |
| Worked examples | REL/IES toolkit: "Use worked-out examples with missing parts for students to complete." [ed](https://ies.ed.gov/ncee/rel/math-support-grades-3-6/) | Use a "faded example" step type: the example is complete first, then has one blank, then the child does it alone. |
| Misconceptions | EEF: "Knowledge of common and misconceptions can be invaluable in planning lessons to address errors before they arise." [cloudfront](https://d2tic4wvo1iusb.cloudfront.net/production/eef-guidance-reports/maths-ks-2-3/5660_EEF_-_Maths_Guidance_RAG_v5.pdf?v=1744243200) | Map common wrong answers to specific feedback (e.g., counting the start point on a number line). |

### 3. The Cambodian primary math curriculum (MoEYS)

**Structure.** The MoEYS Basic Education Curriculum (Grades 1–9) has four strands: **Number, Measurement, Geometry, Patterns and Algebra**, plus a focus on **Reasoning**. Statistics appears as a learning-outcome strand from Grade 1. The curriculum says math is "taught from a base of concrete experience". Grades 1–3 get **7 lessons/week** and Grades 4–6 get **6/week**. Learning outcomes in bold are "Curriculum Standards" expected by the end of Grade 3 and Grade 6. [mathunion](https://www.mathunion.org/fileadmin/ICMI/files/Other_activities/Database/Cambodia/Math-Curiculum_Grades_1_-_9.pdf)

**Grade-by-grade map (from the MoEYS Grades 1–9 curriculum document):**

| Grade | Number | Operations | Fractions/decimals | Measurement & money | Geometry, patterns, data |
|---|---|---|---|---|---|
| 1 | To 100 in **Khmer notation**; tens and ones; ordinals to 10th; compare with <, >, = | + to 20, − (first term < 20); commutativity (3 + 2 = 2 + 3) | ½ and ¼ of shapes and quantities | Non-standard length, weight and capacity; clock hours; days and months; role-play with **R50 and R100 notes** | 2D shapes, lines; repeating patterns; sorting; picture graphs [mathunion](https://www.mathunion.org/fileadmin/ICMI/files/Other_activities/Database/Cambodia/Math-Curiculum_Grades_1_-_9.pdf) |
| 2 | To 1,000 in **Khmer and Arabic notation**; odd/even; rounding | + to 1,000; ×/÷ by 2, 3, 4, 5, 10; tables to 5 × 10; repeated addition; sharing | ½, ¼, ¾ notation | m, kg, L; half-hours; notes up to R1,000 | Cube, cuboid, cylinder; simple surveys; picture graphs [mathunion](https://www.mathunion.org/fileadmin/ICMI/files/Other_activities/Database/Cambodia/Math-Curiculum_Grades_1_-_9.pdf) |
| 3 | To 10,000 (5-digit place value) | +/− to 10,000; tables to 10 × 10; 3-digit × 1-digit; division with remainder; factors | 1/10 to 1; numerator/denominator; compare halves, quarters, eighths | cm, dm, kg, g, *kham*, L, mL; time to the minute; **R10,000** | Perimeter; area with squares; language of chance; data from 3 sources [mathunion](https://www.mathunion.org/fileadmin/ICMI/files/Other_activities/Database/Cambodia/Math-Curiculum_Grades_1_-_9.pdf) |
| 4 | To 100,000; decimals to 1 place | Multi-digit ×, ÷ by 1 digit; estimation; calculator | Equivalent fractions (2, 4, 8) | km, mm; profit/loss; units of time | Angles, protractor, parallel lines; tally tables; missing numbers (3 + □ = 7) [mathunion](https://www.mathunion.org/fileadmin/ICMI/files/Other_activities/Database/Cambodia/Math-Curiculum_Grades_1_-_9.pdf) |
| 5–6 | Any size; primes | All four operations, multi-step | Fraction and decimal operations; percentages (G5–6) | Measuring precision | Area, volume, circle; tables and graphs; "pro-numerals" (early algebra) [mathunion](https://www.mathunion.org/fileadmin/ICMI/files/Other_activities/Database/Cambodia/Math-Curiculum_Grades_1_-_9.pdf) |

Grades 5–6 are summarized from the curriculum's G4–6 overview. Percentages, primes and pro-numerals are mentioned there, but I did not extract the detailed unit lists.

**Current materials.** Through STEPCam, UNESCO and MoEYS built Grades 1–3 early-grade math packages: a teacher guide, four student exercise books, a support book, "Happy Maths" videos and printable aids. These are "now used all across Cambodia". [unesco](https://www.unesco.org/en/articles/foundations-future-cambodia-transforming-early-grade-teaching-and-learning) A PTEC library listing describes the package as built on **CPA pedagogy**. [ptec](https://library.ptec.edu.kh/paths/early-grade-learning-package) A VVOB geometry manual (MoEYS-approved, 2021) is based on the **Primary Mathematics Curriculum Syllabus (2018)**. [vvob](https://cambodia.vvob.org/en/download/teaching-methodology-geometry-primary-level)

**Learning challenges (why to start early and conceptual):**
- The first EGMA (2015) found that Grade 1–3 students "lacked understanding on the concepts of mathematical contexts, but could answer questions related to solving procedures." [cdc-crdb](http://cdc-crdb.gov.kh/en/twg-jmi/sector_strategy/ESP2019-2023_EN.pdf)
- Grade 6 National Learning Assessment: students below basic proficiency in math rose from **49.2% (2016) to 74.2% (2021)** (the GPE Partnership Compact reports 74.3%). The MoEYS EQAD/UNICEF report (Marshall, April 2022), which tested more than 6,000 students in 230 schools in November 2021, found math scores "0.75 standard deviations lower than pre-pandemic levels", after 250 days of school closures.
- PISA 2022: only **12%** of 15-year-olds reached Level 2 in math (OECD average 69%). [oecd](https://www.oecd.org/en/publications/pisa-2022-results-volume-i-and-ii-country-notes_ed6fbcc5-en/cambodia_371ebd4a-en.html) In PISA-D (2017) the figure was **9.9%**, per MoEYS's "PISA 2022 Results for Cambodia" country report (Feb 2024).
- Positive signal: MoEYS reports that schools using the math package scored higher. Math rose by "12 scores" between 2019 and 2024 (sample: 860 schools with the package vs 480 without). [worldbank](https://thedocs.worldbank.org/en/doc/3743c71fda713ff5de1de2331a8dc703-0510022026/original/EN-Cambodia-LEAP-Structured-Pedagogy.pdf)

**What this means for us:** The gap is conceptual (place value, meaning of operations), not procedural. The first path must focus on Grade 1–2 number sense, taught visually, so it supports the CPA approach teachers already use.

### 4. Age-appropriate progression (recommended order)

| Stage (age / grade) | Strand sequence |
|---|---|
| 6–7 / G1 | Subitize 1–5 → count 0–10, zero → compare → number bonds to 5/10 → + and − within 10 → within 20 → tens and ones to 99 → halves and quarters → shapes and patterns → riel 50/100 |
| 7–8 / G2 | Place value to 1,000 → Arabic numerals → mental +/− strategies (make 10, split) → equal groups / arrays → sharing ÷ → odd/even, skip counting → m/kg/L → time → picture graphs |
| 8–9 / G3 | 4–5-digit place value → column algorithms → tables to 10 × 10 → division with remainder → unit fractions on a number line → perimeter and area → chance language |
| 9–12 / G4–6 | Fractions (equivalence → compare → add) → decimals (as tenths on a number line) → percentages (as "out of 100") → angles → area and volume → data tables and graphs → missing-number equations → simple probability |

Use one fixed representation per idea so that ideas build on each other: ten-frame → place-value blocks → number line (whole numbers, then fractions, then decimals) → bar model (fractions, percentages, word problems) → balance (equations).

### 5. Khmer language and typography on the web

- **Fonts:** Body text: **Kantumruy Pro** (variable, OFL, Khmer + Latin, by Tep Sovichet). Its redesign changed vertical metrics and proportions. Fallback: **Noto Sans Khmer** (OFL, multiple weights). [blogspot](http://fontskhmer.blogspot.com/) [fonthubs](https://www.fonthubs.com/en/fonts/kantumruy-pro) **Battambang** also works for reading text. Use **Moul** and similar display faces (Koulen, Bokor) only for short headings; Angkor Design warns they become "unreadable by the second sentence" in paragraphs. [angkordesign](https://www.angkordesign.com/tools/khmer-font-previewer/) Hanuman and Siemreap are serif text options; they are not needed for MVP. Avoid Khmer OS on the web (desktop font, not licensed for @font-face). [techflow-agency](https://www.techflow-agency.com/en/our-insights/khmer-fonts-for-website) Self-host with `next/font` and subset to Khmer + Latin.
- **Line height and size:** Khmer stacks subscript consonants (coeng) below and vowels above. Practitioner guides recommend **line-height 1.6–1.8** for Khmer, against about 1.4 for Latin. [techflow-agency](https://www.techflow-agency.com/en/our-insights/khmer-fonts-for-website) [angkordesign](https://www.angkordesign.com/tools/khmer-font-previewer/) Use **≥18 px body** for young readers and **≥24 px** for instructions. *(These are designer/agency guides, not standards, so confirm with a device test.)* Never clip text with a fixed height or `overflow:hidden` on buttons.
- **Line breaking:** Khmer has no spaces between words. `Intl.Segmenter` supports `"word"` granularity (Chrome 87, Safari 14.1, Firefox 125) but has **no line granularity**. A TC39 contributor notes Khmer needs line breaks at word boundaries. [github +3](https://github.com/tc39/proposal-intl-segmenter/issues/136) **Practice:** Insert zero-width spaces (U+200B) at word boundaries **when authoring**, as part of the content build step, using a dictionary segmenter (e.g., `Intl.Segmenter` in Node or a Khmer library). Do not segment at runtime. Strip ZWSP before comparing answers.
- **Numerals:** The MoEYS Grade 1 outcomes say "Read, count and write whole numbers up to 100 in **Khmer notation**". Arabic notation starts as its own Grade 2 unit ("Arabic/Hindu notation 1–10"), and both systems are used from Grade 3. [mathunion](https://www.mathunion.org/fileadmin/ICMI/files/Other_activities/Database/Cambodia/Math-Curiculum_Grades_1_-_9.pdf) **Rule:** Store numbers as numbers. Render with `Intl.NumberFormat('km-KH', { numberingSystem: 'khmr' })` for G1. Offer a per-child "១២៣ / 123" toggle. Introduce Arabic numerals as their own lesson in G2. Accept both digit forms in answers.
- **Input:** Do not depend on the device Khmer keyboard for answers. Build a large on-screen numeric keypad (Khmer or Arabic digits) and use tap/drag answers. This also avoids differences between Android and iOS keyboards.
- **i18n:** Use Khmer as the only UI locale at launch, with English kept as a developer/QA fallback. Use `next-intl` (or a simple typed dictionary) for UI strings. Lesson text lives inside the content files, not in the UI dictionary. Set `<html lang="km">`.
- **Audio/TTS:** Many 6-year-olds cannot read instructions yet, so audio is required for G1. Azure lists `km-KH-SreymomNeural` (female) and `km-KH-PisethNeural` (male). [microsoft](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support) [microsoft](https://learn.microsoft.com/en-us/answers/questions/6075781/does-azure-personal-voice-support-khmer-km-kh) Secondary sources report Google Cloud TTS has no Khmer voice. [github](https://github.com/peko0816/kruai/pull/68) [github](https://github.com/stefan-cambodia/Learn-kh) **Recommendation:** Pre-generate MP3s at build time (Azure). Have a native speaker review each clip, and re-record key lines with a human voice if the TTS sounds unnatural. Cache all audio offline. Do not call TTS at runtime.

### 6. Gamification without addiction

- **Risk evidence:** Kuo, Zhao & Scott, "The Evil Bird and the Right to Disconnect" (Proceedings of the ACM Interaction Design and Children Conference, June 2026), interviewed North American parent–child pairs using Duolingo. It found "goal drift" (engagement shifts "from mastery-oriented learning to metric maintenance") and "gamified obligation" (guilt when stopping). It names streaks a "moral ledger" and finds "streaks allow no breaks". Its main design principle is an "easy way out." The FTC staff report "Bringing Dark Patterns to Light" (15 Sept 2022) "found dark patterns used in a variety of industries and contexts, including e-commerce, cookie consent banners, children's apps, and subscription sales."
- **Rules for us:**
  1. XP is earned only by **learning actions** (finishing an attempt, fixing a mistake, review), never by time spent.
  2. **No loss-framed streaks.** Count "days learned this week", allow automatic rest days, and never show "you'll lose your streak."
  3. Achievements reward **mastery and effort** ("fixed 3 mistakes", "mastered numbers to 10").
  4. Daily challenge has one item, takes about 3 minutes, and can be skipped.
  5. Each session has a natural end ("Great work, see you tomorrow"), with no autoplay and no push notifications to children.
  6. No leaderboards, ads, purchases or social features in MVP.
  7. Parents see time spent.

### 7. Technology decision

**Device and network context:** StatCounter (Sept 2026) shows Android at **64.12%** of mobile OS share in Cambodia, though it was 55.74% in March 2025, so the split moves. [statcounter](https://gs.statcounter.com/os-market-share/mobile/cambodia/terrille.cloud) [statcounter](https://gs.statcounter.com/os-market-share/mobile/cambodia) Android versions are spread widely (11–16 each about 12–16%). [statcounter](https://gs.statcounter.com/android-version-market-share/mobile-tablet/cambodia/2025) DataReportal *Digital 2026* reports a median mobile download speed of **53.58 Mbps**, **67.3%** internet penetration (12.0 million users) and **73.4%** of the population living in rural areas. [datareportal](https://datareportal.com/reports/digital-2026-cambodia) Average speeds look fine, but a third of people are offline and rural coverage varies. **So design for mid/low-end Android Chrome, plan for offline use, and keep the JS budget small.**

| Layer | Choice | Why | Alternatives considered |
|---|---|---|---|
| Framework | **Next.js (App Router) + React + TypeScript** | One codebase for pages, API and static lesson pages. Typed content schema. Next's docs point to Serwist for offline PWAs. [nextjs](https://nextjs.org/docs/app/guides/progressive-web-apps) | Remix/React Router (fine, smaller ecosystem for PWA); Astro + React islands (great for static content, weaker for app state); ASP.NET Core + React (your strength, but two languages and two deploys) |
| Styling | **Tailwind CSS** + small design-token set | Fast, consistent, easy mobile-first layout. No runtime CSS cost. | CSS Modules (fine, slower to iterate) |
| Visuals | **SVG + React + Pointer Events** | Shapes are DOM nodes, so they are accessible (ARIA, focus), scale cleanly, are easy to hit-test and animate with CSS, and can be tested with Testing Library and Playwright. Our models (ten-frames, number lines, blocks, fractions) have few objects. | Canvas/PixiJS (only needed for hundreds of moving objects, and loses accessibility); JSXGraph/Mafs (good for graphs in later grades) |
| Drag & drop | **dnd-kit** (or a thin custom Pointer Events hook) | Touch + keyboard sensors and accessibility hooks. | react-dnd (HTML5 backend is weak on touch) |
| Animation | CSS transitions; **Motion** only where needed | Purposeful, light. Respect `prefers-reduced-motion`. | Rive/Lottie (for later celebration art) |
| DB | **PostgreSQL** | Relational progress data, JSONB for attempt payloads. | SQLite/Turso (simpler, fine for MVP but weaker multi-user hosting) |
| ORM | **Prisma 7** | Schema-first and migrations feel like EF Core. Prisma 7 (released 19 Nov 2025) replaced the Rust engine; Prisma's blog says the old engine was "roughly 14 MB (7 MB gzipped)" and the new Query Compiler "about 1.6 MB (600 KB gzipped)", an 85–90% reduction. | **Drizzle** (about 7–12 KB, better on edge/serverless). Switch if you deploy to edge runtimes. [translate](https://makerkit-dev.translate.goog/blog/tutorials/drizzle-vs-prisma?_x_tr_sl=en&_x_tr_tl=id&_x_tr_hl=id&_x_tr_pto=tc) [botmonster](https://botmonster.com/web-dev/drizzle-orm-vs-prisma-typescript-database-toolkit/) |
| Content | **JSON/YAML files in git + Zod schema + build-time validation** | Lessons are data, not code. Lessons get review, diff and versioning through PRs. No admin UI needed for MVP. | MDX (mixes code and content, harder for non-developers); headless CMS (later, for the admin phase) |
| Offline | **Serwist** (`@serwist/next`): precache app shell, lesson JSON, fonts, audio; IndexedDB queue for attempts | A child can finish a downloaded lesson offline and sync later. [daily](https://app.daily.dev/posts/build-a-next-js-16-pwa-with-true-offline-support-iyrolodea) | next-pwa (older); hand-written SW |
| Auth | Parent account (email/phone magic link or password) → child profiles with **no child PII** (nickname + avatar + grade) | Meets the draft PDPL requirement for parental consent for under-16s. [Substack](https://dgcbriefings.substack.com/p/cambodia-draft-law-on-personal-data) | Child accounts with email (avoid) |
| Hosting | **Vercel (or a Singapore VPS with Docker) + managed Postgres in Singapore** (Neon/Supabase/DO) | Closest major region to Cambodia. Simple CI/CD. | AWS (more ops); self-hosting in Cambodia (later) |
| Testing | **Vitest** (validators, schema, scheduling), **Testing Library** (activities), **Playwright** (mobile viewport e2e, offline mode) | Covers math correctness and interactions. | Jest |

**Build-tool note:** LogRocket says Serwist "requires Webpack" with Next.js 16, but Next's own guide says Serwist has examples for both Turbopack and webpack. [logrocket](https://blog.logrocket.com/nextjs-16-pwa-offline-support/) [nextjs](https://nextjs.org/docs/app/guides/progressive-web-apps) Check this during setup and use `next build --webpack` if needed.

**Privacy:** Cambodia's **draft** Law on Personal Data Protection (MPTC, final draft 23 June 2025) requires parent/guardian consent, verified "through available technology or other feasible means", for children **under 16**. It also requires data protection by default and has a 2-year transition. [Substack +2](https://dgcbriefings.substack.com/p/cambodia-draft-law-on-personal-data) As of the sources reviewed it is still a draft, but design for it now: collect minimum data, get parental consent at signup, use no third-party trackers, let parents delete data, and keep data in a nearby region with a documented cross-border basis.

**Content model (the key architectural decision):** The engine knows *activity types*. A lesson is just *data* that configures those types. A new lesson needs zero new components unless it needs a genuinely new interaction.

### 8. OpenSpec workflow (current "OPSX" commands)

- Install: `npm install -g @fission-ai/openspec@latest`, then run `openspec init --tools claude` in the repo. This installs `/opsx:*` slash commands and skills into `.claude/`, plus `openspec/config.yaml` (schema `spec-driven`). [github +2](https://github.com/Fission-AI/OpenSpec/blob/main/docs/how-commands-work.md)
- Core loop: `/opsx:explore` (optional) → **`/opsx:propose <change>`** creates `openspec/changes/<name>/` with `proposal.md`, delta `specs/`, `design.md` and `tasks.md` → **you review** → **`/opsx:apply`** works through `tasks.md` → **`/opsx:archive`** merges the delta specs into `openspec/specs/` and moves the change to `openspec/changes/archive/<date>-<name>/`. [skillgild](https://skillgild.dev/learn/openspec)
- Useful CLI commands: `openspec list`, `openspec status --change <name>`, `openspec validate <name>`. Expanded commands (`/opsx:new`, `/opsx:ff`, `/opsx:verify`) need `openspec config profile` + `openspec update`. Old `/openspec:proposal` tutorials are out of date. [sparkfabrik +2](https://playbook.sparkfabrik.com/ai-development/openspec-reference)
- `openspec/specs/` starts empty and grows through archived changes. [sparkfabrik](https://playbook.sparkfabrik.com/ai-development/openspec-reference) So **do not hand-write all specs first.** Each capability's spec is created by its first change.

---

## Recommended Product Direction

**Name the idea:** "Learn math by touching it, in Khmer." Short sessions (5–8 min), each one or two lessons plus a review card.

1. **Target first:** Ages 6–8 (G1–G2) learning at home on a parent's Android phone, offline after the first load. Grades 3–6 come later along the same strands.
2. **Lesson shape (fixed 8-step template):** Hook problem (picture + audio) → explore (manipulate) → attempt → instant feedback → up to 3 progressive hints → visual explanation in simple Khmer → follow-up challenge (new numbers, fewer supports) → mastery check that feeds the review queue.
3. **Placement by skill, not age:** The child picks a grade, then a 5-item check places them into the path. They can always go back or skip ahead.
4. **Mastery:** A skill counts as "learned" after 2 correct independent challenges in different sessions. Spaced review then brings it back after 1, 3, 7 and 21 days.
5. **Culture:** Use real riel notes (100–20,000 are common; coins are rarely used), [Wikipedia](https://en.wikipedia.org/wiki/Cambodian_riel) [manorfx](https://www.manorfx.com/blog/cambodia-currency-what-to-know-before-you-go/) Cambodian fruit (mango, rambutan, longan, banana), the market, tuk-tuks and motos, school, family members' ages and the krama pattern. A Khmer teacher reviews all wording.
6. **Parents (thin, MVP-late):** One screen with skills learned, skills to practice, minutes per day.
7. **Admin:** No admin UI in MVP. Content is authored in YAML through git, a validation CLI and a preview route. Build the admin UI only once non-developers write lessons.

## Proposed Curriculum Structure

`Grade band → Strand → Unit → Lesson → Steps (activities)`, with each lesson tagged by `grade`, `strand`, `moeysRef` (e.g., "G1 U7") and `skills[]` (for prerequisites and review).

Strands (aligned to MoEYS plus brief): Number Sense · Addition & Subtraction · Multiplication & Division · Fractions · Decimals · Percentages · Patterns & Algebra · Measurement (incl. money and time) · Geometry · Data & Chance · Reasoning (woven into all, plus puzzle lessons).

### First learning path: "លេខដំបូងរបស់ខ្ញុំ" (My First Numbers), Grade 1, 12 lessons

| # | Lesson (MoEYS ref) | Learning objective | Cambodian context | Activity type(s) |
|---|---|---|---|---|
| 1 | Quick look 1–5 (G1 U3) | Recognize 1–5 without counting (subitize) | Mangoes on a market tray flash for 2 s | `count-tap` + `choice-pictorial` |
| 2 | Count 0–10 and zero (G1 U5) | Match numeral ↔ quantity; zero means none | Rambutans in a basket; empty basket = ០ | `ten-frame` (fill) + `numeral-match` |
| 3 | Five and some more (G1 U6) | Use 5 as a reference ("7 is 2 more than 5") | Fingers / 2 rows of a ten-frame | `ten-frame` (read) |
| 4 | More, less, same (G1 U6, U11) | Compare to 10 with <, >, = | Two kids' bags of longan at the school gate | `compare-groups` → `symbol-pick` |
| 5 | Make 5, make 10 (G1 U7) | Number bonds | "Here are 3 chairs. How many more to make 5?" (from the curriculum), [mathunion](https://www.mathunion.org/fileadmin/ICMI/files/Other_activities/Database/Cambodia/Math-Curiculum_Grades_1_-_9.pdf) family dinner | `ten-frame` (complete) + `number-bond` |
| 6 | Putting together (G1 U14) | Addition within 10 as joining; 3 + 2 = 2 + 3 | Drag bananas into mom's basket | `drag-to-group` → `equation-fill` |
| 7 | Taking away (G1 U15) | Subtraction within 10 as removing | "How many oranges are left if we take away 2?" (from the curriculum) [mathunion](https://www.mathunion.org/fileadmin/ICMI/files/Other_activities/Database/Cambodia/Math-Curiculum_Grades_1_-_9.pdf) | `drag-out` → `equation-fill` |
| 8 | Tuk-tuk jumps (G1 U16) | +/− within 20 on a number path, then a number line | Tuk-tuk drives forward/back along street stops | `number-line` (jump) |
| 9 | Tens and ones (G1 U8) | Model 2-digit numbers as tens + ones | Bundle sticks of 10 (rubber band); ages of family members | `place-value-blocks` |
| 10 | Patterns (G1 U4) | Extend and make repeating patterns (AB, AAB) | Krama check pattern; flower garland | `pattern-sequence` |
| 11 | Halves (G1 U13, U24) | Equal vs not-equal halves | Share a num pang / mango fairly with a sibling | `partition` (fraction cut) + `choice-pictorial` |
| 12 | Paying with riel (G1 U17) | Count R50 / R100 notes up to a few hundred | Buy a 300-riel snack (illustrative price) | `money-pay` |

Each lesson has 6–10 steps, including at least 1 real-life problem and 1 independent challenge. Lessons 3–12 start with 1–2 retrieval items from earlier lessons.

## Reusable Activity Engine

**Activity types (MVP set first, in bold):**
**`count-tap`**, **`ten-frame`** (fill/read/complete), **`number-line`** (place/jump, whole numbers now, fractions/decimals later), **`drag-to-group`** (+ `drag-out`), **`equation-fill`** (tap tiles into blanks), **`choice-pictorial`** (multiple choice with images/audio), **`numeric-keypad`** (Khmer/Arabic digits), **`compare-groups`**, `number-bond`, `place-value-blocks`, `pattern-sequence`, `partition` (fraction cut/shade), `money-pay`, `shape-sort`; later: `array-groups` (×/÷), `bar-model`, `balance-equation`, `clock`, `measure-ruler`, `picture-graph`, `logic-grid`.

**Engine contract (each type implements):** `render(config, state)`, `onInteract → state`, `evaluate(state, answerSpec) → {correct, misconceptionId?}`, `hint(level)`. Answer checking is **declarative and pure**, so it can be unit-tested without the UI.

**Draft content schema (YAML, validated by Zod at build):**

```yaml
id: g1-make-ten            # stable slug
version: 3
title: { km: "បង្កើតដប់" }
grade: 1
strand: number-sense
moeysRef: ["G1-U7"]
skills: [bond-10]           # used for prerequisites and spaced review
prerequisites: [count-0-10]
estimatedMinutes: 6
numerals: khmer             # khmer | arabic | child-preference
steps:
  - id: hook
    type: intro
    text: { km: "ម៉ាក់ត្រូវការ​ចាន ១០។ មានចានប៉ុន្មាន​ហើយ?" }  # ZWSP inserted by build
    image: plates-7
    audio: auto              # build step generates or uses a recorded mp3
  - id: s1
    type: activity
    activity: ten-frame
    mode: complete
    params: { given: { randInt: [3, 8] } }   # variation generator
    answer: { kind: equals, expr: "10 - given" }
    feedback:
      correct: { km: "ត្រឹមត្រូវ! {given} និង {answer} ស្មើ ១០" }
      misconceptions:
        - when: { equals: "given" }
          id: copied-given
          text: { km: "មើលប្រអប់ទទេ — រាប់តែប្រអប់ទទេ" }
    hints:
      - { km: "រាប់ប្រអប់ទទេ" }
      - { km: "ចាប់ផ្តើមពី {given} រាប់បន្តដល់ ១០" }
      - { show: highlight-empty-cells }
  - id: explain
    type: explain
    visual: { activity: ten-frame, mode: read, params: { given: 7 } }
    text: { km: "៧ និង ៣ ជាគូដែលបង្កើតបាន ១០" }
  - id: challenge
    type: activity
    activity: equation-fill
    supports: none           # objects removed (abstract stage)
    params: { a: { randInt: [1, 9] } }
    template: "{a} + □ = 10"
    answer: { kind: equals, expr: "10 - a" }
review:
  items: [s1, challenge]     # eligible for spaced review
reviewStatus: { math: approved, khmer: approved, reviewer: "..." }  # publish gate
```

*(The Khmer strings above are placeholders to show structure. Every live string needs native teacher review.)*

**Data split:** Lesson files are static, precached and versioned. The DB stores only `parent`, `child_profile`, `attempt` (lessonId, version, stepId, correct, hintsUsed, ms, misconceptionId), `skill_state` (mastery, nextReviewAt), `achievement_award`.

## MVP Definition

**In scope (ordered by the brief's priorities):**
1. Khmer UI: fonts, line-height, ZWSP build step, Khmer numerals and toggle, audio for every instruction.
2. Lesson player with the 8-step template.
3. Activity engine with 8 MVP types.
4. SVG visual models.
5. Instant feedback, misconception messages, 3-level hints.
6. Progressive difficulty through parameterized variations and support fading.
7. Progress: per-skill mastery, spaced review queue, path map.
8. Mobile-first PWA, offline lessons and sync.

Also in scope: landing page, parent sign-up with consent → child profile (nickname, avatar, grade), placement check, dashboard, 12-lesson path, basic achievements (about 5) and gentle XP, a one-item daily challenge, a minimal parent overview screen (could ship in milestone 3), and a content validation CLI with a preview route.

**Out of scope for MVP:** AI tutor, admin CMS, multiplayer/social/leaderboards, push notifications, purchases, complex analytics, teacher/classroom accounts, Grades 3–6 content, native apps, microservices.

## Initial OpenSpec Specifications (capabilities)

Create these through changes, not all at once. Format: `### Requirement:` with SHALL statements, plus `#### Scenario:` with WHEN/THEN.

| Capability (`openspec/specs/<name>/spec.md`) | Key requirements | Example scenario |
|---|---|---|
| `khmer-localization` | UI SHALL be Khmer with `lang="km"`. Khmer text SHALL use the configured fonts at line-height ≥1.7. Numbers SHALL render per the child's numeral setting. Answers SHALL accept Khmer and Arabic digits. | WHEN a G1 child sees a count of 7 THEN it shows "៧". WHEN the child types "7" or "៧" THEN both are marked correct. |
| `lesson-content` | Lessons SHALL be files validated against the schema at build. Invalid lessons SHALL fail CI. Only `reviewStatus.math=approved` and `khmer=approved` lessons SHALL be published. | WHEN a lesson's `answer.expr` gives a non-integer for integer params THEN validation fails with the lesson and step id. |
| `activity-engine` | Each activity type SHALL evaluate answers with a pure function. It SHALL support touch and keyboard. Each type SHALL have unit tests for correct, incorrect and misconception cases. | WHEN `ten-frame` complete has given = 7 and the child fills 3 THEN the result is correct. WHEN the child fills 7 THEN misconception `copied-given` is shown. |
| `lesson-player` | It SHALL play steps in order, show progress, allow exit at any step without penalty, and resume at the last step. | WHEN the child closes the app mid-lesson and reopens it THEN the lesson resumes at the same step. |
| `feedback-hints` | Feedback SHALL appear in ≤100 ms after submit. Hints SHALL unlock in order after a wrong attempt or on request (max 3). The final hint SHALL show the model, not just the answer. | WHEN the child answers wrong twice THEN hint 2 is offered and an "explain" option appears. |
| `progress-mastery` | Attempts SHALL be stored locally and synced. A skill SHALL be mastered after 2 independent correct challenges in separate sessions. Review SHALL be scheduled at 1/3/7/21 days. | WHEN a mastered skill's `nextReviewAt` has passed THEN it appears in today's review. |
| `offline-pwa` | App shell, downloaded lessons, fonts and audio SHALL work offline. Attempts SHALL queue in IndexedDB and sync when online. | WHEN the device is offline and the child completes a lesson THEN progress is saved. WHEN back online THEN it syncs without duplicates. |
| `profiles-consent` | Only a parent SHALL create an account and consent. Child profiles SHALL store no name/birthdate/photo beyond a nickname. Parents SHALL be able to delete a child's data. | WHEN a parent deletes a profile THEN all attempts for it are removed. |
| `rewards` | XP SHALL be given only for learning actions. There SHALL be no loss-framed streak messages and no notifications to children. Sessions SHALL show a natural stop point. | WHEN the child misses a day THEN no warning or lost-streak message is shown. |
| `learning-path` | It SHALL show lessons with locked/available/mastered state. Placement SHALL recommend a start lesson. The child MAY open any earlier lesson. | WHEN placement shows bonds-to-10 mastered THEN the path starts at lesson 6. |

## First Implementation Milestone: "Walking skeleton: one Khmer lesson, end-to-end, offline"

The goal is to prove the riskiest parts first: Khmer rendering, the content→engine model, touch interactions and offline use. Each item is one OpenSpec change (`/opsx:propose` → review → `/opsx:apply` → test → `/opsx:archive`).

1. **`setup-project`**: Next.js + TS + Tailwind + ESLint/Prettier + Vitest + Playwright. README covers install, run, test. CI runs lint and tests. *Done when* `npm test` and `npm run build` pass in CI.
2. **`add-khmer-foundation`**: Self-hosted Kantumruy Pro + Noto Sans Khmer, design tokens (type scale, line-height), `<html lang="km">`, `formatNumber()` with the `khmr` numbering system, digit normalization. *Done when* a Playwright screenshot on a 360×800 Android viewport shows no clipped coeng/vowels, and unit tests pass for ០–៩ ↔ 0–9.
3. **`add-lesson-content-schema`**: Zod schema, YAML loader, ZWSP segmentation build step, `npm run content:validate`, `/preview/[lessonId]`. *Done when* invalid sample lessons fail with clear errors.
4. **`add-activity-engine-core`**: Engine contract + `ten-frame`, `number-line` (jump), `equation-fill`, all SVG and touch/keyboard. *Done when* each type has passing pure evaluate tests and a Testing Library interaction test.
5. **`add-lesson-player-and-hints`**: 8-step player, feedback, 3 hints, misconception messages, resume. *Done when* lesson 5 ("Make 5, make 10") is playable start to finish on a phone.
6. **`add-local-progress-offline`**: Serwist precache (shell, lesson, fonts, audio), IndexedDB attempts, offline fallback page. *Done when* the Playwright offline test completes a lesson and progress persists after reload.
7. **Human checkpoint:** A Khmer primary teacher plays lesson 5 on a low-end Android phone and checks wording, audio and math. Fix the findings before Milestone 2.

**Milestone 2:** Postgres + Prisma, parent auth and consent, child profiles, sync, path map, 5 more activity types, lessons 1–12. **Milestone 3:** Review scheduler, achievements and XP, daily challenge, parent overview, accessibility and performance pass.

## Risks and Open Questions

| Risk / question | Why it matters | Mitigation |
|---|---|---|
| **Natural Khmer wording** | The brief forbids machine-translated tone. Kids' vocabulary differs from adult text. | Recruit 1–2 Khmer primary teachers as paid reviewers. Use the `reviewStatus.khmer` publish gate. Build a glossary of math terms from MoEYS textbooks. |
| **Math correctness** | Wrong answers destroy trust. | Pure evaluate functions with tests, schema checks on generated params (e.g., no negative results in G1), plus `reviewStatus.math`. |
| **Curriculum version** | The Grades 1–9 PDF used here is older. The current syllabus (2018) and new textbooks are in Khmer and may differ. [unisla](https://jurnalpendidikan.unisla.ac.id/index.php/VoJ/article/view/1113) [vvob](https://cambodia.vvob.org/en/download/teaching-methodology-geometry-primary-level) | Get the current MoEYS G1–3 textbooks and the 2018 syllabus (Khmer). Re-check the `moeysRef` tags. |
| **Khmer numerals policy** | Families may expect Arabic numerals early, or Khmer numerals only. | Default to Khmer for G1 with a toggle. Test with parents. |
| **TTS quality for children** | Only Azure offers Khmer neural voices. [github](https://github.com/peko0816/kruai/pull/68) [github](https://github.com/stefan-cambodia/Learn-kh) Tone may sound adult or robotic. | Pre-generate, review and re-record key lines with a human voice. Keep audio files small (Opus/MP3 at 32–48 kbps). |
| **Line breaking** | Without ZWSP, long Khmer lines overflow or break badly. [github](https://github.com/sungkhum/tiptap-khmer-line-breaker) | ZWSP build step + visual tests at 320–414 px widths. |
| **Serwist + Turbopack** | Sources disagree on compatibility. [logrocket](https://blog.logrocket.com/nextjs-16-pwa-offline-support/) [nextjs](https://nextjs.org/docs/app/guides/progressive-web-apps) | Spike in Milestone 1, step 6. Fall back to webpack build. |
| **Privacy law timing** | The PDPL is a draft (2025). [jdsupra](https://www.jdsupra.com/legalnews/cambodia-moves-to-enact-comprehensive-1769544/) Final text may change. | Collect minimal data with parental consent now. Review again when the law is enacted. |
| **Low-end devices** | Heavy JS or animation causes lag. | JS budget (e.g., <200 KB per lesson route), SVG with few nodes, `prefers-reduced-motion`, test on a real low-cost Android phone. |
| **Open:** Business model and distribution (free? school partners?), and whether to align with the MoEYS/UNESCO "Happy Maths" materials | This affects login design and content licensing. | Decide before Milestone 2. Contact MoEYS/UNESCO STEPCam about alignment or endorsement. |

## Caveats

- Brilliant's "6x more effective" claim is marketing; [brilliant](https://brilliant.org/faq/) I did not use it as evidence.
- Khmer line-height and font advice comes from designer and agency guides, not a standard. Confirm it with device testing.
- Device share data (StatCounter) is based on web traffic and changes from month to month. [statcounter](https://gs.statcounter.com/os-market-share/mobile/cambodia/terrille.cloud) [statcounter](https://gs.statcounter.com/os-market-share/mobile/cambodia)
- Grade 5–6 topic details are summarized from the curriculum overview. Check them against the current textbooks before building those paths.