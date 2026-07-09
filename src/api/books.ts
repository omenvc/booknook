import { delay, shouldFail } from './mock-network';

export type Book = {
  id: string;
  title: string;
  author: string;
  coverUrl: string;
  price: number;
  shortDescription: string;
};

export type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

export type Review = {
  id: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
};

export type BookDetails = Book & {
  description: string;
  reviews: Review[];
  stockStatus: StockStatus;
};

export type CartItem = {
  book: Book;
  quantity: number;
};

export type PaginatedBooks = {
  books: Book[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
};

type MockOptions = {
  simulateFailure?: boolean;
};

const GET_BOOKS_FAILURE_RATE = 0.1;
const GET_BOOK_DETAILS_FAILURE_RATE = 0.1;

const BOOK_COUNT = 42;

const TITLE_PREFIXES = [
  'The Silent',
  'Whispers of',
  'Shadows over',
  'A Season of',
  'The Last',
  'Echoes of',
  'The Hidden',
  'Beneath the',
  'The Forgotten',
  'Rivers of',
];
const TITLE_NOUNS = [
  'Orchard',
  'Meridian',
  'Harbor',
  'Lantern',
  'Cinder',
  'Willow',
  'Compass',
  'Tideline',
  'Hollow',
  'Ember',
];
const FIRST_NAMES = [
  'Elena',
  'Marcus',
  'Priya',
  'Thomas',
  'Ingrid',
  'Kwame',
  'Sofia',
  'Daniel',
  'Naomi',
  'Lucas',
];
const LAST_NAMES = [
  'Hartley',
  'Okafor',
  'Bergström',
  'Reyes',
  'Whitfield',
  'Nakamura',
  'Costa',
  'Fenwick',
  'Alvarez',
  'Marsh',
];
const REVIEW_AUTHORS = ['Jamie', 'Alex', 'Sam', 'Riley', 'Morgan', 'Casey', 'Taylor', 'Jordan'];
const REVIEW_COMMENTS = [
  "Couldn't put it down from start to finish.",
  'A slow start but the ending made it worth it.',
  'Beautifully written, though a bit predictable.',
  "One of the best books I've read this year.",
  'Solid story, but the pacing felt uneven.',
  'The characters felt real and the plot kept me guessing.',
];
const STOCK_STATUS_CYCLE: StockStatus[] = [
  'in-stock',
  'in-stock',
  'in-stock',
  'low-stock',
  'out-of-stock',
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function buildBook(index: number): Book {
  const prefix = TITLE_PREFIXES[index % TITLE_PREFIXES.length];
  const noun = TITLE_NOUNS[Math.floor(index / TITLE_PREFIXES.length) % TITLE_NOUNS.length];
  const title = `${prefix} ${noun}`;
  const firstName = FIRST_NAMES[index % FIRST_NAMES.length];
  const lastName = LAST_NAMES[Math.floor(index / FIRST_NAMES.length) % LAST_NAMES.length];
  const author = `${firstName} ${lastName}`;
  const id = `book-${index + 1}`;

  return {
    id,
    title,
    author,
    coverUrl: `https://picsum.photos/seed/${id}/300/450`,
    price: 9.99 + (index % 6) * 3,
    shortDescription: `A gripping tale of ${noun.toLowerCase()} and resolve, from acclaimed author ${author}.`,
  };
}

const MOCK_BOOKS: Book[] = Array.from({ length: BOOK_COUNT }, (_, index) => buildBook(index));

function buildReviews(book: Book): Review[] {
  const seed = hashString(book.id);
  const count = seed % 6;

  return Array.from({ length: count }, (_, i) => ({
    id: `${book.id}-review-${i + 1}`,
    author: REVIEW_AUTHORS[(seed + i) % REVIEW_AUTHORS.length],
    rating: ((seed + i * 3) % 5) + 1,
    comment: REVIEW_COMMENTS[(seed + i * 2) % REVIEW_COMMENTS.length],
    date: new Date(2024, (seed + i) % 12, ((seed + i * 5) % 27) + 1).toISOString().slice(0, 10),
  }));
}

function buildDescription(book: Book): string {
  return `${book.shortDescription} Spanning generations and secrets long buried, this novel has earned a devoted following for its vivid prose and unforgettable cast.`;
}

function buildStockStatus(book: Book): StockStatus {
  const seed = hashString(book.id);
  return STOCK_STATUS_CYCLE[seed % STOCK_STATUS_CYCLE.length];
}

export async function getBooks(
  page: number,
  pageSize: number,
  searchQuery?: string,
  options?: MockOptions
): Promise<PaginatedBooks> {
  await delay();

  if (shouldFail(options?.simulateFailure, GET_BOOKS_FAILURE_RATE)) {
    throw new Error('Failed to load books. Please try again.');
  }

  const query = searchQuery?.trim().toLowerCase();
  const filtered = query
    ? MOCK_BOOKS.filter(
        (book) =>
          book.title.toLowerCase().includes(query) || book.author.toLowerCase().includes(query)
      )
    : MOCK_BOOKS;

  const start = (page - 1) * pageSize;
  const books = filtered.slice(start, start + pageSize);

  return {
    books,
    total: filtered.length,
    page,
    pageSize,
    hasMore: start + pageSize < filtered.length,
  };
}

export async function getBookDetails(
  id: string,
  options?: MockOptions
): Promise<BookDetails> {
  await delay();

  if (shouldFail(options?.simulateFailure, GET_BOOK_DETAILS_FAILURE_RATE)) {
    throw new Error('Failed to load book details. Please try again.');
  }

  const book = MOCK_BOOKS.find((candidate) => candidate.id === id);
  if (!book) {
    throw new Error(`Book with id "${id}" not found.`);
  }

  return {
    ...book,
    description: buildDescription(book),
    reviews: buildReviews(book),
    stockStatus: buildStockStatus(book),
  };
}
