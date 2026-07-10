import type { Book } from '@/api/books';

import { selectCartTotal, useCartStore } from './use-cart-store';

function makeBook(overrides: Partial<Book> = {}): Book {
  return {
    id: 'book-1',
    title: 'The Silent Orchard',
    author: 'Elena Hartley',
    coverUrl: 'https://picsum.photos/seed/book-1/300/450',
    price: 12.99,
    shortDescription: 'A gripping tale.',
    ...overrides,
  };
}

beforeEach(() => {
  useCartStore.setState({ items: [] });
});

describe('useCartStore.addItem', () => {
  it('adds a new book with default quantity of 1', () => {
    useCartStore.getState().addItem(makeBook());

    expect(useCartStore.getState().items).toEqual([{ book: makeBook(), quantity: 1 }]);
  });

  it('adds a new book with an explicit quantity', () => {
    useCartStore.getState().addItem(makeBook(), 3);

    expect(useCartStore.getState().items[0].quantity).toBe(3);
  });

  it('increments quantity when the same book is added again', () => {
    useCartStore.getState().addItem(makeBook());
    useCartStore.getState().addItem(makeBook(), 2);

    expect(useCartStore.getState().items).toEqual([{ book: makeBook(), quantity: 3 }]);
  });

  it('keeps distinct books as separate line items', () => {
    const other = makeBook({ id: 'book-2', title: 'Whispers of Meridian' });

    useCartStore.getState().addItem(makeBook());
    useCartStore.getState().addItem(other);

    expect(useCartStore.getState().items).toHaveLength(2);
  });
});

describe('useCartStore.removeItem', () => {
  it('removes the matching book', () => {
    const other = makeBook({ id: 'book-2' });
    useCartStore.getState().addItem(makeBook());
    useCartStore.getState().addItem(other);

    useCartStore.getState().removeItem('book-1');

    expect(useCartStore.getState().items).toEqual([{ book: other, quantity: 1 }]);
  });

  it('is a no-op when the book is not in the cart', () => {
    useCartStore.getState().addItem(makeBook());

    useCartStore.getState().removeItem('does-not-exist');

    expect(useCartStore.getState().items).toHaveLength(1);
  });
});

describe('useCartStore.updateQuantity', () => {
  it('updates the quantity for the matching book', () => {
    useCartStore.getState().addItem(makeBook());

    useCartStore.getState().updateQuantity('book-1', 5);

    expect(useCartStore.getState().items[0].quantity).toBe(5);
  });

  it('removes the item when quantity is set to 0', () => {
    useCartStore.getState().addItem(makeBook());

    useCartStore.getState().updateQuantity('book-1', 0);

    expect(useCartStore.getState().items).toEqual([]);
  });

  it('removes the item when quantity is set below 0', () => {
    useCartStore.getState().addItem(makeBook());

    useCartStore.getState().updateQuantity('book-1', -2);

    expect(useCartStore.getState().items).toEqual([]);
  });
});

describe('selectCartTotal', () => {
  it('returns 0 for an empty cart', () => {
    expect(selectCartTotal(useCartStore.getState())).toBe(0);
  });

  it('sums price * quantity across all line items', () => {
    useCartStore.getState().addItem(makeBook({ id: 'book-1', price: 10 }), 2);
    useCartStore.getState().addItem(makeBook({ id: 'book-2', price: 5.5 }), 1);

    expect(selectCartTotal(useCartStore.getState())).toBe(25.5);
  });
});
