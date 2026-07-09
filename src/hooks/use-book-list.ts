import { useCallback, useEffect, useState } from 'react';

import { getBooks, type Book } from '@/api/books';

const PAGE_SIZE = 20;

type BookListState = {
  books: Book[];
  hasMore: boolean;
  loading: boolean;
  loadingMore: boolean;
  error: string | null;
};

export function useBookList(searchQuery: string) {
  const [state, setState] = useState<BookListState>({
    books: [],
    hasMore: true,
    loading: true,
    loadingMore: false,
    error: null,
  });
  const [page, setPage] = useState(0);

  const loadPage = useCallback(
    async (pageToLoad: number, replace: boolean) => {
      setState((prev) => ({ ...prev, loading: replace, loadingMore: !replace, error: null }));

      try {
        const result = await getBooks(pageToLoad, PAGE_SIZE, searchQuery || undefined);
        setState((prev) => ({
          ...prev,
          books: replace ? result.books : [...prev.books, ...result.books],
          hasMore: result.hasMore,
          loading: false,
          loadingMore: false,
        }));
        setPage(result.page);
      } catch (e) {
        setState((prev) => ({
          ...prev,
          loading: false,
          loadingMore: false,
          error: e instanceof Error ? e.message : 'Something went wrong.',
        }));
      }
    },
    [searchQuery]
  );

  useEffect(() => {
    setPage(0);
    loadPage(1, true);
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (state.loading || state.loadingMore || !state.hasMore) {
      return;
    }
    loadPage(page + 1, false);
  }, [state.loading, state.loadingMore, state.hasMore, page, loadPage]);

  const retry = useCallback(() => {
    if (state.books.length === 0) {
      loadPage(1, true);
    } else {
      loadPage(page + 1, false);
    }
  }, [state.books.length, page, loadPage]);

  return { ...state, loadMore, retry };
}
