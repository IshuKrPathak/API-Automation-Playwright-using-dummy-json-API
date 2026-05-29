import { expect, test } from '../../fixtures/auth.fixture';
import { demoUser, endpoints, expectJsonResponse } from '../../utils/api-client';
import {
  expectAuthTokenResponseShape,
  expectErrorResponseShape,
  expectUserShape,
} from '../../utils/schema-validators';

test.describe('auth API', () => {
  test('logs in with documented public demo credentials @smoke @auth @contract', async ({
    request,
  }) => {
    const response = await request.post(endpoints.login, {
      data: { ...demoUser, expiresInMins: 30 },
    });

    const body = await expectJsonResponse<unknown>(response, 200);
    expectAuthTokenResponseShape(body);
    expect(body.username).toBe(demoUser.username);
  });

  test('returns the authenticated user when a bearer token is provided @regression @auth', async ({
    authedRequest,
  }) => {
    const response = await authedRequest.get(endpoints.authMe);

    const user = await expectJsonResponse<unknown>(response, 200);
    expectUserShape(user);
    expect(user.username).toBe(demoUser.username);
  });

  test('refreshes an access token with a refresh token @regression @auth', async ({
    request,
    authTokens,
  }) => {
    const response = await request.post(endpoints.refreshAuth, {
      data: { refreshToken: authTokens.refreshToken, expiresInMins: 30 },
    });

    const body = await expectJsonResponse<unknown>(response, 200);
    expectAuthTokenResponseShape(body);
  });

  test('rejects invalid credentials @smoke @auth @negative', async ({ request }) => {
    const response = await request.post(endpoints.login, {
      data: { username: demoUser.username, password: 'incorrect-password' },
    });

    const body = await expectJsonResponse<unknown>(response, 400);
    expectErrorResponseShape(body);
  });

  test('rejects login when password is missing @regression @auth @negative', async ({
    request,
  }) => {
    const response = await request.post(endpoints.login, {
      data: { username: demoUser.username },
    });

    const body = await expectJsonResponse<unknown>(response, 400);
    expectErrorResponseShape(body);
  });

  test('rejects refresh with an invalid token @regression @auth @negative', async ({ request }) => {
    const response = await request.post(endpoints.refreshAuth, {
      data: { refreshToken: 'invalid-refresh-token', expiresInMins: 30 },
    });

    const body = await expectJsonResponse<unknown>(response, 403);
    expectErrorResponseShape(body);
  });

  test('rejects current-user lookup without a valid token @regression @auth @negative', async ({
    request,
  }) => {
    const response = await request.get(endpoints.authMe, {
      headers: { Authorization: 'Bearer invalid-token' },
    });

    const body = await expectJsonResponse<unknown>(response, 401);
    expectErrorResponseShape(body);
  });
});
