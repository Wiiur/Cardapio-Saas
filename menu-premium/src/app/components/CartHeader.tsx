"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Receipt } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { CartDrawer } from "./CartDrawer";
import type { Order } from "@prisma/client";

interface CartHeaderProps {
  restaurant: {
    id: string;
    name: string;
    slug: string;
    showTableTotal?: boolean;
  };
  table: {
    id: string;
    name: string;
    slug: string;
    qrToken: string;
  };
  tableOrders?: Order[];
}

function formatCurrency(value: number) {
  const normalized = value > 500 ? value / 100 : value;
  return normalized.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function CartHeader({ restaurant, table, tableOrders = [] }: CartHeaderProps) {
  const [mounted, setMounted] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"cart" | "bill">("cart");

  const totalItems = useCartStore((state) => state.getTotalItems());
  const cartTotal = useCartStore((state) => state.getCartTotal());

  useEffect(() => {
    setMounted(true);
  }, []);

  const showTotal = restaurant.showTableTotal ?? true;
  const tableConsumedTotal = tableOrders.reduce((acc, o) => acc + o.total, 0);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white/85 dark:bg-zinc-950/85 backdrop-blur-xl border-b border-stone-200/80 dark:border-white/10 px-6 py-4">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-semibold uppercase tracking-widest text-stone-400">
                {table.name}
              </span>
            </div>
            <h1 className="text-lg font-bold tracking-tight text-stone-900 dark:text-white">
              {restaurant.name}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Botão da Comanda da Mesa (Com ou Sem Valor em R$ conforme escolha do dono) */}
            <button
              onClick={() => {
                setDrawerTab("bill");
                setDrawerOpen(true);
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-stone-100 dark:bg-zinc-900 border border-stone-200 dark:border-white/10 text-xs font-semibold hover:scale-95 transition-transform"
            >
              <Receipt className="w-3.5 h-3.5 text-amber-500" />
              {showTotal ? (
                <span className="tabular-nums">{formatCurrency(tableConsumedTotal)}</span>
              ) : (
                <span>Comanda ({tableOrders.length})</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Ilha Flutuante Estilo App Nativo na Base da Tela */}
      <AnimatePresence>
        {mounted && totalItems > 0 && !drawerOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="fixed bottom-5 inset-x-4 max-w-lg mx-auto z-40"
          >
            <button
              onClick={() => {
                setDrawerTab("cart");
                setDrawerOpen(true);
              }}
              className="w-full bg-stone-950 dark:bg-amber-400 text-white dark:text-stone-950 rounded-2xl p-4 shadow-2xl flex items-center justify-between font-semibold"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-amber-400 dark:bg-stone-950 text-stone-950 dark:text-amber-400 text-xs font-bold flex items-center justify-center tabular-nums">
                  {totalItems}
                </span>
                <span className="text-sm flex items-center gap-1.5">
                  <ShoppingBag className="w-4 h-4" />
                  Ver rodada atual
                </span>
              </div>
              <span className="text-sm font-bold tabular-nums">
                {formatCurrency(cartTotal)}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <CartDrawer
        restaurant={restaurant}
        table={table}
        tableOrders={tableOrders}
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        initialTab={drawerTab}
      />
    </>
  );
}