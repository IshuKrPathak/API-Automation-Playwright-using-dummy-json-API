import { expect, test } from '@playwright/test';
import { endpoints, expectJsonResponse, expectNotFoundResponse } from '../../utils/api-client';
import { expectUserListShape, expectUserShape } from '../../utils/schema-validators';

const SEEDED_USER_ID = 1;
const UNKNOWN_USER_ID = 999_999;
const SEEDED_USERNAME = 'emilys';
const USER_SEARCH_TERM = 'Johnson';
const FILTER_KEY = 'hair.color';
const FILTER_VALUE = 'Brown';
const PAGE_LIMIT = 5;
const FIRST_PAGE_SKIP = 0;

test.describe('users API', () => {
  test('returns a paginated user list with stable identity fields @smoke @contract', async ({
    request,
  }) => {
    const response = await request.get(endpoints.users, {
      params: { limit: PAGE_LIMIT, skip: FIRST_PAGE_SKIP },
    });

    const body = await expectJsonResponse<unknown>(response, 200);
    expectUserListShape(body);
    expect(body.users).toHaveLength(PAGE_LIMIT);
    expect(body.skip).toBe(FIRST_PAGE_SKIP);
    expect(body.limit).toBe(PAGE_LIMIT);
    expect(body.total).toBeGreaterThanOrEqual(body.users.length);
  });

  test('returns a single user by id @regression @contract', async ({ request }) => {
    const response = await request.get(endpoints.user(SEEDED_USER_ID));

    const user = await expectJsonResponse<unknown>(response, 200);
    expectUserShape(user);
    expect(user.id).toBe(SEEDED_USER_ID);
    expect(user.username).toBe(SEEDED_USERNAME);
  });

  test('returns not found for an unknown user id @regression @negative', async ({ request }) => {
    const response = await request.get(endpoints.user(UNKNOWN_USER_ID));
    await expectNotFoundResponse(response);
  });

  test('searches users by name-related fields @regression @contract', async ({ request }) => {
    const response = await request.get(endpoints.searchUsers, {
      params: { q: USER_SEARCH_TERM },
    });

    const body = await expectJsonResponse<unknown>(response, 200);
    expectUserListShape(body);
    expect(body.users.length).toBeGreaterThan(0);

    const normalizedSearchTerm = USER_SEARCH_TERM.toLowerCase();
    const hasRelevantMatch = body.users.some((user) => {
      const searchableFields = [user.firstName, user.lastName, user.maidenName, user.username];
      return searchableFields.some((field) =>
        typeof field === 'string' ? field.toLowerCase().includes(normalizedSearchTerm) : false,
      );
    });

    expect(hasRelevantMatch).toBeTruthy();
  });

  test('filters users by field and value @regression @contract', async ({ request }) => {
    const response = await request.get(endpoints.filterUsers, {
      params: { key: FILTER_KEY, value: FILTER_VALUE },
    });

    const body = await expectJsonResponse<unknown>(response, 200);
    expectUserListShape(body);
    expect(body.users.length).toBeGreaterThan(0);

    for (const user of body.users) {
      expect(user.hair).toEqual(expect.objectContaining({ color: FILTER_VALUE }));
    }
  });
});
