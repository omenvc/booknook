import { create } from 'zustand';

import type { CartItem } from '@/api/books';

export type Order = {
  orderId: string;
  total: number;
  items: CartItem[];
  timestamp: number;
};

type OrderHistoryState = {
  orders: Order[];
  addOrder: (order: Order) => void;
};

export const useOrderHistoryStore = create<OrderHistoryState>((set) => ({
  orders: [],
  addOrder: (order) => set((state) => ({ orders: [order, ...state.orders] })),
}));
