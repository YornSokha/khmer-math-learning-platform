"use client";

import { FormattedNumber } from "@/components/khmer/FormattedNumber";
import { t } from "@/lib/i18n/messages";
import type { RewardSummary } from "@/lib/rewards/engine";

export interface CalmRewardsSummaryProps {
  rewards: RewardSummary;
}

const WEEK_SLOTS = [1, 2, 3, 4, 5, 6, 7] as const;

export function CalmRewardsSummary({ rewards }: CalmRewardsSummaryProps) {
  return (
    <section
      aria-labelledby="calm-rewards-heading"
      data-testid="calm-rewards-summary"
      data-total-xp={rewards.totalXp}
      data-days-this-week={rewards.daysLearnedThisWeek}
      className="space-y-4 rounded-2xl border border-border bg-surface-card p-5 shadow-xs"
    >
      <h2 id="calm-rewards-heading" className="text-khmer-body font-bold text-ink">
        {t("rewardsHeading")}
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-accent-soft p-3.5">
          <p className="text-sm font-medium text-ink-muted">{t("rewardsXpLabel")}</p>
          <p
            data-testid="rewards-xp-value"
            className="mt-1 text-khmer-instruction font-bold text-accent"
          >
            <FormattedNumber value={rewards.totalXp} /> XP
          </p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-3.5">
          <div className="flex items-baseline justify-between gap-2">
            <p className="text-sm font-medium text-ink-muted">{t("rewardsDaysThisWeekLabel")}</p>
            <p data-testid="rewards-days-value" className="text-khmer-body font-bold text-ink">
              <FormattedNumber value={rewards.daysLearnedThisWeek} /> /{" "}
              <FormattedNumber value={7} />
            </p>
          </div>
          <div aria-hidden="true" className="mt-2 flex items-center gap-1.5">
            {WEEK_SLOTS.map((slot) => {
              const filled = slot <= rewards.daysLearnedThisWeek;
              return (
                <span
                  key={slot}
                  className={`h-3 flex-1 rounded-full ${filled ? "bg-accent" : "bg-border"}`}
                />
              );
            })}
          </div>
          <p className="mt-1.5 text-xs text-ink-muted">{t("rewardsRestDayNote")}</p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-semibold text-ink-muted">
          {t("rewardsAchievementsLabel")} (
          <FormattedNumber value={rewards.earnedAchievementIds.length} /> /{" "}
          <FormattedNumber value={rewards.achievements.length} />)
        </p>

        <ul
          className="grid grid-cols-1 gap-2 sm:grid-cols-2"
          data-testid="rewards-achievements-list"
        >
          {rewards.achievements.map((achievement) => (
            <li
              key={achievement.id}
              data-testid={`achievement-badge-${achievement.id}`}
              data-earned={achievement.earned ? "true" : "false"}
              className={`flex items-start gap-2.5 rounded-xl border p-3 ${
                achievement.earned
                  ? "border-emerald-300 bg-emerald-50/70 text-emerald-950"
                  : "border-border bg-surface text-ink-muted opacity-80"
              }`}
            >
              <span aria-hidden="true" className="text-xl leading-none">
                {achievement.icon}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold leading-[1.6]">
                  {achievement.titleKm}
                  {achievement.earned && (
                    <span className="ml-1.5 text-xs font-semibold text-emerald-800">
                      ✓ {t("rewardsAchievementUnlocked")}
                    </span>
                  )}
                </p>
                <p className="text-xs leading-[1.6]">{achievement.descriptionKm}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
