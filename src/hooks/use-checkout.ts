import { useCallback, useState } from 'react';

import type { CartItem } from '@/api/books';
import { checkout } from '@/api/checkout';

type CheckoutState = {
  loading: boolean;
  error: string | null;
  result: { orderId: string; total: number } | null;
};

export function useCheckout() {
  const [state, setState] = useState<CheckoutState>({
    loading: false,
    error: null,
    result: null,
  });

  const submit = useCallback(async (cartItems: CartItem[]) => {
    setState({ loading: true, error: null, result: null });

    try {
      const response = await checkout(cartItems);
      if (response.success) {
        setState({
          loading: false,
          error: null,
          result: { orderId: response.orderId, total: response.total },
        });
      } else {
        setState({ loading: false, error: response.error, result: null });
      }
    } catch (e) {
      setState({
        loading: false,
        error: e instanceof Error ? e.message : 'Something went wrong.',
        result: null,
      });
    }
  }, []);

  return { ...state, submit };
}
