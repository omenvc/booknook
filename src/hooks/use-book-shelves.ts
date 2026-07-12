import { useCallback, useEffect, useState } from 'react';

import { getBooks, type Book } from '@/api/books';

export type BookShelf = {
  key: string;
  title: string;
  books: Book[];
};

const SHELF_SIZE = 10;

const SHELF_DEFS: { key: string; title: string; page: number }[] = [
  { key: 'new-arrivals', title: 'New Arrivals', page: 1 },
  { key: 'trending', title: 'Trending Now', page: 2 },
  { key: 'editors-picks', title: "Editor's Picks", page: 3 },
];

type BookShelvesState = {
  shelves: BookShelf[];
  loading: boolean;
  error: string | null;
};

export function useBookShelves() {
  const [state, setState] = useState<BookShelvesState>({
    shelves: [],
    loading: true,
    error: null,
  });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ shelves: [], loading: true, error: null });

    Promise.all(SHELF_DEFS.map((def) => getBooks(def.page, SHELF_SIZE)))
      .then((results) => {
        if (!cancelled) {
          setState({
            shelves: SHELF_DEFS.map((def, index) => ({
              key: def.key,
              title: def.title,
              books: results[index].books,
            })),
            loading: false,
            error: null,
          });
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setState({
            shelves: [],
            loading: false,
            error: e instanceof Error ? e.message : 'Something went wrong.',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [reloadToken]);

  const retry = useCallback(() => setReloadToken((token) => token + 1), []);

  return { ...state, retry };
}
