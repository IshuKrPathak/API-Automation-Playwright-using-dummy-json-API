import { APIRequestContext, test as base } from '@playwright/test';
import { demoUser, endpoints } from '../utils/api-client';

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};

type AuthFixtures = {
  authTokens: AuthTokens;
  authedRequest: APIRequestContext;
};

export const test = base.extend<AuthFixtures>({
  authTokens: async ({ request }, use) => {
    const response = await request.post(endpoints.login, {
      data: { ...demoUser, expiresInMins: 30 },
    });

    if (response.status() !== 200) {
      throw new Error(`Demo user login failed with status ${response.status()}.`);
    }

    const body = (await response.json()) as Partial<AuthTokens>;

    if (typeof body.accessToken !== 'string' || typeof body.refreshToken !== 'string') {
      throw new Error('Demo user login response did not contain string tokens.');
    }

    await use({ accessToken: body.accessToken, refreshToken: body.refreshToken });
  },

  authedRequest: async ({ playwright, baseURL, authTokens }, use) => {
    const context = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: {
        Accept: 'application/json',
        Authorization: `Bearer ${authTokens.accessToken}`,
      },
    });

    await use(context);
    await context.dispose();
  },
});

export { expect } from '@playwright/test';
