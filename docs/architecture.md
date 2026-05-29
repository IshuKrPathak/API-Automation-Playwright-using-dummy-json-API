# Architecture

## Layout

```text
tests/api/        API behavior specifications
tests/utils/      Validator unit tests (no network)
utils/            API client helpers and runtime schema validators
fixtures/         Playwright fixtures (authenticated request context)
config/           Environment configuration
docs/             Architecture and AI workflow notes
```

Specs own behavior. Helpers stay small and only hide repeated mechanics, not scenario intent.

## API Client

`utils/api-client.ts` exposes endpoint paths, the public demo user credentials, and two helpers:

- `expectJsonResponse<T>(response, expectedStatus)` asserts status and `content-type`, then returns the parsed body typed as `T`.
- `expectNotFoundResponse(response)` asserts the common 404-with-message contract used across resources.

It does not become a full SDK.

## Schema Validators

`utils/schema-validators.ts` uses TypeScript assertion functions (`asserts value is X`) for runtime guards. Validators check shape and meaningful semantic invariants without pulling in a heavy schema library:

- Prices, stock, totals: non-negative.
- Product rating: within `[0, 5]`.
- User email: matches a basic format pattern.
- Cart: `discountedTotal <= total`, `totalProducts >= products.length`, `totalQuantity >= totalProducts`.

Validator behavior is itself covered by `tests/utils/schema-validators.spec.ts`.

## Fixtures

`fixtures/auth.fixture.ts` extends Playwright's `test` with:

- `authTokens` — logs in the demo user once per scope and exposes `{ accessToken, refreshToken }`.
- `authedRequest` — an `APIRequestContext` pre-configured with a bearer token.

Specs that exercise authenticated endpoints consume the fixture rather than repeating login boilerplate.

## Environment Configuration

`config/environments.ts` reads `DUMMYJSON_BASE_URL` and defaults to `https://dummyjson.com`. No secrets required.

## Playwright Projects

Two projects are defined in `playwright.config.ts`:

- `unit` — validator tests under `tests/utils/`. No network. Runs in the CI quality gate.
- `api` — network-backed specs under `tests/api/`. Runs in smoke and full jobs.

`npm run test:smoke` and `npm run test:regression` filter the `api` project by tag.
