# Spec Delta

## ADDED Requirements

### Requirement: Automatic offline precaching for all curriculum lessons
The Serwist build configuration SHALL dynamically discover every lesson defined under `content/lessons/` and include its `/lessons/<id>` route in the precache manifest so the entire Grade 1 curriculum is available offline.

#### Scenario: Production build precaches all 12 Grade 1 lesson routes
- **WHEN** `npm run build` bundles the Serwist service worker
- **THEN** the generated precache manifest contains entries for all 12 `/lessons/<id>` routes alongside `/` and `/offline`
