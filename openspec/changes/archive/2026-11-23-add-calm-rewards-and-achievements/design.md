# Design: Calm Anti-Addictive Rewards & Achievements

## 1. Pure Rewards Engine (`src/lib/rewards/engine.ts`)

- **Constants:**
  - `XP_PER_CORRECT_ATTEMPT = 10`
  - `XP_PER_FIXED_MISTAKE = 5`
  - `XP_PER_COMPLETED_LESSON = 15`
  - `XP_PER_DAILY_CHALLENGE = 15`
- **Fixed-mistake detection (`countFixedMistakes`):**
  - Chronologically walks attempts grouped by `${lessonId}::${stepId}`: whenever an incorrect attempt is later followed by a correct attempt on the same step, increments fixed mistakes (and takes `Math.max` with summed `completions[].fixedMistakes` so locally recorded completions without raw attempts still count accurately).
- **Weekly rhythm (`computeDaysLearnedThisWeek`):**
  - Computes the 7 UTC date keys ending at `toUtcDateKey(now)` (today and the preceding 6 days).
  - Collects unique date keys from `attempts` and `completions` that fall within those 7 days.
  - Returns `{ daysLearnedThisWeek, activeDateKeys, windowDateKeys }` — automatic rest days are built in, with zero streak resets or warnings.
- **Achievement catalog (`ACHIEVEMENT_CATALOG`, 5 achievements):**
  1. `first-lesson` — "ជំហានដំបូង" (Completed your first lesson)
  2. `mistake-fixer` — "អ្នកកែកំហុសពូកែ" (Fixed 3 mistakes)
  3. `master-bonds-10` — "ជំនាញលេខដល់ ១០" (Mastered a skill or completed Make 10)
  4. `review-champion` — "អ្នករំលឹកស្មោះត្រង់" (Completed a spaced review)
  5. `calm-three-days` — "រៀនស្ងប់ស្ងាត់ ៣ ថ្ងៃ" (Learned on 3 days this week)
- `evaluateRewards({ attempts, completions, skillStates, dailyChallengeHistory, now })`:
  - Pure function used identically on the client (IndexedDB + localStorage) and on the server (synced DB attempts + skill states).

## 2. Backend Sync & Progress Integration

- `POST /api/sync/attempts`:
  - After updating `SkillState`s, loads the child's full attempt list (already lightweight per child) + updated `skillStates`, evaluates `evaluateRewards(...)`, and calls `store.awardAchievement(child.id, achievementId)` for every earned achievement. Because `awardAchievement` uses `upsert` / unique `(childProfileId, achievementId)`, retries are 100% idempotent.
  - Includes `achievements` in the JSON response.
- `GET /api/children/[childId]/progress`:
  - Loads `store.listAchievementsForChild(child.id)` and returns `achievements` (`{ achievementId, awardedAt }[]`) along with `rewards` (`{ totalXp, daysLearnedThisWeek }`).

## 3. Child Dashboard UI (`src/components/rewards/CalmRewardsSummary.tsx`)

- Rendered inside `/learn` (`LearningPathView.tsx`) using local IndexedDB attempts, lesson completions, computed skill states, and daily challenge history.
- Shows:
  - Total learning XP (formatted via `<FormattedNumber />`).
  - Calm weekly rhythm: "ថ្ងៃរៀនសប្តាហ៍នេះ: X / ៧" with 7 soft dots (never flames, never countdowns, never missed-day alerts).
  - Compact grid of the 5 mastery/effort achievements showing unlocked badges with subtle emerald styling and remaining ones neutrally.
  - Strictly excludes time spent (`minutesToday` / `minutesLast7Days` stay exclusively on `/parent`).
