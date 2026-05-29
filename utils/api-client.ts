import { APIResponse, expect } from '@playwright/test';
import { expectErrorResponseShape } from './schema-validators';

export const endpoints = {
  carts: '/carts',
  cart: (id: number | string) => `/carts/${id}`,
  userCarts: (userId: number | string) => `/carts/user/${userId}`,
  addCart: '/carts/add',
  products: '/products',
  product: (id: number | string) => `/products/${id}`,
  addProduct: '/products/add',
  searchProducts: '/products/search',
  productCategories: '/products/categories',
  login: '/auth/login',
  authMe: '/auth/me',
  refreshAuth: '/auth/refresh',
  users: '/users',
  user: (id: number | string) => `/users/${id}`,
  searchUsers: '/users/search',
  filterUsers: '/users/filter',
} as const;

export const demoUser = {
  username: 'emilys',
  password: 'emilyspass',
} as const;

export async function expectJsonResponse<T>(
  response: APIResponse,
  expectedStatus: number,
): Promise<T> {
  expect(response.status()).toBe(expectedStatus);
  expect(response.headers()['content-type']).toContain('application/json');
  return (await response.json()) as T;
}

export async function expectNotFoundResponse(
  response: APIResponse,
  messageFragment: string = 'not found',
): Promise<void> {
  const body = await expectJsonResponse<unknown>(response, 404);
  expectErrorResponseShape(body);
  expect(body.message).toEqual(expect.stringContaining(messageFragment));
}
