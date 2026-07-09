import type { CartItem } from './books';
import { delay, shouldFail } from './mock-network';

export type CheckoutResult =
  | { success: true; orderId: string; total: number }
  | { success: false; error: string };

type CheckoutOptions = {
  simulateFailure?: boolean;
};

const CHECKOUT_FAILURE_RATE = 0.1;

export async function checkout(
  cartItems: CartItem[],
  options?: CheckoutOptions
): Promise<CheckoutResult> {
  await delay();

  if (shouldFail(options?.simulateFailure, CHECKOUT_FAILURE_RATE)) {
    return { success: false, error: 'Payment could not be processed. Please try again.' };
  }

  const total = cartItems.reduce((sum, item) => sum + item.book.price * item.quantity, 0);

  return {
    success: true,
    orderId: generateOrderId(),
    total: Math.round(total * 100) / 100,
  };
}

function generateOrderId(): string {
  return `ord-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
