# Spec Delta

## Purpose

Defines the baseline runnable web application shell, automated verification commands, continuous integration checks, and developer setup documentation that all subsequent platform capabilities build upon.

## ADDED Requirements

### Requirement: Runnable Khmer-tagged web application shell
The system SHALL serve an HTTP 200 HTML response at `/` with the document language attribute set to `km` (`<html lang="km">`) and compile cleanly for production via `npm run build`.

#### Scenario: Home route renders with Khmer document language
- **WHEN** a client requests `/` from the running application
- **THEN** the response status is `200` and the root `<html>` element has `lang="km"`

#### Scenario: Production build succeeds
- **WHEN** a developer or CI pipeline runs `npm run build`
- **THEN** the build completes with exit code `0` and produces no type or compilation errors

### Requirement: Automated lint and formatting verification
The project SHALL provide an `npm run lint` command that checks both static lint rules and code formatting across application and test files.

#### Scenario: Clean repository passes lint and formatting checks
- **WHEN** `npm run lint` is executed on properly formatted, valid source files
- **THEN** the command exits with code `0`

#### Scenario: Formatting or lint violation fails verification
- **WHEN** `npm run lint` is executed while a file violates lint rules or formatting rules
- **THEN** the command exits with a non-zero status and reports the offending file

### Requirement: Automated unit and component test runner
The project SHALL provide a non-interactive `npm test` command that executes unit and UI component tests and exits upon completion.

#### Scenario: Initial unit and component smoke tests pass
- **WHEN** `npm test` is executed in a local or CI environment
- **THEN** the test runner executes the configured unit and component tests, passes all assertions, and exits with code `0` without hanging in watch mode

### Requirement: Mobile-viewport end-to-end test harness
The project SHALL provide an `npm run test:e2e` command that runs browser end-to-end tests against the running application using a `360×800` touch-enabled mobile viewport profile.

#### Scenario: Mobile E2E smoke test verifies the home route
- **WHEN** `npm run test:e2e` is executed
- **THEN** the browser test opens `/` in a `360×800` viewport, verifies the page renders with `lang="km"` and no horizontal overflow, and exits with code `0`

### Requirement: Continuous integration quality gates
The repository SHALL include an automated CI workflow triggered on pushes and pull requests that installs dependencies cleanly and verifies lint, unit/component tests, and production build.

#### Scenario: CI workflow runs required checks on pull requests
- **WHEN** a pull request is opened or updated on the repository
- **THEN** the CI workflow installs dependencies and runs `npm run lint`, `npm test`, and `npm run build`, failing the check if any step exits non-zero

### Requirement: Developer setup documentation
The repository SHALL include a root `README.md` documenting prerequisites and exact commands to install dependencies, run the local dev server, build for production, and execute lint, unit/component, and E2E tests.

#### Scenario: New contributor follows README commands
- **WHEN** a contributor reads `README.md`
- **THEN** they find working commands for install (`npm install`), local development (`npm run dev`), production build (`npm run build`), lint (`npm run lint`), unit tests (`npm test`), and mobile E2E tests (`npm run test:e2e`)
