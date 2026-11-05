"use client";

import { useCartStore } from "../../store/cartStore";
import * as motion from "framer-motion/client";
import { X, Trash2, ChevronRight, Plus, Minus, ShoppingBag, Loader2 } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import type { Restaurant, Table } from "@prisma/client";
import { createOrderAction } from "../server/actions/order"; // Importa a nossa Action

interface CartDrawerProps {
  restaurant: Restaurant; // Devolvemos o restaurante aqui
  table: Table;
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ restaurant, table, isOpen, onClose }: CartDrawerProps) {
  const { items, removeItem, updateQuantity, getCartTotal, clearCart } = useCartStore();
  const [isHydrated, setIsHydrated] = useState(false);
  
  // useTransition permite gerir estados de carregamento (loading) do servidor
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "unset";
    
    return () => { document.body.style.overflow = "unset"; };
  }, [isOpen]);

  if (!isHydrated) return null;

  const handleSendOrder = () => {
    startTransition(async () => {
      // Chama o servidor
      const response = await createOrderAction(
        restaurant.id,
        table.id,
        getCartTotal(),
        items
      );

      if (response.success) {
        alert("🎉 Pedido enviado para a cozinha com sucesso!");
        clearCart(); // Esvazia o carrinho
        onClose();   // Fecha a gaveta
      } else {
        alert("Houve um erro ao enviar o pedido. Tente novamente.");
      }
    });
  };

  return (
    <>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50"
        />
      )}

      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: isOpen ? 0 : "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed bottom-0 left-0 right-0 h-[85vh] bg-white rounded-t-3xl shadow-2xl z-50 flex flex-col overflow-hidden max-w-md mx-auto"
      >
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <div>
            <h2 className="text-xl font-semibold text-stone-900">Seu Pedido</h2>
            <p className="text-sm text-stone-500">{table.name}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-stone-100 rounded-full hover:bg-stone-200">
            <X size={20} className="text-stone-700" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-stone-400">
              <ShoppingBag size={48} className="mb-4 opacity-20" />
              <p>A sua sacola está vazia.</p>
              <button onClick={onClose} className="text-stone-900 font-medium mt-4 underline">Voltar ao cardápio</button>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.product.id} className="flex gap-4">
                <div className="flex-1">
                  <h4 className="font-medium text-stone-900">{item.product.name}</h4>
                  <p className="text-sm text-stone-500 mt-1">
                    {(item.product.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                
                <div className="flex items-center gap-3 bg-stone-100 rounded-full px-1 py-1">
                  {item.quantity === 1 ? (
                    <button onClick={() => removeItem(item.product.id)} className="p-2 text-red-500" disabled={isPending}>
                      <Trash2 size={14} />
                    </button>
                  ) : (
                    <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="p-2 text-stone-700" disabled={isPending}>
                      <Minus size={14} />
                    </button>
                  )}
                  
                  <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                  
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="p-2 text-stone-700" disabled={isPending}>
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 bg-stone-50 border-t border-stone-200">
            <div className="flex justify-between items-center mb-4">
              <span className="text-stone-500">Total a pagar</span>
              <span className="text-2xl font-semibold text-stone-900">
                {(getCartTotal() / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>
            
            <button 
              onClick={handleSendOrder}
              disabled={isPending}
              className="w-full bg-stone-900 text-white py-4 rounded-full font-medium flex items-center justify-center gap-2 hover:bg-stone-800 transition-colors disabled:opacity-70"
            >
              {isPending ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  A enviar para a cozinha...
                </>
              ) : (
                <>
                  Confirmar Pedido
                  <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>
        )}
      </motion.div>
    </>
  );
}