# DummyJSON API Automation

![Playwright](https://img.shields.io/badge/Playwright-API%20Testing-2ea44f)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178c6)
 

Playwright + TypeScript API automation project for the public
[DummyJSON](https://dummyjson.com) API. Built as a portfolio project: practical enough to show
real QA automation thinking, small enough for a reviewer to understand quickly.

## Why This Project Exists

This repository demonstrates a maintainable API testing approach without turning a demo API into
an enterprise framework. The suite focuses on clear risk coverage, readable test intent, reusable
API helpers, lightweight contract validation with semantic invariants, negative testing, and
CI-friendly execution.

## Features

- Playwright `APIRequestContext` tests with no browser dependency.
- Strict TypeScript with lint, format, and typecheck gates.
- Smoke and regression tagging for focused execution.
- Reusable endpoint constants, JSON response helper, and not-found assertion helper.
- Lightweight schema validators using TypeScript assertion functions, covered by their own unit tests.
- Reusable authenticated-request fixture replacing per-test login boilerplate.
- Positive, negative, search/filter, and simulated CRUD coverage.
- GitHub Actions workflow with a quality gate (lint + typecheck + unit) before integration tests.

## Coverage Overview

| Area     | Coverage summary                                                                     |
| -------- | ------------------------------------------------------------------------------------ |
| Auth     | Login, current user, token refresh, invalid credentials, missing password, bad token |
| Products | List, single product, search, categories, simulated create/update/delete, not found  |
| Carts    | List, single cart, user carts, simulated create/update/delete, not found             |
| Users    | List, single user, search, field/value filter, not found                             |

## Test Strategy

Tests assert HTTP status first, then response body shape, then scenario-specific behavior. Shared
contract checks live in `utils/schema-validators.ts`; business assertions stay in specs so test
intent remains obvious. Validators check both shape and meaningful semantic invariants (non-negative
prices, ratings in `[0, 5]`, email format, cart total invariants).

Tags:

- `@smoke` - fast critical checks for frequent CI runs
- `@regression` - broader endpoint behavior
- `@contract` - reusable response shape checks
- `@negative` - invalid input, missing resources, auth failures
- `@auth` - authentication and token behavior
- `@crud` - simulated create, update, delete operations

## Project Structure

```text
tests/api/    API specs for auth, products, carts, users
tests/utils/  Unit tests for the schema validators
utils/        Endpoint constants, response helpers, schema validators
fixtures/     Authenticated-request Playwright fixture
config/       Environment configuration
docs/         Architecture and AI-assisted workflow notes
```

## Commands

```bash
npm ci

npm run lint            # ESLint
npm run typecheck       # tsc --noEmit
npm run format:check    # prettier --check
npm run format          # prettier --write

npm run test:unit       # validator unit tests (no network)
npm run test:smoke      # @smoke only
npm run test:regression # @regression only
npm run test:api        # full API suite
npm test                # everything
```

Override the target API URL:

```bash
DUMMYJSON_BASE_URL=https://dummyjson.com npm run test:api
```

PowerShell:

```powershell
$env:DUMMYJSON_BASE_URL='https://dummyjson.com'; npm.cmd run test:api
```

## CI

GitHub Actions runs a quality gate (lint, typecheck, validator unit tests) before the smoke and
full API jobs. Smoke runs on push, pull request, scheduled weekday cron, and manual dispatch. The
full suite runs on push, schedule, and manual dispatch. Playwright reports and failure artifacts
are uploaded for review.

## AI-Assisted Workflow

See [`docs/ai-assisted-workflow.md`](docs/ai-assisted-workflow.md) for the conventions AI agents
follow when contributing.

## Limitations Of DummyJSON

- DummyJSON is a public demo API; data and availability can change outside this repository.
- Product and cart create, update, and delete responses are simulated and not persisted server-side.
- Auth tests use the public demo credentials documented by DummyJSON.
- Contract checks validate stable required fields and meaningful invariants, not exhaustive payloads.
- CI requires internet access to `https://dummyjson.com`.
