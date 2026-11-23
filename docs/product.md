# Product Direction — Khmer Math Learning Platform

Khmer-first, mobile-first, offline-capable interactive math platform for Cambodian children learning at home on a parent's phone. Launch targets **Grade 1–2 (ages 6–8)** under a parent account, starting with Grade 1 number sense.

> For curriculum map, content schema, and MVP scope see [discovery.md](./discovery.md). For stack, Khmer typography/numeral/audio constraints, the 8-step lesson template, and reward rules see [openspec/config.yaml](../openspec/config.yaml).

---

## Core User Journeys

### 1. Parent Journeys

**A. Onboarding & Child Setup**
1. Open the Khmer landing page and see what the child will learn (short interactive sample or preview).
2. Create a parent account (email or phone) and confirm explicit parental consent for under-16 use.
3. Add one or more child profiles using only a nickname, avatar, and grade (no child PII).
4. Hand the device to the child on the child's home screen.

**B. Checking Progress & Managing Profiles**
1. Open the Parent Overview from a simple parent gate (prevents accidental child entry).
2. Review a single, calm summary per child:
   - Skills mastered and current position on the learning path.
   - Skills needing practice.
   - Time spent learning (minutes per day/week).
3. Adjust per-child settings (such as the Khmer `១២៣` / Arabic `123` numeral toggle), add/edit profiles, or permanently delete a child's profile and learning data.

### 2. Child Journeys

**A. First Session (Placement)**
1. Tap their avatar to enter their profile.
2. Complete a short 5-item visual/audio placement check (skippable).
3. Land on the learning path at the recommended starting lesson, with freedom to revisit earlier lessons or explore ahead.

**B. Daily Learning Session (5–8 minutes)**
1. Open the child dashboard showing:
   - **Next lesson** on the path (primary action).
   - **Today's review** card (spaced retrieval of previously learned skills, when due).
   - **Daily challenge** (one optional ~3-minute problem; always skippable).
2. Play through a lesson following the 8-step concrete → pictorial → abstract flow (see [openspec/config.yaml](../openspec/config.yaml)).
3. Receive immediate, encouraging feedback; request progressive hints when stuck without penalty.
4. End at a calm, natural stop screen ("Great work, see you tomorrow") showing mastery progress.

**C. Exiting Early & Offline Use**
1. Exit any lesson at any step without penalty; returning resumes on the exact same step.
2. Play downloaded lessons with no internet connection; completed attempts save locally and sync silently once reconnected.

---

## UI/UX Direction

### Visual Tone & Brand Feel
- **Modern, tactile, and calm:** Visually inviting for ages 6–8 without feeling noisy, cluttered, or overly childish.
- **Interaction over text:** Inspired by Brilliant's clarity and active problem-solving, with original Cambodian visual language (real riel notes, local fruit, market scenes, tuk-tuks, krama patterns).
- **Consistent visual models:** Reuse a small, recognizable set of mathematical manipulatives (ten-frames, number paths/lines, blocks, fraction partitions) so children transfer understanding across topics instead of re-learning UI mechanics.

### Mobile-First Layout & Ergonomics
- **Phone-first (360×800 Android baseline):** Single-column focus with one task per screen, generous whitespace, and zero horizontal scrolling; scales cleanly to tablets and desktop.
- **Thumb-friendly controls:** Touch targets ≥48×48 px, wide spacing between tappable choices to prevent mis-taps, and primary actions anchored in the lower third of the screen.
- **No device keyboard dependency:** All answers use direct manipulation (tap, drag) or a large on-screen numeric keypad.

### Interaction, Audio & Accessibility
- **Audio-first for early readers:** Every Grade 1 prompt has a prominent, replayable speaker button so 6-year-olds do not need fluent reading skills to participate.
- **Fast, purposeful motion:** Instant visual response to touch (≤100 ms feedback on submit), gentle CSS transitions that clarify math transformations (e.g., bundling ten ones into a ten-bar), and full respect for `prefers-reduced-motion`.
- **Accessible by default:** High contrast, clear focus indicators, keyboard navigation, and semantic labels across interactive visuals.
- **Typography & numerals:** Follow the Khmer font, line-height, ZWSP, and numeral rules in [openspec/config.yaml](../openspec/config.yaml) so stacked vowels and subscript consonants never clip.

### Calm Session Pacing
- Always show a clear step progress indicator inside a lesson and a clear mastered/available/locked state on the path.
- Frame errors as clues, never punishments—warm tone, specific visual hints, and zero countdown pressure by default.
- Follow the non-addictive reward rules in [openspec/config.yaml](../openspec/config.yaml) (no loss-framed streaks, no autoplay, no child notifications).
