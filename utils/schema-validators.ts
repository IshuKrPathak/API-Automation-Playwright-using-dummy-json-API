import { expect } from '@playwright/test';

type JsonRecord = Record<string, unknown>;
type ProductList = {
  products: JsonRecord[];
  total: number;
  skip: number;
  limit: number;
};
type UserList = {
  users: JsonRecord[];
  total: number;
  skip: number;
  limit: number;
};
type Cart = {
  id: number;
  products: JsonRecord[];
  total: number;
  discountedTotal: number;
  userId: number;
  totalProducts: number;
  totalQuantity: number;
};
type CartList = {
  carts: Cart[];
  total: number;
  skip: number;
  limit: number;
};
type AuthTokenResponse = JsonRecord & {
  accessToken: string;
  refreshToken: string;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function expectRecord(value: unknown): asserts value is JsonRecord {
  expect(value).toBeTruthy();
  expect(typeof value).toBe('object');
  expect(Array.isArray(value)).toBeFalsy();
}

function expectNumber(value: unknown): asserts value is number {
  expect(typeof value).toBe('number');
}

function expectNonNegativeNumber(value: unknown): asserts value is number {
  expectNumber(value);
  expect(value).toBeGreaterThanOrEqual(0);
}

function expectNumberInRange(value: unknown, min: number, max: number): asserts value is number {
  expectNumber(value);
  expect(value).toBeGreaterThanOrEqual(min);
  expect(value).toBeLessThanOrEqual(max);
}

function expectNonEmptyString(value: unknown): asserts value is string {
  expect(typeof value).toBe('string');
  expect(value).not.toHaveLength(0);
}

function expectRecordArray(value: unknown): asserts value is JsonRecord[] {
  expect(Array.isArray(value)).toBeTruthy();
}

function expectEmail(value: unknown): asserts value is string {
  expectNonEmptyString(value);
  expect(value).toMatch(EMAIL_PATTERN);
}

function expectPaginationFields(body: JsonRecord): void {
  expectNonNegativeNumber(body.total);
  expectNonNegativeNumber(body.skip);
  expectNonNegativeNumber(body.limit);
}

export function expectAuthTokenResponseShape(body: unknown): asserts body is AuthTokenResponse {
  expectRecord(body);
  expectNonEmptyString(body.accessToken);
  expectNonEmptyString(body.refreshToken);
}

export function expectErrorResponseShape(body: unknown): asserts body is JsonRecord {
  expectRecord(body);
  expectNonEmptyString(body.message);
}

export function expectDeletedResourceShape(resource: unknown): asserts resource is JsonRecord {
  expectRecord(resource);
  expectNumber(resource.id);
  expect(resource.isDeleted).toBe(true);
  expectNonEmptyString(resource.deletedOn);
}

export function expectProductShape(product: unknown): asserts product is JsonRecord {
  expectRecord(product);
  expectNumber(product.id);
  expectNonEmptyString(product.title);
  expectNonEmptyString(product.description);
  expectNonEmptyString(product.category);
  expectNonNegativeNumber(product.price);
  expectNumberInRange(product.rating, 0, 5);
  expectNonNegativeNumber(product.stock);
  expect(Array.isArray(product.images)).toBeTruthy();
  expectNonEmptyString(product.thumbnail);
}

export function expectProductListShape(body: unknown): asserts body is ProductList {
  expectRecord(body);
  const products = body.products;
  expectRecordArray(products);
  expectPaginationFields(body);
  for (const product of products) {
    expectProductShape(product);
  }
}

export function expectProductCategoryShape(category: unknown): asserts category is JsonRecord {
  expectRecord(category);
  expectNonEmptyString(category.slug);
  expectNonEmptyString(category.name);
  expectNonEmptyString(category.url);
}

export function expectUserShape(user: unknown): asserts user is JsonRecord {
  expectRecord(user);
  expectNumber(user.id);
  expectNonEmptyString(user.firstName);
  expectNonEmptyString(user.lastName);
  expectEmail(user.email);
  expectNonEmptyString(user.username);
  expectNonNegativeNumber(user.age);
  expectNonEmptyString(user.gender);
}

export function expectUserListShape(body: unknown): asserts body is UserList {
  expectRecord(body);
  const users = body.users;
  expectRecordArray(users);
  expectPaginationFields(body);
  for (const user of users) {
    expectUserShape(user);
  }
}

export function expectCartProductShape(product: unknown): asserts product is JsonRecord {
  expectRecord(product);
  expectNumber(product.id);
  expectNonEmptyString(product.title);
  expectNonNegativeNumber(product.price);
  expectNonNegativeNumber(product.quantity);
  expectNonNegativeNumber(product.total);
  expectNonNegativeNumber(product.discountPercentage);
  expectNonEmptyString(product.thumbnail);
}

export function expectCartShape(cart: unknown): asserts cart is Cart {
  expectRecord(cart);

  const id = cart.id;
  const products = cart.products;
  const total = cart.total;
  const discountedTotal = cart.discountedTotal;
  const userId = cart.userId;
  const totalProducts = cart.totalProducts;
  const totalQuantity = cart.totalQuantity;

  expectNumber(id);
  expectRecordArray(products);
  expectNonNegativeNumber(total);
  expectNonNegativeNumber(discountedTotal);
  expectNumber(userId);
  expectNonNegativeNumber(totalProducts);
  expectNonNegativeNumber(totalQuantity);

  for (const product of products) {
    expectCartProductShape(product);
  }

  expect(discountedTotal).toBeLessThanOrEqual(total);
  expect(totalProducts).toBeGreaterThanOrEqual(products.length);
  expect(totalQuantity).toBeGreaterThanOrEqual(totalProducts);
}

export function expectCartListShape(body: unknown): asserts body is CartList {
  expectRecord(body);
  const carts = body.carts;
  expectRecordArray(carts);
  expectPaginationFields(body);
  for (const cart of carts) {
    expectCartShape(cart);
  }
}
