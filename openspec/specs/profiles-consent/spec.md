# profiles-consent Specification

## Purpose

Defines parent-only account registration with explicit under-16 parental consent, privacy-minimized child profiles (no child PII), and permanent cascading deletion of a child profile and all associated learning data.

## Requirements

### Requirement: Parent-only account creation with explicit parental consent
Only a parent or guardian SHALL be able to create an account, and account registration SHALL require explicit confirmation of parental consent for under-16 child use before persisting the account or creating an authenticated session.

#### Scenario: Signup without parental consent is rejected
- **WHEN** a client submits `POST /api/auth/signup` with a valid email and password but `consentAccepted` is `false` or omitted
- **THEN** the API returns HTTP `400` with a validation error and does not create a parent account or session

#### Scenario: Signup with explicit consent creates parent account and HTTP-only session
- **WHEN** a client submits `POST /api/auth/signup` with a valid email, password of at least 8 characters, and `consentAccepted: true`
- **THEN** the server stores the parent account with a salted password hash and `consentAcceptedAt` timestamp and sets an `HttpOnly` session cookie

### Requirement: Child profiles contain no child PII
Child profiles SHALL be owned by an authenticated parent account and SHALL store only a nickname, an avatar identifier from a predefined SVG set, a grade level, and a numeral preference (`khmer` or `arabic`), never child legal names, birthdates, emails, or uploaded photos.

#### Scenario: Authenticated parent creates a minimal child profile
- **WHEN** an authenticated parent submits `POST /api/children` with `{ nickname, avatarId, grade, numeralPref }`
- **THEN** the server persists and returns the child profile linked to that parent with only those non-PII fields

#### Scenario: Child profile creation rejects unexpected PII fields
- **WHEN** a client submits `POST /api/children` containing forbidden PII fields such as `birthdate`, `fullName`, or `photoUrl`
- **THEN** the API rejects the payload with HTTP `400`

### Requirement: Permanent cascading deletion of child profile and learning data
An authenticated parent SHALL be able to permanently delete any child profile they own, and deletion SHALL remove the child profile along with all associated attempts, skill states, and achievement awards.

#### Scenario: Deleting a child profile removes all attempts and progress for that child
- **WHEN** a parent with a child who has stored attempts calls `DELETE /api/children/[childId]`
- **THEN** the child profile and all attempts, skill states, and achievement awards belonging to that child are permanently removed

#### Scenario: Parent cannot modify or delete another parent's child profile
- **WHEN** an authenticated parent calls `PATCH` or `DELETE` on a `childId` owned by a different parent
- **THEN** the API returns HTTP `404` and leaves the other parent's data untouched
