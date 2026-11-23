"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useState } from "react";
import { FormattedNumber } from "@/components/khmer/FormattedNumber";
import { t } from "@/lib/i18n/messages";
import type { NumeralSystem } from "@/lib/khmer/numerals";
import type { ParentProgressSummary } from "@/lib/mastery/scheduler";
import type { PublicChildProfile, PublicParent } from "@/lib/server/store";
import type { ChildAvatarId } from "@/lib/server/validation";
import { getPendingAttempts } from "@/lib/storage/progress-db";
import { syncLocalAttemptsForChild } from "@/lib/storage/sync-client";
import { useActiveChild } from "./ActiveChildProvider";
import { CHILD_AVATARS, ChildAvatar } from "./ChildAvatar";

interface AuthMeResponse {
  parent: PublicParent | null;
  children: PublicChildProfile[];
}

interface ChildProgressResponse {
  summary: ParentProgressSummary;
}

export function ParentPortal() {
  const router = useRouter();
  const { activeChild, setActiveChild } = useActiveChild();

  const [loading, setLoading] = useState(true);
  const [parent, setParent] = useState<PublicParent | null>(null);
  const [children, setChildren] = useState<PublicChildProfile[]>([]);
  const [progressByChildId, setProgressByChildId] = useState<Record<string, ParentProgressSummary>>(
    {},
  );
  const [pendingLocalCount, setPendingLocalCount] = useState(0);
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Auth form state
  const [authTab, setAuthTab] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [submittingAuth, setSubmittingAuth] = useState(false);

  // Add child form state
  const [nickname, setNickname] = useState("");
  const [avatarId, setAvatarId] = useState<ChildAvatarId>("mango");
  const [grade, setGrade] = useState<1 | 2>(1);
  const [numeralPref, setNumeralPref] = useState<NumeralSystem>("khmer");
  const [childError, setChildError] = useState<string | null>(null);
  const [submittingChild, setSubmittingChild] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const loadChildrenProgress = useCallback(async (childList: PublicChildProfile[]) => {
    const entries = await Promise.all(
      childList.map(async (child) => {
        try {
          const res = await fetch(`/api/children/${child.id}/progress`, {
            credentials: "same-origin",
          });
          if (!res.ok) return null;
          const data = (await res.json()) as ChildProgressResponse;
          return [child.id, data.summary] as const;
        } catch {
          return null;
        }
      }),
    );

    const map: Record<string, ParentProgressSummary> = {};
    for (const entry of entries) {
      if (entry) {
        map[entry[0]] = entry[1];
      }
    }
    setProgressByChildId(map);
  }, []);

  const refreshPendingLocalCount = useCallback(async () => {
    const pending = await getPendingAttempts();
    setPendingLocalCount(pending.length);
  }, []);

  const loadSession = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { credentials: "same-origin" });
      if (!res.ok) {
        return;
      }
      const data = (await res.json()) as AuthMeResponse;
      setParent(data.parent);
      setChildren(data.children);
      if (data.parent && data.children.length > 0) {
        await loadChildrenProgress(data.children);
      }
      await refreshPendingLocalCount();
    } finally {
      setLoading(false);
    }
  }, [loadChildrenProgress, refreshPendingLocalCount]);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  async function handleAuthSubmit(event: FormEvent) {
    event.preventDefault();
    setAuthError(null);

    if (authTab === "signup" && !consentAccepted) {
      setAuthError(t("parentConsentRequiredError"));
      return;
    }

    setSubmittingAuth(true);
    try {
      const endpoint = authTab === "signup" ? "/api/auth/signup" : "/api/auth/login";
      const payload =
        authTab === "signup" ? { email, password, consentAccepted } : { email, password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(payload),
      });

      const data = (await res.json()) as Partial<AuthMeResponse> & { error?: string };
      if (!res.ok || !data.parent) {
        setAuthError(data.error ?? t("parentErrorGeneric"));
        return;
      }

      const nextChildren = data.children ?? [];
      setParent(data.parent);
      setChildren(nextChildren);
      setPassword("");
      if (nextChildren.length > 0) {
        await loadChildrenProgress(nextChildren);
      }
      await refreshPendingLocalCount();
    } catch {
      setAuthError(t("parentErrorGeneric"));
    } finally {
      setSubmittingAuth(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "same-origin" });
    setParent(null);
    setChildren([]);
    setProgressByChildId({});
    setActiveChild(null);
  }

  async function handleAddChild(event: FormEvent) {
    event.preventDefault();
    setChildError(null);
    if (!nickname.trim()) {
      return;
    }

    setSubmittingChild(true);
    try {
      const res = await fetch("/api/children", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          nickname: nickname.trim(),
          avatarId,
          grade,
          numeralPref,
        }),
      });

      const data = (await res.json()) as { child?: PublicChildProfile; error?: string };
      if (!res.ok || !data.child) {
        setChildError(data.error ?? t("parentErrorGeneric"));
        return;
      }

      const nextChildren = [...children, data.child];
      setChildren(nextChildren);
      setNickname("");
      setAvatarId("mango");
      setGrade(1);
      setNumeralPref("khmer");
      await loadChildrenProgress([data.child]);
    } catch {
      setChildError(t("parentErrorGeneric"));
    } finally {
      setSubmittingChild(false);
    }
  }

  async function handleToggleChildNumerals(child: PublicChildProfile) {
    const nextPref: NumeralSystem = child.numeralPref === "khmer" ? "arabic" : "khmer";
    const res = await fetch(`/api/children/${child.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ numeralPref: nextPref }),
    });
    if (!res.ok) return;

    const data = (await res.json()) as { child: PublicChildProfile };
    setChildren((prev) => prev.map((item) => (item.id === child.id ? data.child : item)));
    if (activeChild?.id === child.id) {
      setActiveChild(data.child);
    }
  }

  async function handleDeleteChild(childId: string) {
    const res = await fetch(`/api/children/${childId}`, {
      method: "DELETE",
      credentials: "same-origin",
    });
    if (!res.ok) return;

    setChildren((prev) => prev.filter((item) => item.id !== childId));
    setProgressByChildId((prev) => {
      const next = { ...prev };
      delete next[childId];
      return next;
    });
    if (activeChild?.id === childId) {
      setActiveChild(null);
    }
    setConfirmDeleteId(null);
  }

  async function handleSyncPendingNow() {
    if (!activeChild?.id) return;
    const outcome = await syncLocalAttemptsForChild(activeChild.id);
    setPendingLocalCount(outcome.remainingPendingCount);
    if (outcome.status === "synced") {
      setSyncNotice(t("parentSyncSuccessNote"));
      await loadChildrenProgress(children);
    }
  }

  function handleHandDeviceToChild(child: PublicChildProfile) {
    setActiveChild(child);
    router.push("/learn");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col gap-6 px-4 py-6 sm:px-6">
      <div className="flex items-center justify-between gap-2">
        <Link
          href="/"
          className="inline-flex min-h-touch min-w-touch items-center rounded-xl border border-border bg-surface-card px-4 py-2 text-khmer-body font-medium leading-[1.75] text-ink overflow-visible hover:bg-accent-soft"
        >
          {t("navHome")}
        </Link>
        {parent && (
          <button
            type="button"
            data-testid="parent-logout-button"
            onClick={handleLogout}
            className="inline-flex min-h-touch min-w-touch items-center rounded-xl border border-border bg-surface-card px-4 py-2 text-khmer-body font-medium leading-[1.75] text-ink-muted overflow-visible hover:bg-accent-soft"
          >
            {t("parentLogoutButton")}
          </button>
        )}
      </div>

      <header className="space-y-2 text-center">
        <h1 className="text-khmer-heading font-bold text-ink">{t("parentPortalTitle")}</h1>
        <p className="text-khmer-body text-ink-muted">{t("parentPortalSubtitle")}</p>
      </header>

      <p
        data-testid="parent-privacy-note"
        className="rounded-2xl border border-accent/30 bg-accent-soft px-4 py-3 text-khmer-body leading-[1.75] text-ink"
      >
        {t("parentPrivacyNote")}
      </p>

      {loading ? (
        <div className="rounded-2xl border border-border bg-surface-card p-6 text-center text-khmer-body text-ink-muted">
          ...
        </div>
      ) : !parent ? (
        <section
          data-testid="parent-auth-card"
          className="space-y-5 rounded-2xl border border-border bg-surface-card p-5 shadow-xs"
        >
          <div className="grid grid-cols-2 gap-2" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={authTab === "signup"}
              data-testid="parent-tab-signup"
              onClick={() => {
                setAuthTab("signup");
                setAuthError(null);
              }}
              className={`min-h-touch rounded-xl px-4 py-2 text-khmer-body font-semibold leading-[1.75] overflow-visible transition-colors ${
                authTab === "signup"
                  ? "bg-accent text-white"
                  : "border border-border bg-surface text-ink"
              }`}
            >
              {t("parentTabSignup")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={authTab === "login"}
              data-testid="parent-tab-login"
              onClick={() => {
                setAuthTab("login");
                setAuthError(null);
              }}
              className={`min-h-touch rounded-xl px-4 py-2 text-khmer-body font-semibold leading-[1.75] overflow-visible transition-colors ${
                authTab === "login"
                  ? "bg-accent text-white"
                  : "border border-border bg-surface text-ink"
              }`}
            >
              {t("parentTabLogin")}
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="parent-email" className="block text-khmer-body font-medium text-ink">
                {t("parentEmailLabel")}
              </label>
              <input
                id="parent-email"
                name="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                data-testid="parent-email-input"
                className="min-h-touch w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-khmer-body text-ink focus:border-accent focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="parent-password"
                className="block text-khmer-body font-medium text-ink"
              >
                {t("parentPasswordLabel")}
              </label>
              <input
                id="parent-password"
                name="password"
                type="password"
                required
                minLength={authTab === "signup" ? 8 : 1}
                autoComplete={authTab === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                data-testid="parent-password-input"
                className="min-h-touch w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-khmer-body text-ink focus:border-accent focus:outline-none"
              />
            </div>

            {authTab === "signup" && (
              <label className="flex min-h-touch cursor-pointer items-start gap-3 rounded-xl border border-border bg-surface p-3.5">
                <input
                  type="checkbox"
                  checked={consentAccepted}
                  onChange={(event) => setConsentAccepted(event.target.checked)}
                  data-testid="parent-consent-checkbox"
                  className="mt-1.5 h-5 w-5 shrink-0 accent-accent"
                />
                <span className="text-khmer-body leading-[1.75] text-ink">
                  {t("parentConsentLabel")}
                </span>
              </label>
            )}

            {authError && (
              <p
                role="alert"
                data-testid="parent-auth-error"
                className="rounded-xl border border-amber-400 bg-amber-50 px-4 py-2.5 text-khmer-body text-amber-900"
              >
                {authError}
              </p>
            )}

            <button
              type="submit"
              disabled={submittingAuth}
              data-testid="parent-auth-submit"
              className="inline-flex min-h-touch w-full items-center justify-center rounded-xl bg-accent px-5 py-3 text-khmer-body font-semibold leading-[1.75] text-white overflow-visible hover:bg-accent-strong disabled:opacity-60"
            >
              {authTab === "signup" ? t("parentSignupButton") : t("parentLoginButton")}
            </button>
          </form>
        </section>
      ) : (
        <div className="space-y-6">
          <section
            data-testid="parent-account-summary"
            className="space-y-3 rounded-2xl border border-border bg-surface-card p-5 shadow-xs"
          >
            <p className="text-khmer-body text-ink-muted">
              {t("parentSignedInAs")}: <strong className="text-ink">{parent.email}</strong>
            </p>
            {pendingLocalCount > 0 && activeChild && (
              <button
                type="button"
                data-testid="parent-sync-now-button"
                onClick={() => void handleSyncPendingNow()}
                className="inline-flex min-h-touch items-center justify-center rounded-xl border border-accent bg-accent-soft px-4 py-2 text-khmer-body font-semibold leading-[1.75] text-accent overflow-visible hover:bg-accent hover:text-white"
              >
                {t("parentSyncPendingButton")} (<FormattedNumber value={pendingLocalCount} />)
              </button>
            )}
            {syncNotice && (
              <p className="text-sm font-medium text-emerald-700" role="status">
                {syncNotice}
              </p>
            )}
          </section>

          <section
            aria-labelledby="children-heading"
            className="space-y-4 rounded-2xl border border-border bg-surface-card p-5 shadow-xs"
          >
            <h2 id="children-heading" className="text-khmer-instruction font-bold text-ink">
              {t("parentChildrenHeading")}
            </h2>

            {children.length === 0 ? (
              <p data-testid="parent-empty-children" className="text-khmer-body text-ink-muted">
                {t("parentNoChildrenYet")}
              </p>
            ) : (
              <ul className="space-y-4" data-testid="parent-children-list">
                {children.map((child) => {
                  const isActive = activeChild?.id === child.id;
                  const confirmingDelete = confirmDeleteId === child.id;
                  const summary = progressByChildId[child.id];

                  return (
                    <li
                      key={child.id}
                      data-testid={`child-card-${child.id}`}
                      className={`space-y-4 rounded-2xl border p-4 ${
                        isActive ? "border-accent bg-accent-soft/40" : "border-border bg-surface"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <ChildAvatar avatarId={child.avatarId} size={52} />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-khmer-instruction font-bold text-ink">
                              {child.nickname}
                            </p>
                            {isActive && (
                              <span className="rounded-full bg-accent px-2.5 py-0.5 text-sm font-semibold text-white">
                                {t("parentActiveChildBadge")}
                              </span>
                            )}
                          </div>
                          <p className="text-khmer-body text-ink-muted">
                            {child.grade === 2 ? t("parentGrade2Label") : t("parentGrade1Label")} •{" "}
                            {child.numeralPref === "khmer"
                              ? t("numeralToggleKhmerLabel")
                              : t("numeralToggleArabicLabel")}
                          </p>
                        </div>
                      </div>

                      {summary && (
                        <div
                          data-testid={`child-progress-${child.id}`}
                          className="space-y-2 rounded-xl border border-border bg-surface-card p-3.5"
                        >
                          <p className="text-sm font-semibold text-accent">
                            {t("parentProgressHeading")}
                          </p>
                          {summary.totalAttempts === 0 ? (
                            <p className="text-sm text-ink-muted">{t("parentNoActivityYet")}</p>
                          ) : (
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="rounded-lg bg-surface p-2">
                                <p className="text-ink-muted">{t("parentMasteredSkillsLabel")}</p>
                                <p
                                  data-testid={`child-mastered-count-${child.id}`}
                                  className="text-khmer-body font-bold text-emerald-700"
                                >
                                  <FormattedNumber value={summary.masteredSkills.length} />
                                </p>
                              </div>
                              <div className="rounded-lg bg-surface p-2">
                                <p className="text-ink-muted">{t("parentPracticeSkillsLabel")}</p>
                                <p
                                  data-testid={`child-practice-count-${child.id}`}
                                  className="text-khmer-body font-bold text-ink"
                                >
                                  <FormattedNumber value={summary.practiceSkills.length} />
                                </p>
                              </div>
                              <div className="rounded-lg bg-surface p-2">
                                <p className="text-ink-muted">{t("parentMinutesTodayLabel")}</p>
                                <p
                                  data-testid={`child-minutes-today-${child.id}`}
                                  className="text-khmer-body font-bold text-ink"
                                >
                                  <FormattedNumber value={summary.minutesToday} />
                                </p>
                              </div>
                              <div className="rounded-lg bg-surface p-2">
                                <p className="text-ink-muted">{t("parentMinutesWeekLabel")}</p>
                                <p
                                  data-testid={`child-minutes-week-${child.id}`}
                                  className="text-khmer-body font-bold text-ink"
                                >
                                  <FormattedNumber value={summary.minutesLast7Days} />
                                </p>
                              </div>
                              <p
                                data-testid={`child-attempts-count-${child.id}`}
                                className="col-span-2 text-xs text-ink-muted"
                              >
                                {t("parentSyncedAttemptsLabel")}:{" "}
                                <FormattedNumber value={summary.totalAttempts} />
                              </p>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          data-testid={`child-hand-device-${child.id}`}
                          onClick={() => handleHandDeviceToChild(child)}
                          className="inline-flex min-h-touch flex-1 items-center justify-center rounded-xl bg-accent px-4 py-2 text-khmer-body font-semibold leading-[1.75] text-white overflow-visible hover:bg-accent-strong"
                        >
                          {t("parentHandDeviceButton")}
                        </button>
                        <button
                          type="button"
                          data-testid={`child-toggle-numerals-${child.id}`}
                          onClick={() => void handleToggleChildNumerals(child)}
                          className="inline-flex min-h-touch min-w-touch items-center justify-center rounded-xl border border-border bg-surface-card px-4 py-2 text-khmer-body font-semibold leading-[1.75] text-ink overflow-visible hover:bg-accent-soft"
                        >
                          {child.numeralPref === "khmer" ? "១២៣ → 123" : "123 → ១២៣"}
                        </button>
                      </div>

                      {confirmingDelete ? (
                        <div className="flex flex-wrap gap-2 pt-1">
                          <button
                            type="button"
                            data-testid={`child-confirm-delete-${child.id}`}
                            onClick={() => void handleDeleteChild(child.id)}
                            className="inline-flex min-h-touch items-center justify-center rounded-xl bg-red-600 px-4 py-2 text-khmer-body font-semibold leading-[1.75] text-white overflow-visible hover:bg-red-700"
                          >
                            {t("parentDeleteConfirmButton")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="inline-flex min-h-touch items-center justify-center rounded-xl border border-border bg-surface-card px-4 py-2 text-khmer-body font-medium leading-[1.75] text-ink overflow-visible"
                          >
                            {t("parentDeleteCancelButton")}
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          data-testid={`child-delete-button-${child.id}`}
                          onClick={() => setConfirmDeleteId(child.id)}
                          className="inline-flex min-h-touch items-center justify-center rounded-xl border border-red-200 bg-surface-card px-4 py-2 text-khmer-body font-medium leading-[1.75] text-red-700 overflow-visible hover:bg-red-50"
                        >
                          {t("parentDeleteChildButton")}
                        </button>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section
            aria-labelledby="add-child-heading"
            className="space-y-4 rounded-2xl border border-border bg-surface-card p-5 shadow-xs"
          >
            <h2 id="add-child-heading" className="text-khmer-instruction font-bold text-ink">
              {t("parentAddChildHeading")}
            </h2>

            <form onSubmit={handleAddChild} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="child-nickname"
                  className="block text-khmer-body font-medium text-ink"
                >
                  {t("parentChildNicknameLabel")}
                </label>
                <input
                  id="child-nickname"
                  name="nickname"
                  type="text"
                  required
                  maxLength={40}
                  value={nickname}
                  onChange={(event) => setNickname(event.target.value)}
                  data-testid="child-nickname-input"
                  className="min-h-touch w-full rounded-xl border border-border bg-surface px-4 py-2.5 text-khmer-body text-ink focus:border-accent focus:outline-none"
                />
              </div>

              <fieldset className="space-y-2">
                <legend className="text-khmer-body font-medium text-ink">
                  {t("parentChildAvatarLabel")}
                </legend>
                <div className="grid grid-cols-3 gap-2">
                  {CHILD_AVATARS.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      data-testid={`avatar-option-${item.id}`}
                      aria-pressed={avatarId === item.id}
                      onClick={() => setAvatarId(item.id)}
                      className={`flex min-h-touch flex-col items-center justify-center gap-1 rounded-xl border p-2 text-sm font-medium leading-[1.75] overflow-visible ${
                        avatarId === item.id
                          ? "border-accent bg-accent-soft text-accent"
                          : "border-border bg-surface text-ink"
                      }`}
                    >
                      <ChildAvatar avatarId={item.id} size={40} />
                      <span>{item.labelKm}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  data-testid="child-grade-1"
                  aria-pressed={grade === 1}
                  onClick={() => setGrade(1)}
                  className={`min-h-touch rounded-xl border px-4 py-2 text-khmer-body font-semibold leading-[1.75] overflow-visible ${
                    grade === 1
                      ? "border-accent bg-accent text-white"
                      : "border-border bg-surface text-ink"
                  }`}
                >
                  {t("parentGrade1Label")}
                </button>
                <button
                  type="button"
                  data-testid="child-grade-2"
                  aria-pressed={grade === 2}
                  onClick={() => setGrade(2)}
                  className={`min-h-touch rounded-xl border px-4 py-2 text-khmer-body font-semibold leading-[1.75] overflow-visible ${
                    grade === 2
                      ? "border-accent bg-accent text-white"
                      : "border-border bg-surface text-ink"
                  }`}
                >
                  {t("parentGrade2Label")}
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  data-testid="child-numeral-khmer"
                  aria-pressed={numeralPref === "khmer"}
                  onClick={() => setNumeralPref("khmer")}
                  className={`min-h-touch rounded-xl border px-4 py-2 text-khmer-body font-semibold leading-[1.75] overflow-visible ${
                    numeralPref === "khmer"
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border bg-surface text-ink"
                  }`}
                >
                  {t("numeralToggleKhmerLabel")}
                </button>
                <button
                  type="button"
                  data-testid="child-numeral-arabic"
                  aria-pressed={numeralPref === "arabic"}
                  onClick={() => setNumeralPref("arabic")}
                  className={`min-h-touch rounded-xl border px-4 py-2 text-khmer-body font-semibold leading-[1.75] overflow-visible ${
                    numeralPref === "arabic"
                      ? "border-accent bg-accent-soft text-accent"
                      : "border-border bg-surface text-ink"
                  }`}
                >
                  {t("numeralToggleArabicLabel")}
                </button>
              </div>

              {childError && (
                <p
                  role="alert"
                  className="rounded-xl border border-amber-400 bg-amber-50 px-4 py-2.5 text-khmer-body text-amber-900"
                >
                  {childError}
                </p>
              )}

              <button
                type="submit"
                disabled={submittingChild}
                data-testid="add-child-submit"
                className="inline-flex min-h-touch w-full items-center justify-center rounded-xl bg-accent px-5 py-3 text-khmer-body font-semibold leading-[1.75] text-white overflow-visible hover:bg-accent-strong disabled:opacity-60"
              >
                {t("parentAddChildButton")}
              </button>
            </form>
          </section>
        </div>
      )}
    </main>
  );
}
