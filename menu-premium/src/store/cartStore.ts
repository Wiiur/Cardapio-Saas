import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@prisma/client';

export interface CartItem {
  product: Product;
  quantity: number;
  observations?: string;
}

interface CartStore {
  items: CartItem[];
  customerName: string;
  deviceId: string;
  setCustomerName: (name: string) => void;
  ensureDeviceId: () => string;
  addItem: (product: Product, quantity: number, observations?: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updateObservations: (productId: string, observations: string) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getTotalItems: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      customerName: '',
      deviceId: '',

      setCustomerName: (name) => set({ customerName: name }),

      ensureDeviceId: () => {
        let current = get().deviceId;
        if (!current && typeof window !== 'undefined') {
          current = crypto.randomUUID();
          set({ deviceId: current });
        }
        return current;
      },

      addItem: (product, quantity, observations) => {
        set((state) => {
          const existingItem = state.items.find((item) => item.product.id === product.id);

          if (existingItem) {
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? {
                      ...item,
                      quantity: item.quantity + quantity,
                      observations: observations ?? item.observations,
                    }
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
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }));
      },

      updateObservations: (productId, observations) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, observations } : item
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
    }),
    { name: 'menu-premium-cart' }
  )
);