import { expect, test } from '@playwright/test';
import {
  expectAuthTokenResponseShape,
  expectCartShape,
  expectErrorResponseShape,
  expectProductShape,
  expectUserShape,
} from '../../utils/schema-validators';

const validProduct = {
  id: 1,
  title: 'Sample Product',
  description: 'A sample product for validator tests.',
  category: 'office',
  price: 12.99,
  rating: 4.2,
  stock: 50,
  images: ['https://example.com/img.jpg'],
  thumbnail: 'https://example.com/thumb.jpg',
} as const;

const validUser = {
  id: 1,
  firstName: 'Emily',
  lastName: 'Johnson',
  email: 'emily.johnson@example.com',
  username: 'emilys',
  age: 30,
  gender: 'female',
} as const;

const validCart = {
  id: 1,
  userId: 5,
  products: [
    {
      id: 1,
      title: 'Widget',
      price: 10,
      quantity: 2,
      total: 20,
      discountPercentage: 5,
      thumbnail: 'https://example.com/widget.jpg',
    },
  ],
  total: 20,
  discountedTotal: 19,
  totalProducts: 1,
  totalQuantity: 2,
} as const;

const validAuthTokens = {
  accessToken: 'access',
  refreshToken: 'refresh',
} as const;

test.describe('schema validators @unit', () => {
  test.describe('expectProductShape', () => {
    test('passes for a valid product', () => {
      expect(() => expectProductShape({ ...validProduct })).not.toThrow();
    });

    test('fails when price is negative', () => {
      expect(() => expectProductShape({ ...validProduct, price: -1 })).toThrow();
    });

    test('fails when rating exceeds the documented 0-5 range', () => {
      expect(() => expectProductShape({ ...validProduct, rating: 6 })).toThrow();
    });

    test('fails when stock is negative', () => {
      expect(() => expectProductShape({ ...validProduct, stock: -10 })).toThrow();
    });

    test('fails when title is missing', () => {
      const { title: _title, ...rest } = validProduct;
      expect(() => expectProductShape(rest)).toThrow();
    });

    test('fails when value is not an object', () => {
      expect(() => expectProductShape(null)).toThrow();
      expect(() => expectProductShape('product')).toThrow();
      expect(() => expectProductShape([1, 2, 3])).toThrow();
    });
  });

  test.describe('expectUserShape', () => {
    test('passes for a valid user', () => {
      expect(() => expectUserShape({ ...validUser })).not.toThrow();
    });

    test('fails for invalid email format', () => {
      expect(() => expectUserShape({ ...validUser, email: 'not-an-email' })).toThrow();
    });

    test('fails when age is negative', () => {
      expect(() => expectUserShape({ ...validUser, age: -5 })).toThrow();
    });

    test('fails when username is empty', () => {
      expect(() => expectUserShape({ ...validUser, username: '' })).toThrow();
    });
  });

  test.describe('expectCartShape', () => {
    test('passes for a valid cart', () => {
      expect(() => expectCartShape({ ...validCart })).not.toThrow();
    });

    test('fails when discountedTotal exceeds total', () => {
      expect(() => expectCartShape({ ...validCart, discountedTotal: 100 })).toThrow();
    });

    test('fails when totalProducts is less than products.length', () => {
      expect(() => expectCartShape({ ...validCart, totalProducts: 0 })).toThrow();
    });

    test('fails when totalQuantity is less than totalProducts', () => {
      expect(() => expectCartShape({ ...validCart, totalProducts: 1, totalQuantity: 0 })).toThrow();
    });

    test('fails when total is negative', () => {
      expect(() => expectCartShape({ ...validCart, total: -1 })).toThrow();
    });
  });

  test.describe('expectAuthTokenResponseShape', () => {
    test('passes for a valid token response', () => {
      expect(() => expectAuthTokenResponseShape({ ...validAuthTokens })).not.toThrow();
    });

    test('fails when accessToken is missing', () => {
      expect(() => expectAuthTokenResponseShape({ refreshToken: 'r' })).toThrow();
    });

    test('fails when refreshToken is an empty string', () => {
      expect(() => expectAuthTokenResponseShape({ accessToken: 'a', refreshToken: '' })).toThrow();
    });
  });

  test.describe('expectErrorResponseShape', () => {
    test('passes for a valid error body', () => {
      expect(() => expectErrorResponseShape({ message: 'not found' })).not.toThrow();
    });

    test('fails when message is empty', () => {
      expect(() => expectErrorResponseShape({ message: '' })).toThrow();
    });

    test('fails when message is missing', () => {
      expect(() => expectErrorResponseShape({})).toThrow();
    });
  });
});
