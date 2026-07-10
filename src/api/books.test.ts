import { getBookDetails, getBooks } from './books';

jest.mock('./mock-network', () => ({
  ...jest.requireActual('./mock-network'),
  delay: jest.fn().mockResolvedValue(undefined),
}));

describe('getBooks', () => {
  it('returns the first page with the requested page size', async () => {
    const result = await getBooks(1, 10, undefined, { simulateFailure: false });

    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(result.books).toHaveLength(10);
    expect(result.total).toBe(42);
    expect(result.hasMore).toBe(true);
  });

  it('paginates to later pages using the correct offset', async () => {
    const page1 = await getBooks(1, 10, undefined, { simulateFailure: false });
    const page2 = await getBooks(2, 10, undefined, { simulateFailure: false });

    expect(page2.books).toHaveLength(10);
    expect(page2.books[0].id).not.toBe(page1.books[0].id);
    expect(page1.books.map((b) => b.id)).not.toEqual(
      expect.arrayContaining(page2.books.map((b) => b.id))
    );
  });

  it('reports hasMore as false on the last page', async () => {
    const result = await getBooks(5, 10, undefined, { simulateFailure: false });

    expect(result.books).toHaveLength(2);
    expect(result.hasMore).toBe(false);
  });

  it('filters by search query matching title or author, case-insensitively', async () => {
    const all = await getBooks(1, 100, undefined, { simulateFailure: false });
    const target = all.books[0];
    const query = target.title.slice(0, 5).toUpperCase();

    const result = await getBooks(1, 100, query, { simulateFailure: false });

    expect(result.books.length).toBeGreaterThan(0);
    expect(
      result.books.every((book) => book.title.toLowerCase().includes(query.toLowerCase()))
    ).toBe(true);
  });

  it('returns an empty result set when no books match the search query', async () => {
    const result = await getBooks(1, 10, 'zzzzznonexistentzzzzz', { simulateFailure: false });

    expect(result.books).toEqual([]);
    expect(result.total).toBe(0);
    expect(result.hasMore).toBe(false);
  });

  it('throws when simulateFailure is true', async () => {
    await expect(getBooks(1, 10, undefined, { simulateFailure: true })).rejects.toThrow(
      'Failed to load books. Please try again.'
    );
  });

  it('resolves normally when simulateFailure is false', async () => {
    await expect(getBooks(1, 10, undefined, { simulateFailure: false })).resolves.toMatchObject({
      page: 1,
    });
  });
});

describe('getBookDetails', () => {
  it('returns details for a known book id', async () => {
    const details = await getBookDetails('book-1', { simulateFailure: false });

    expect(details.id).toBe('book-1');
    expect(details).toHaveProperty('description');
    expect(details).toHaveProperty('reviews');
    expect(details).toHaveProperty('stockStatus');
  });

  it('throws for an unknown book id', async () => {
    await expect(
      getBookDetails('not-a-real-id', { simulateFailure: false })
    ).rejects.toThrow('Book with id "not-a-real-id" not found.');
  });

  it('throws when simulateFailure is true', async () => {
    await expect(getBookDetails('book-1', { simulateFailure: true })).rejects.toThrow(
      'Failed to load book details. Please try again.'
    );
  });

  it('resolves normally when simulateFailure is false', async () => {
    await expect(
      getBookDetails('book-1', { simulateFailure: false })
    ).resolves.toMatchObject({ id: 'book-1' });
  });
});
