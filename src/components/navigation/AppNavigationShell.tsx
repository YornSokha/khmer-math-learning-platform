"use client";

import { useEffect, useState, type MouseEvent, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { FormattedNumber } from "@/components/khmer/FormattedNumber";
import { NumeralToggle } from "@/components/khmer/NumeralToggle";
import { useActiveChild } from "@/components/parent/ActiveChildProvider";
import { ChildAvatar } from "@/components/parent/ChildAvatar";
import { ParentGateModal } from "@/components/parent/ParentGateModal";
import { t } from "@/lib/i18n/messages";
import { getDueReviewSkills } from "@/lib/mastery/scheduler";
import { computeLocalSkillStates, type ReviewLessonMeta } from "@/lib/review/queue";
import { getAllAttempts } from "@/lib/storage/progress-db";

export const FOCUS_ROUTE_PREFIXES = ["/lessons", "/placement", "/preview", "/offline"] as const;

export function isFocusRoute(pathname: string | null): boolean {
  if (!pathname) return false;
  return FOCUS_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export function isNavHrefActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type NavItemId = "learn" | "review" | "daily" | "parents";

interface NavItem {
  id: NavItemId;
  href: string;
  label: string;
}

const NAV_ITEMS: readonly NavItem[] = [
  { id: "learn", href: "/learn", label: t("navTabLearn") },
  { id: "review", href: "/review", label: t("navTabReview") },
  { id: "daily", href: "/daily-challenge", label: t("navTabDaily") },
  { id: "parents", href: "/parent", label: t("navTabParents") },
];

function NavIcon({ id }: { id: NavItemId }) {
  switch (id) {
    case "learn":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
      );
    case "review":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      );
    case "daily":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    case "parents":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-5 w-5 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        </svg>
      );
  }
}

export interface AppNavigationShellProps {
  children: ReactNode;
  reviewLessons?: readonly ReviewLessonMeta[];
}

export function AppNavigationShell({ children, reviewLessons = [] }: AppNavigationShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { activeChild } = useActiveChild();
  const [parentGateOpen, setParentGateOpen] = useState(false);
  const [dueReviewCount, setDueReviewCount] = useState(0);

  const focusMode = isFocusRoute(pathname);
  const needsParentGate = activeChild !== null && pathname !== "/parent";
  const showHeaderNumeralToggle = pathname !== "/";

  useEffect(() => {
    if (focusMode || reviewLessons.length === 0) {
      return;
    }

    let active = true;
    const refreshDueReviews = () => {
      void getAllAttempts()
        .then((attempts) => {
          if (!active) return;
          const states = computeLocalSkillStates(attempts, reviewLessons);
          setDueReviewCount(getDueReviewSkills(states, new Date()).length);
        })
        .catch(() => {
          // Ignore storage unavailability in restricted contexts.
        });
    };

    refreshDueReviews();
    window.addEventListener("focus", refreshDueReviews);
    return () => {
      active = false;
      window.removeEventListener("focus", refreshDueReviews);
    };
  }, [focusMode, pathname, reviewLessons]);

  if (focusMode) {
    return <>{children}</>;
  }

  const handleParentsClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (needsParentGate) {
      event.preventDefault();
      setParentGateOpen(true);
    }
  };

  return (
    <>
      <header
        data-testid="app-top-header"
        className="sticky top-0 z-40 border-b border-border bg-surface-card/95 backdrop-blur-xs"
      >
        <div className="mx-auto flex w-full max-w-4xl flex-wrap items-center justify-between gap-2 px-3 py-2 sm:flex-nowrap sm:px-6">
          <Link
            href="/"
            data-testid="nav-brand-link"
            aria-current={pathname === "/" ? "page" : undefined}
            className="inline-flex min-h-touch items-center gap-2 rounded-xl px-1.5 py-1 text-khmer-body font-bold leading-[1.75] text-ink overflow-visible transition-colors hover:bg-accent-soft"
          >
            <span
              aria-hidden="true"
              className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent text-base font-bold text-white"
            >
              ១
            </span>
            <span>{t("appTitle")}</span>
          </Link>

          <nav
            aria-label={t("navPrimaryLabel")}
            data-testid="desktop-nav"
            className="hidden items-center gap-1 sm:flex"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = isNavHrefActive(pathname, item.href);
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  data-testid={`desktop-nav-${item.id}`}
                  aria-current={isActive ? "page" : undefined}
                  onClick={item.id === "parents" ? handleParentsClick : undefined}
                  className={`inline-flex min-h-touch items-center gap-1.5 rounded-xl px-3 py-2 text-base font-semibold leading-[1.75] overflow-visible transition-colors ${
                    isActive
                      ? "bg-accent-soft text-accent"
                      : "text-ink-muted hover:bg-surface hover:text-ink"
                  }`}
                >
                  <NavIcon id={item.id} />
                  <span>{item.label}</span>
                  {item.id === "review" && dueReviewCount > 0 && (
                    <span
                      data-testid="desktop-nav-review-badge"
                      className="inline-flex min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1.5 text-xs font-bold leading-[1.5] text-white"
                    >
                      <FormattedNumber value={dueReviewCount} />
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="flex flex-wrap items-center gap-2">
            {activeChild && (
              <span
                data-testid="nav-active-child-chip"
                className="inline-flex min-h-touch items-center gap-1.5 rounded-full border border-accent/30 bg-accent-soft px-2.5 py-1 text-sm font-semibold leading-[1.75] text-accent overflow-visible"
              >
                <ChildAvatar avatarId={activeChild.avatarId} size={28} />
                <span>{activeChild.nickname}</span>
              </span>
            )}
            {showHeaderNumeralToggle && (
              <div data-testid="nav-numeral-toggle">
                <NumeralToggle compact />
              </div>
            )}
          </div>
        </div>
      </header>

      <div data-testid="app-shell-content" className="pb-24 sm:pb-8">
        {children}
      </div>

      <nav
        aria-label={t("navPrimaryLabel")}
        data-testid="mobile-bottom-nav"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface-card/95 pb-[env(safe-area-inset-bottom)] shadow-sm backdrop-blur-xs sm:hidden"
      >
        <div className="mx-auto grid max-w-xl grid-cols-4 gap-1 px-1.5 py-1.5">
          {NAV_ITEMS.map((item) => {
            const isActive = isNavHrefActive(pathname, item.href);
            return (
              <Link
                key={item.id}
                href={item.href}
                data-testid={`mobile-nav-${item.id}`}
                aria-current={isActive ? "page" : undefined}
                onClick={item.id === "parents" ? handleParentsClick : undefined}
                className={`relative flex min-h-touch min-w-touch flex-col items-center justify-center gap-0.5 rounded-xl px-1 py-1.5 text-center leading-[1.75] overflow-visible transition-colors ${
                  isActive
                    ? "bg-accent-soft font-bold text-accent"
                    : "font-medium text-ink-muted hover:bg-surface hover:text-ink"
                }`}
              >
                <span className="relative inline-flex items-center justify-center overflow-visible">
                  <NavIcon id={item.id} />
                  {item.id === "review" && dueReviewCount > 0 && (
                    <span
                      data-testid="mobile-nav-review-badge"
                      className="absolute -top-1.5 -right-3 inline-flex min-w-5 items-center justify-center rounded-full bg-emerald-600 px-1 text-xs font-bold leading-[1.5] text-white"
                    >
                      <FormattedNumber value={dueReviewCount} />
                    </span>
                  )}
                </span>
                <span className="text-sm leading-[1.75] overflow-visible">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <ParentGateModal
        open={parentGateOpen}
        onClose={() => setParentGateOpen(false)}
        onUnlock={() => {
          setParentGateOpen(false);
          router.push("/parent");
        }}
      />
    </>
  );
}
