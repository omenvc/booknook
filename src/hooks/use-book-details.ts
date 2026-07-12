import { useCallback, useEffect, useState } from 'react';

import { getBookDetails, type BookDetails } from '@/api/books';

type BookDetailsState = {
  book: BookDetails | null;
  loading: boolean;
  error: string | null;
};

export function useBookDetails(id: string) {
  const [state, setState] = useState<BookDetailsState>({
    book: null,
    loading: true,
    error: null,
  });
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setState({ book: null, loading: true, error: null });

    getBookDetails(id)
      .then((book) => {
        if (!cancelled) {
          setState({ book, loading: false, error: null });
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setState({
            book: null,
            loading: false,
            error: e instanceof Error ? e.message : 'Something went wrong.',
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [id, reloadToken]);

  const retry = useCallback(() => setReloadToken((token) => token + 1), []);

  return { ...state, retry };
}
