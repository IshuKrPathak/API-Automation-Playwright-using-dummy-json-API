import { expect, test } from '@playwright/test';
import { endpoints, expectJsonResponse, expectNotFoundResponse } from '../../utils/api-client';
import {
  expectDeletedResourceShape,
  expectProductCategoryShape,
  expectProductListShape,
  expectProductShape,
} from '../../utils/schema-validators';

const SEEDED_PRODUCT_ID = 1;
const UNKNOWN_PRODUCT_ID = 999_999;
const PAGE_LIMIT = 5;
const FIRST_PAGE_SKIP = 0;

test.describe('products API', () => {
  test('returns a paginated product list with stable contract fields @smoke @contract', async ({
    request,
  }) => {
    const response = await request.get(endpoints.products, {
      params: { limit: PAGE_LIMIT, skip: FIRST_PAGE_SKIP },
    });

    const body = await expectJsonResponse<unknown>(response, 200);
    expectProductListShape(body);
    expect(body.products).toHaveLength(PAGE_LIMIT);
    expect(body.skip).toBe(FIRST_PAGE_SKIP);
    expect(body.limit).toBe(PAGE_LIMIT);
    expect(body.total).toBeGreaterThanOrEqual(body.products.length);
  });

  test('returns a single product by id @smoke @contract', async ({ request }) => {
    const response = await request.get(endpoints.product(SEEDED_PRODUCT_ID));

    const product = await expectJsonResponse<unknown>(response, 200);
    expectProductShape(product);
    expect(product.id).toBe(SEEDED_PRODUCT_ID);
  });

  test('filters product search results by query @regression', async ({ request }) => {
    const response = await request.get(endpoints.searchProducts, {
      params: { q: 'mascara' },
    });

    const body = await expectJsonResponse<unknown>(response, 200);
    expectProductListShape(body);
    expect(body.products.length).toBeGreaterThan(0);

    const hasRelevantMatch = body.products.some((product) => {
      const searchableFields = [
        product.title,
        product.description,
        product.category,
        product.brand,
      ];
      return searchableFields.some((field) =>
        typeof field === 'string' ? field.toLowerCase().includes('mascara') : false,
      );
    });

    expect(hasRelevantMatch).toBeTruthy();
  });

  test('returns product categories as reusable navigation data @regression @contract', async ({
    request,
  }) => {
    const response = await request.get(endpoints.productCategories);

    const categories = await expectJsonResponse<unknown[]>(response, 200);
    expect(Array.isArray(categories)).toBeTruthy();
    expect(categories.length).toBeGreaterThan(0);

    for (const category of categories) {
      expectProductCategoryShape(category);
      expect(category.url).toContain('/products/category/');
    }
  });

  test('simulates creating a product without requiring persistence @regression @crud', async ({
    request,
  }) => {
    const productPayload = {
      title: 'Portfolio API Notebook',
      description: 'A product payload used by automated API tests.',
      price: 12.99,
      category: 'office',
    };

    const response = await request.post(endpoints.addProduct, { data: productPayload });

    const createdProduct = await expectJsonResponse<Record<string, unknown>>(response, 201);
    expect(createdProduct).toEqual(expect.objectContaining(productPayload));
    expect(typeof createdProduct.id).toBe('number');
  });

  test('simulates updating a product field @regression @crud', async ({ request }) => {
    const updatedTitle = 'Updated Portfolio API Notebook';

    const response = await request.patch(endpoints.product(SEEDED_PRODUCT_ID), {
      data: { title: updatedTitle },
    });

    const updatedProduct = await expectJsonResponse<Record<string, unknown>>(response, 200);
    expect(updatedProduct.id).toBe(SEEDED_PRODUCT_ID);
    expect(updatedProduct.title).toBe(updatedTitle);
  });

  test('simulates deleting a product @regression @crud', async ({ request }) => {
    const response = await request.delete(endpoints.product(SEEDED_PRODUCT_ID));

    const deletedProduct = await expectJsonResponse<unknown>(response, 200);
    expectDeletedResourceShape(deletedProduct);
    expect(deletedProduct.id).toBe(SEEDED_PRODUCT_ID);
  });

  test('returns not found for an unknown product id @regression @negative', async ({ request }) => {
    const response = await request.get(endpoints.product(UNKNOWN_PRODUCT_ID));
    await expectNotFoundResponse(response);
  });
});
