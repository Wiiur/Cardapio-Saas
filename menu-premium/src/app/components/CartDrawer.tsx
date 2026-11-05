"use client";

import React, { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  Receipt,
  CheckCircle2,
  Clock,
  Sparkles,
  User,
  ChefHat,
} from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { createTableOrder } from "@/app/server/actions/order";
import type { Order } from "@prisma/client";

interface CartDrawerProps {
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
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "cart" | "bill";
}

const spring = { type: "spring" as const, stiffness: 380, damping: 32 };

// Formata centavos (ex: 4290 -> R$ 42,90) ou reais conforme seu banco
function formatCurrency(value: number) {
  const normalized = value > 500 ? value / 100 : value;
  return normalized.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

export function CartDrawer({
  restaurant,
  table,
  tableOrders = [],
  isOpen,
  onClose,
  initialTab = "cart",
}: CartDrawerProps) {
  const [activeTab, setActiveTab] = useState<"cart" | "bill">(initialTab);
  const [orderNotes, setOrderNotes] = useState("");
  const [feedback, setFeedback] = useState<{ type: "ok" | "err"; msg: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    items,
    customerName,
    setCustomerName,
    ensureDeviceId,
    updateQuantity,
    updateObservations,
    clearCart,
    getCartTotal,
  } = useCartStore();

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab, isOpen]);

  useEffect(() => {
    ensureDeviceId();
  }, [ensureDeviceId]);

  const showTotal = restaurant.showTableTotal ?? true;
  const currentDeviceId = useCartStore((s) => s.deviceId);

  // Calcula total da mesa e parte individual do cliente
  const myOrders = tableOrders.filter(
    (o) =>
      (currentDeviceId && o.deviceId === currentDeviceId) ||
      (customerName && o.customerName?.toLowerCase() === customerName.toLowerCase())
  );

  const myConsumedTotal = myOrders.reduce((acc, o) => acc + o.total, 0);
  const tableConsumedTotal = tableOrders.reduce((acc, o) => acc + o.total, 0);

  const handleSendOrder = () => {
    if (!customerName.trim()) {
      setFeedback({ type: "err", msg: "Informe seu nome para identificar seu pedido na mesa." });
      return;
    }

    setFeedback(null);
    const devId = ensureDeviceId();

    startTransition(async () => {
      const res = await createTableOrder({
        restaurantId: restaurant.id,
        restaurantSlug: restaurant.slug,
        tableId: table.id,
        tableSlug: table.slug,
        qrToken: table.qrToken,
        customerName,
        deviceId: devId,
        notes: orderNotes,
        items: items.map((i) => ({
          productId: i.product.id,
          nameSnapshot: i.product.name,
          unitPrice: i.product.price,
          quantity: i.quantity,
          notes: i.observations,
        })),
      });

      if (!res.success) {
        setFeedback({ type: "err", msg: res.error || "Erro ao enviar pedido." });
        return;
      }

      clearCart();
      setOrderNotes("");
      setFeedback({
        type: "ok",
        msg: `Rodada #${res.orderNumber} enviada para a cozinha!`,
      });
      setTimeout(() => {
        setFeedback(null);
        setActiveTab("bill");
      }, 1400);
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop com Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Bottom Sheet / Drawer com Física de Mola */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={spring}
            className="fixed bottom-0 inset-x-0 z-50 max-w-lg mx-auto bg-white dark:bg-zinc-950 text-stone-900 dark:text-zinc-100 rounded-t-3xl shadow-2xl border-t border-stone-200 dark:border-white/10 max-h-[88vh] flex flex-col overflow-hidden"
          >
            {/* Puxador Superior + Cabeçalho */}
            <div className="pt-3 px-6 pb-4 border-b border-stone-100 dark:border-white/10">
              <div className="w-12 h-1.5 bg-stone-300 dark:bg-zinc-700 rounded-full mx-auto mb-4" />
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-semibold">
                    {table.name} • {restaurant.name}
                  </span>
                  <h3 className="text-lg font-bold tracking-tight">
                    Comanda Interativa
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="w-9 h-9 rounded-full bg-stone-100 dark:bg-zinc-800 flex items-center justify-center hover:scale-95 transition-transform"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Abas com Pílula Deslizante */}
              <div className="grid grid-cols-2 bg-stone-100 dark:bg-zinc-900 p-1 rounded-2xl mt-4">
                {[
                  { id: "cart", label: `Rodada Atual (${items.length})`, icon: ShoppingBag },
                  { id: "bill", label: `Pedidos da Mesa (${tableOrders.length})`, icon: Receipt },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const active = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as "cart" | "bill")}
                      className={`relative py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                        active
                          ? "text-stone-950"
                          : "text-stone-500 hover:text-stone-800 dark:hover:text-zinc-200"
                      }`}
                    >
                      {active && (
                        <motion.div
                          layoutId="drawerTabPill"
                          transition={spring}
                          className="absolute inset-0 bg-amber-400 rounded-xl shadow-sm"
                        />
                      )}
                      <Icon className="w-3.5 h-3.5 relative z-10" />
                      <span className="relative z-10">{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Conteúdo Rolável */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
                    feedback.type === "ok"
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                      : "bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30"
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  {feedback.msg}
                </motion.div>
              )}

              {activeTab === "cart" ? (
                <>
                  {/* Identificação do Cliente na Mesa */}
                  <div className="bg-stone-50 dark:bg-zinc-900/90 border border-stone-200/80 dark:border-white/10 rounded-2xl p-3.5">
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-stone-500 flex items-center gap-1.5 mb-1.5">
                      <User className="w-3.5 h-3.5 text-amber-500" />
                      Seu Nome na Mesa
                    </label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Ex: Willian (separa sua conta individual)"
                      className="w-full bg-white dark:bg-zinc-950 border border-stone-200 dark:border-white/10 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  {items.length === 0 ? (
                    <div className="py-12 text-center text-stone-400">
                      <ShoppingBag className="w-10 h-10 mx-auto mb-2 opacity-40" />
                      <p className="text-sm font-medium">Sua rodada está vazia.</p>
                      <p className="text-xs mt-1">
                        Escolha os itens no cardápio para enviar direto à cozinha.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {items.map(({ product, quantity, observations }) => (
                        <motion.div
                          layout
                          key={product.id}
                          className="bg-stone-50 dark:bg-zinc-900/70 border border-stone-200/70 dark:border-white/10 rounded-2xl p-3.5 space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h4 className="font-semibold text-sm truncate">
                                {product.name}
                              </h4>
                              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                                {formatCurrency(product.price * quantity)}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 bg-white dark:bg-zinc-950 border border-stone-200 dark:border-white/10 rounded-full px-2 py-1">
                              <button
                                onClick={() => updateQuantity(product.id, quantity - 1)}
                                className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-stone-100 dark:hover:bg-zinc-800"
                              >
                                {quantity === 1 ? (
                                  <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                ) : (
                                  <Minus className="w-3.5 h-3.5" />
                                )}
                              </button>
                              <span className="text-xs font-bold tabular-nums px-1">
                                {quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(product.id, quantity + 1)}
                                className="w-6 h-6 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          <input
                            type="text"
                            value={observations || ""}
                            onChange={(e) => updateObservations(product.id, e.target.value)}
                            placeholder="Alguma observação? (ex: sem cebola, bem passado)"
                            className="w-full bg-white dark:bg-zinc-950 border border-stone-200/80 dark:border-white/10 rounded-xl px-3 py-1.5 text-xs focus:outline-none focus:border-amber-400"
                          />
                        </motion.div>
                      ))}

                      <textarea
                        rows={2}
                        value={orderNotes}
                        onChange={(e) => setOrderNotes(e.target.value)}
                        placeholder="Observação geral para o garçom/cozinha..."
                        className="w-full bg-stone-50 dark:bg-zinc-900 border border-stone-200 dark:border-white/10 rounded-2xl p-3 text-xs focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  )}
                </>
              ) : (
                /* ABA 2: PEDIDOS ENVIADOS DA MESA (COM OU SEM SALDO EM R$) */
                <div className="space-y-4">
                  {showTotal ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-3.5">
                        <span className="text-[11px] text-stone-500 dark:text-zinc-400 font-medium">
                          Sua Parte ({customerName || "Você"})
                        </span>
                        <p className="text-lg font-bold text-amber-600 dark:text-amber-400 tabular-nums mt-0.5">
                          {formatCurrency(myConsumedTotal)}
                        </p>
                      </div>
                      <div className="bg-stone-100 dark:bg-zinc-900 border border-stone-200 dark:border-white/10 rounded-2xl p-3.5">
                        <span className="text-[11px] text-stone-500 dark:text-zinc-400 font-medium">
                          Total da {table.name}
                        </span>
                        <p className="text-lg font-bold tabular-nums mt-0.5">
                          {formatCurrency(tableConsumedTotal)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-stone-100 dark:bg-zinc-900 border border-stone-200 dark:border-white/10 rounded-2xl p-3.5 flex items-center gap-2.5 text-xs text-stone-600 dark:text-zinc-400">
                      <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                      Acompanhe o preparo das suas rodadas em tempo real abaixo.
                    </div>
                  )}

                  {tableOrders.length === 0 ? (
                    <p className="text-center text-xs text-stone-400 py-8">
                      Nenhum pedido enviado nesta mesa ainda.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {tableOrders.map((order) => (
                        <div
                          key={order.id}
                          className="bg-stone-50 dark:bg-zinc-900/70 border border-stone-200/70 dark:border-white/10 rounded-2xl p-3.5 space-y-2"
                        >
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold">
                              Rodada #{order.orderNumber} • {order.customerName || "Cliente"}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1 ${
                                order.status === "ready" || order.status === "delivered"
                                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                              }`}
                            >
                              <Clock className="w-3 h-3" />
                              {order.status === "pending"
                                ? "Na Fila"
                                : order.status === "preparing"
                                ? "Preparando"
                                : "Pronto"}
                            </span>
                          </div>
                          <div className="text-xs text-stone-600 dark:text-zinc-300 space-y-1">
                            {order.items.map((it, idx) => (
                              <div key={idx} className="flex justify-between">
                                <span>
                                  {it.quantity}x {it.nameSnapshot}
                                </span>
                                {showTotal && (
                                  <span className="tabular-nums text-stone-400">
                                    {formatCurrency(it.unitPrice * it.quantity)}
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Rodapé de Disparo da Rodada */}
            {activeTab === "cart" && items.length > 0 && (
              <div className="p-5 border-t border-stone-200 dark:border-white/10 bg-white dark:bg-zinc-950">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  disabled={isPending}
                  onClick={handleSendOrder}
                  className="w-full py-4 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-stone-950 font-bold text-sm flex items-center justify-between shadow-lg disabled:opacity-50"
                >
                  <span className="flex items-center gap-2">
                    <ChefHat className="w-4 h-4" />
                    {isPending ? "Enviando para a Cozinha..." : "Enviar Rodada para Preparo"}
                  </span>
                  <span className="tabular-nums font-extrabold">
                    {formatCurrency(getCartTotal())}
                  </span>
                </motion.button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}