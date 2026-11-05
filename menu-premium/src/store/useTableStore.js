import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';

export const useTableStore = create(
  persist(
    (set, get) => ({
      tableNumber: '08',
      sessionToken: null,
      customer: { id: null, name: '' },
      currentRound: [],
      sentOrders: [],
      upsellSuggestion: null,
      activeCall: null,
      waiterCalls: [],

      // Configurações definidas pelo dono do restaurante
      restaurantSettings: {
        showTableTotal: true // true = Mostra R$ acumulado | false = Modo Consumo Livre
      },

      toggleShowTableTotal: () =>
        set((state) => ({
          restaurantSettings: {
            ...state.restaurantSettings,
            showTableTotal: !state.restaurantSettings.showTableTotal
          }
        })),

      joinTable: (tableNumber, sessionToken, name) => {
        const existingId = get().customer.id || uuidv4();
        set({
          tableNumber,
          sessionToken,
          customer: { id: existingId, name }
        });
      },

      addToRound: (product, notes = '') => {
        const { currentRound } = get();
        const existingIndex = currentRound.findIndex(
          (item) => item.id === product.id && item.notes === notes
        );

        let updatedRound;
        if (existingIndex > -1) {
          updatedRound = currentRound.map((item, idx) =>
            idx === existingIndex ? { ...item, qty: item.qty + 1 } : item
          );
        } else {
          updatedRound = [
            ...currentRound,
            {
              ...product,
              qty: 1,
              notes,
              destination: product.destination || 'KITCHEN'
            }
          ];
        }

        set({
          currentRound: updatedRound,
          upsellSuggestion: product.upsellItem || null
        });
      },

      removeFromRound: (productId, notes = '') => {
        const { currentRound } = get();
        const target = currentRound.find((i) => i.id === productId && i.notes === notes);
        if (!target) return;

        if (target.qty > 1) {
          set({
            currentRound: currentRound.map((i) =>
              i.id === productId && i.notes === notes ? { ...i, qty: i.qty - 1 } : i
            )
          });
        } else {
          set({
            currentRound: currentRound.filter((i) => !(i.id === productId && i.notes === notes))
          });
        }
      },

      dismissUpsell: () => set({ upsellSuggestion: null }),

      sendRoundToPreparation: async () => {
        const { currentRound, customer, tableNumber, sentOrders } = get();
        if (currentRound.length === 0) return;

        const newOrderRound = currentRound.map((item) => ({
          ...item,
          orderId: uuidv4(),
          clientId: customer.id || 'visitante',
          clientName: customer.name || 'Visitante',
          tableNumber: tableNumber || '08',
          status: 'PREPARING',
          sentAt: new Date().toISOString()
        }));

        set({
          sentOrders: [...sentOrders, ...newOrderRound],
          currentRound: [],
          upsellSuggestion: null
        });
      },

      updateOrderStatus: (orderId, nextStatus) => {
        set({
          sentOrders: get().sentOrders.map((order) =>
            order.orderId === orderId ? { ...order, status: nextStatus } : order
          )
        });
      },

      getBillSummary: (includeServiceFee = true) => {
        const { sentOrders, customer } = get();
        const multiplier = includeServiceFee ? 1.1 : 1;
        const activeClientId = customer.id || 'visitante';

        const mySubtotal = sentOrders
          .filter((item) => item.clientId === activeClientId)
          .reduce((acc, item) => acc + item.price * item.qty, 0);

        const tableSubtotal = sentOrders.reduce(
          (acc, item) => acc + item.price * item.qty,
          0
        );

        const totalItemsCount = sentOrders.reduce((acc, item) => acc + item.qty, 0);

        return {
          myTotal: mySubtotal * multiplier,
          tableTotal: tableSubtotal * multiplier,
          totalItemsCount,
          myItems: sentOrders.filter((item) => item.clientId === activeClientId),
          allItems: sentOrders
        };
      },

      triggerWaiterCall: (type) => {
        const { tableNumber, customer, waiterCalls } = get();
        const newCall = {
          id: uuidv4(),
          tableNumber: tableNumber || '08',
          clientName: customer.name || 'Visitante',
          type,
          createdAt: new Date().toISOString()
        };
        set({
          activeCall: { type, timestamp: Date.now() },
          waiterCalls: [newCall, ...waiterCalls]
        });
        setTimeout(() => set({ activeCall: null }), 3500);
      },

      resolveWaiterCall: (callId) => {
        set({
          waiterCalls: get().waiterCalls.filter((call) => call.id !== callId)
        });
      }
    }),
    { name: 'comanda-mesa-storage' }
  )
);

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === 'comanda-mesa-storage') {
      useTableStore.persist.rehydrate();
    }
  });
}