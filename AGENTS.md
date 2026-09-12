# AGENTS.md

## Project

Sales Summit is a free and open-source local-first sales tracking application.

The application must not require a backend or user accounts.

User sales data must remain on the user's device unless the user explicitly exports it.

## Priorities

In order:

1. Simplicity
2. Readability
3. Data ownership
4. Offline functionality
5. Maintainability
6. Performance

Avoid speculative abstractions.

Do not introduce infrastructure for hypothetical future requirements.

## Stack

Use:

- Svelte 5
- TypeScript
- Vite
- Dexie / IndexedDB
- CSS
- Vitest

Do not introduce React, Tailwind, Firebase, Supabase, backend services, Redux, Zustand, or other state management libraries unless explicitly requested.

## Architecture

Keep the codebase separated into:

- UI/components
- domain
- repositories
- persistence
- services

Svelte components must not query Dexie directly.

Use repository abstractions between UI/domain code and persistence.

Domain functions must be framework-independent.

## Money

All monetary values must be stored as integers.

Do not use floating-point values to represent money.

Example:

CLP $23,490 -> 23490

## Percentages

Commission rates are stored as decimal ratios.

Example:

0.7% -> 0.007

## Dates

Persist timestamps as ISO 8601 strings.

Do not store locale-formatted dates.

## IDs

Use crypto.randomUUID() for persistent domain entities.

Do not use IndexedDB auto-increment IDs for domain entities.

## Data portability

The persistence model must not become the public data format.

In a future version, the application will support importing/exporting a versioned JSON backup format that can also be consumed by Android/iOS applications.

Do not couple domain models to Dexie-specific types.

## UI

The application is mobile-first.

Use semantic HTML and CSS.

Prefer reusable small components over large page components.

Avoid UI component frameworks.

The visual language should be:

- modern
- clean
- rounded cards
- generous spacing
- high contrast
- mobile-app-like
- light background
- dark navy header
- green accent for progress and primary actions

## Testing

Prioritize tests for domain calculations and data transformations.

Do not create excessive UI tests unless explicitly requested.

Before completing significant work, run:

- tests
- typecheck
- build

Fix failures before reporting completion.

## Scope discipline

Do not implement functionality that was not requested.

If something could be useful later but is not required now, leave a short TODO only when appropriate rather than implementing it.
