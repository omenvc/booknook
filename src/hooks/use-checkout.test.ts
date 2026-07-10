import { act, renderHook } from '@testing-library/react-native';

import type { CartItem } from '@/api/books';
import { checkout } from '@/api/checkout';

import { useCheckout } from './use-checkout';

jest.mock('@/api/checkout');

const mockedCheckout = checkout as jest.MockedFunction<typeof checkout>;

const cartItems: CartItem[] = [
  {
    book: {
      id: 'book-1',
      title: 'The Silent Orchard',
      author: 'Elena Hartley',
      coverUrl: 'https://picsum.photos/seed/book-1/300/450',
      price: 12.99,
      shortDescription: 'A gripping tale.',
    },
    quantity: 1,
  },
];

beforeEach(() => {
  mockedCheckout.mockReset();
});

describe('useCheckout', () => {
  it('starts in an idle, non-loading state', () => {
    const { result } = renderHook(() => useCheckout());

    expect(result.current).toMatchObject({ loading: false, error: null, result: null });
  });

  it('sets result on a successful submit', async () => {
    mockedCheckout.mockResolvedValueOnce({ success: true, orderId: 'ord-123', total: 12.99 });
    const { result } = renderHook(() => useCheckout());

    await act(async () => {
      await result.current.submit(cartItems);
    });

    expect(result.current).toMatchObject({
      loading: false,
      error: null,
      result: { orderId: 'ord-123', total: 12.99 },
    });
  });

  it('sets error on a discriminated-union failure response', async () => {
    mockedCheckout.mockResolvedValueOnce({
      success: false,
      error: 'Payment could not be processed. Please try again.',
    });
    const { result } = renderHook(() => useCheckout());

    await act(async () => {
      await result.current.submit(cartItems);
    });

    expect(result.current).toMatchObject({
      loading: false,
      error: 'Payment could not be processed. Please try again.',
      result: null,
    });
  });

  it('sets a generic error when checkout throws an Error', async () => {
    mockedCheckout.mockRejectedValueOnce(new Error('network exploded'));
    const { result } = renderHook(() => useCheckout());

    await act(async () => {
      await result.current.submit(cartItems);
    });

    expect(result.current).toMatchObject({
      loading: false,
      error: 'network exploded',
      result: null,
    });
  });

  it('falls back to a generic message when checkout throws a non-Error value', async () => {
    mockedCheckout.mockRejectedValueOnce('unexpected string throw');
    const { result } = renderHook(() => useCheckout());

    await act(async () => {
      await result.current.submit(cartItems);
    });

    expect(result.current).toMatchObject({
      loading: false,
      error: 'Something went wrong.',
      result: null,
    });
  });

  it('clears the previous error and populates result when a resubmission succeeds', async () => {
    mockedCheckout.mockResolvedValueOnce({
      success: false,
      error: 'Payment could not be processed. Please try again.',
    });
    const { result } = renderHook(() => useCheckout());

    await act(async () => {
      await result.current.submit(cartItems);
    });
    expect(result.current.error).toBe('Payment could not be processed. Please try again.');

    mockedCheckout.mockResolvedValueOnce({ success: true, orderId: 'ord-456', total: 12.99 });

    await act(async () => {
      await result.current.submit(cartItems);
    });

    expect(result.current).toMatchObject({
      loading: false,
      error: null,
      result: { orderId: 'ord-456', total: 12.99 },
    });
  });
});
