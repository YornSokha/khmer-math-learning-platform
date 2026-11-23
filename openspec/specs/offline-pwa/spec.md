# offline-pwa Specification

## Purpose

Defines offline-first PWA precaching via Serwist, Khmer web app manifest and offline fallback page, connectivity awareness, and IndexedDB local progress storage with idempotent sync semantics.

## Requirements

### Requirement: Service worker precaching for app shell, lessons, and fonts
The application SHALL register a Serwist service worker that precaches the app shell, self-hosted Khmer fonts, static assets, `/`, `/lessons/g1-make-ten`, and `/offline` so previously cached lessons load and play without network connectivity.

#### Scenario: Precached lesson loads and completes while offline
- **WHEN** a browser loads the application online until the service worker is active, switches offline, reloads `/lessons/g1-make-ten`, and completes the lesson
- **THEN** the lesson renders from cache with Khmer fonts intact, every step evaluates locally without network errors, and the completion screen appears

### Requirement: Khmer offline fallback page and connectivity banner
The application SHALL serve a Khmer `/offline` fallback page when an uncached navigation request fails offline and SHALL display a calm Khmer offline status banner whenever the browser loses connectivity.

#### Scenario: Uncached route shows Khmer offline fallback while offline
- **WHEN** the browser is offline and navigates to an uncached route
- **THEN** the service worker responds with the Khmer `/offline` fallback page offering links back to cached pages without horizontal overflow

### Requirement: IndexedDB local progress storage and idempotent sync queue
The application SHALL store learner step attempts and lesson completions locally in IndexedDB keyed by unique `clientEventId` values so progress persists across offline reloads and syncs idempotently without creating duplicate records when connectivity returns.

#### Scenario: Offline attempts persist in IndexedDB and sync without duplicates
- **WHEN** step attempts and a lesson completion are recorded while offline, the page is reloaded offline, and sync runs twice after returning online
- **THEN** the attempts and completion persist in IndexedDB across reload, sync marks pending attempts as synced on the first successful run, and a second sync run sends zero duplicate attempts

### Requirement: Automatic offline precaching for all curriculum lessons
The Serwist build configuration SHALL dynamically discover every lesson defined under `content/lessons/` and include its `/lessons/<id>` route in the precache manifest so the entire Grade 1 curriculum is available offline.

#### Scenario: Production build precaches all 12 Grade 1 lesson routes
- **WHEN** `npm run build` bundles the Serwist service worker
- **THEN** the generated precache manifest contains entries for all 12 `/lessons/<id>` routes alongside `/` and `/offline`
