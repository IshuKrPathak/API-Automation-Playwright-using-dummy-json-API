import { expect, test } from '@playwright/test';
import { endpoints, expectJsonResponse, expectNotFoundResponse } from '../../utils/api-client';
import {
  expectCartListShape,
  expectCartShape,
  expectDeletedResourceShape,
} from '../../utils/schema-validators';

const SEEDED_CART_ID = 1;
const UNKNOWN_CART_ID = 999_999;
const SEEDED_USER_ID_WITH_CARTS = 5;
const ADD_CART_USER_ID = 1;
const SEEDED_CART_PRODUCT_ID = 1;
const SECOND_CART_PRODUCT_ID = 2;
const PAGE_LIMIT = 5;
const FIRST_PAGE_SKIP = 0;

test.describe('carts API', () => {
  test('returns a paginated cart list with stable totals @smoke @contract', async ({ request }) => {
    const response = await request.get(endpoints.carts, {
      params: { limit: PAGE_LIMIT, skip: FIRST_PAGE_SKIP },
    });

    const body = await expectJsonResponse<unknown>(response, 200);
    expectCartListShape(body);
    expect(body.carts).toHaveLength(PAGE_LIMIT);
    expect(body.skip).toBe(FIRST_PAGE_SKIP);
    expect(body.limit).toBe(PAGE_LIMIT);
    expect(body.total).toBeGreaterThanOrEqual(body.carts.length);
  });

  test('returns a single cart by id @regression @contract', async ({ request }) => {
    const response = await request.get(endpoints.cart(SEEDED_CART_ID));

    const cart = await expectJsonResponse<unknown>(response, 200);
    expectCartShape(cart);
    expect(cart.id).toBe(SEEDED_CART_ID);
    expect(cart.products.length).toBeGreaterThan(0);
  });

  test('returns not found for an unknown cart id @regression @negative', async ({ request }) => {
    const response = await request.get(endpoints.cart(UNKNOWN_CART_ID));
    await expectNotFoundResponse(response);
  });

  test('returns carts for a specific user @regression @contract', async ({ request }) => {
    const userId = SEEDED_USER_ID_WITH_CARTS;
    const response = await request.get(endpoints.userCarts(userId));

    const body = await expectJsonResponse<unknown>(response, 200);
    expectCartListShape(body);
    expect(body.carts.length).toBeGreaterThan(0);

    for (const cart of body.carts) {
      expect(cart.userId).toBe(userId);
    }
  });

  test('simulates adding a cart @regression @crud', async ({ request }) => {
    const response = await request.post(endpoints.addCart, {
      data: {
        userId: ADD_CART_USER_ID,
        products: [
          { id: SEEDED_CART_PRODUCT_ID, quantity: 2 },
          { id: SECOND_CART_PRODUCT_ID, quantity: 1 },
        ],
      },
    });

    const cart = await expectJsonResponse<unknown>(response, 201);
    expectCartShape(cart);
    expect(cart.userId).toBe(ADD_CART_USER_ID);
    expect(cart.totalProducts).toBe(2);
    expect(cart.totalQuantity).toBe(3);
  });

  test('simulates updating a cart @regression @crud', async ({ request }) => {
    const response = await request.patch(endpoints.cart(SEEDED_CART_ID), {
      data: {
        merge: true,
        products: [{ id: SEEDED_CART_PRODUCT_ID, quantity: 1 }],
      },
    });

    const cart = await expectJsonResponse<unknown>(response, 200);
    expectCartShape(cart);
    expect(cart.id).toBe(SEEDED_CART_ID);
    expect(
      cart.products.some(
        (product) => product.id === SEEDED_CART_PRODUCT_ID && product.quantity === 1,
      ),
    ).toBeTruthy();
  });

  test('simulates deleting a cart @regression @crud', async ({ request }) => {
    const response = await request.delete(endpoints.cart(SEEDED_CART_ID));

    const deletedCart = await expectJsonResponse<unknown>(response, 200);
    expectCartShape(deletedCart);
    expectDeletedResourceShape(deletedCart);
    expect(deletedCart.id).toBe(SEEDED_CART_ID);
  });
});
