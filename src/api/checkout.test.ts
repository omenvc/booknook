import type { Book, CartItem } from './books';
import { checkout } from './checkout';

jest.mock('./mock-network', () => ({
  ...jest.requireActual('./mock-network'),
  delay: jest.fn().mockResolvedValue(undefined),
}));

function makeCartItem(overrides: Partial<Book> = {}, quantity = 1): CartItem {
  return {
    book: {
      id: 'book-1',
      title: 'The Silent Orchard',
      author: 'Elena Hartley',
      coverUrl: 'https://picsum.photos/seed/book-1/300/450',
      price: 12.99,
      shortDescription: 'A gripping tale.',
      ...overrides,
    },
    quantity,
  };
}

describe('checkout', () => {
  it('returns a success result with the summed total when not simulating failure', async () => {
    const items = [makeCartItem({ id: 'book-1', price: 10 }, 2), makeCartItem({ id: 'book-2', price: 5.5 }, 1)];

    const result = await checkout(items, { simulateFailure: false });

    expect(result).toMatchObject({ success: true, total: 25.5 });
    if (result.success) {
      expect(result.orderId).toEqual(expect.any(String));
      expect(result.orderId.length).toBeGreaterThan(0);
    }
  });

  it('rounds the total to 2 decimal places', async () => {
    const items = [makeCartItem({ price: 9.999 }, 1)];

    const result = await checkout(items, { simulateFailure: false });

    expect(result).toMatchObject({ success: true, total: 10 });
  });

  it('returns a failure result with an error message when simulating failure', async () => {
    const items = [makeCartItem()];

    const result = await checkout(items, { simulateFailure: true });

    expect(result).toEqual({
      success: false,
      error: 'Payment could not be processed. Please try again.',
    });
  });

  it('returns success with a total of 0 for an empty cart', async () => {
    const result = await checkout([], { simulateFailure: false });

    expect(result).toMatchObject({ success: true, total: 0 });
  });
});
