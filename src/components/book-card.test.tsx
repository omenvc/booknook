import { render, screen } from '@testing-library/react-native';

import type { Book } from '@/api/books';

import { BookCard } from './book-card';

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

describe('BookCard price rendering', () => {
  it('formats the price with 2 decimal places and a dollar sign', () => {
    render(<BookCard book={makeBook({ price: 12.99 })} />);

    expect(screen.getByText('$12.99')).toBeTruthy();
  });

  it('pads whole-number prices to 2 decimal places', () => {
    render(<BookCard book={makeBook({ price: 20 })} />);

    expect(screen.getByText('$20.00')).toBeTruthy();
  });

  it('truncates/rounds fractional cents to 2 decimal places', () => {
    render(<BookCard book={makeBook({ price: 9.999 })} />);

    expect(screen.getByText('$10.00')).toBeTruthy();
  });

  it('includes the formatted price in the accessibility label', () => {
    render(<BookCard book={makeBook({ title: 'Rivers of Ember', author: 'Kwame Okafor', price: 15.5 })} />);

    expect(
      screen.getByLabelText('Rivers of Ember by Kwame Okafor, $15.50')
    ).toBeTruthy();
  });
});
