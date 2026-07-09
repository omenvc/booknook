import { create } from 'zustand';

import type { Book, CartItem } from '@/api/books';

type CartState = {
  items: CartItem[];
  addItem: (book: Book, quantity?: number) => void;
  removeItem: (bookId: string) => void;
  clear: () => void;
};

export const useCartStore = create<CartState>((set) => ({
  items: [],
  addItem: (book, quantity = 1) =>
    set((state) => {
      const existing = state.items.find((item) => item.book.id === book.id);
      if (existing) {
        return {
          items: state.items.map((item) =>
            item.book.id === book.id ? { ...item, quantity: item.quantity + quantity } : item
          ),
        };
      }
      return { items: [...state.items, { book, quantity }] };
    }),
  removeItem: (bookId) =>
    set((state) => ({ items: state.items.filter((item) => item.book.id !== bookId) })),
  clear: () => set({ items: [] }),
}));
