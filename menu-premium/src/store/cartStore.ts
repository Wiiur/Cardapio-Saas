import { create } from 'zustand';
import type { Product } from '@prisma/client';

export interface CartItem {
  product: Product;
  quantity: number;
  observations?: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (product: Product, quantity: number, observations?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],

  addItem: (product, quantity, observations) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.product.id === product.id);
      
      if (existingItem) {
        return {
          items: state.items.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity, observations }
              : item
          ),
        };
      }

      return { items: [...state.items, { product, quantity, observations }] };
    });
  },

  removeItem: (productId) => {
    set((state) => ({
      items: state.items.filter((item) => item.product.id !== productId),
    }));
  },

  updateQuantity: (productId, quantity) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    }));
  },

  clearCart: () => set({ items: [] }),

  getCartTotal: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.product.price * item.quantity, 0);
  },

  getTotalItems: () => {
    const { items } = get();
    return items.reduce((total, item) => total + item.quantity, 0);
  },
}));