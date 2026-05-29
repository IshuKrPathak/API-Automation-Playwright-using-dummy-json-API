# AI-Assisted Workflow

AI agents may assist with test design, scaffolding, refactoring, and diagnostics. Humans own assertion intent, coverage value, and final review.

## Working Principles

- Read nearby tests, helpers, config, and existing patterns before editing.
- Keep changes small, reviewable, and aligned with the existing structure.
- Confirm DummyJSON behavior from the official docs when uncertain.
- Match the assertion pattern: HTTP status first, then body, then reusable shape via `utils/schema-validators.ts`.
- Use Playwright `APIRequestContext`; do not introduce browser-driven tests.
- Tag tests with at least one risk label: `@smoke`, `@regression`, `@contract`, `@negative`, `@auth`, `@crud`.
- Use the `authedRequest` / `authTokens` fixtures from `fixtures/auth.fixture.ts` instead of repeating login boilerplate.
- Do not commit secrets. DummyJSON uses public demo credentials only.
- Treat DummyJSON write operations as simulated; never assert that writes persist.

## Before Returning Work

- Run `npm run lint`, `npm run typecheck`, and the smallest relevant test command (`test:unit`, `test:smoke`, `test:regression`, or `test:api`).
- Summarize coverage added, files changed, validation run, and any residual risk.
