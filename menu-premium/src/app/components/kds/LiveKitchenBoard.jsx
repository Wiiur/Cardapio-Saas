import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Wine, Bell, CheckCircle2, Clock, UtensilsCrossed, Sparkles } from 'lucide-react';
import { useTableStore } from '../../store/useTableStore';

const spring = { type: 'spring', stiffness: 400, damping: 30 };

export default function LiveKitchenBoard() {
  const [stationFilter, setStationFilter] = useState('ALL'); // ALL | KITCHEN | BAR
  const { sentOrders, waiterCalls, updateOrderStatus, resolveWaiterCall } = useTableStore();

  const activeOrders = sentOrders.filter((order) => {
    if (order.status === 'DELIVERED') return false;
    if (stationFilter === 'ALL') return true;
    return order.destination === stationFilter;
  });

  return (
    <div className="min-h-screen bg-[#070709] text-[#F4F4F6] p-6 font-sans">
      {/* Header Operacional */}
      <header className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-white/[0.07]">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs uppercase tracking-widest text-emerald-400 font-semibold">
              Operação ao Vivo • KDS
            </span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1">
            Controle de Salão, Bar & Cozinha
          </h1>
        </div>

        {/* Seletor de Praça (Tudo / Cozinha / Bar) */}
        <div className="flex bg-[#121216] p-1.5 rounded-2xl border border-white/[0.06]">
          {[
            { id: 'ALL', label: 'Visão Geral', icon: Sparkles },
            { id: 'KITCHEN', label: 'Cozinha', icon: Flame },
            { id: 'BAR', label: 'Bar & Chopp', icon: Wine }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = stationFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStationFilter(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  active ? 'text-zinc-950' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="kdsStationPill"
                    transition={spring}
                    className="absolute inset-0 bg-amber-400 rounded-xl"
                  />
                )}
                <Icon className="w-3.5 h-3.5 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      <main className="max-w-6xl mx-auto mt-6 space-y-8">
        {/* Fila de Chamados de Garçom / Fechamento de Conta */}
        <AnimatePresence>
          {waiterCalls.length > 0 && (
            <motion.section
              initial={{ opacity: 0, y: -15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-3"
            >
              <h2 className="text-xs uppercase tracking-wider text-amber-400 font-semibold flex items-center gap-2">
                <Bell className="w-4 h-4 animate-bounce" />
                Chamados Ativos no Salão ({waiterCalls.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {waiterCalls.map((call) => (
                  <motion.div
                    layout
                    key={call.id}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    transition={spring}
                    className="bg-amber-400/10 border border-amber-400/30 rounded-2xl p-4 flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="text-xs font-bold bg-amber-400 text-zinc-950 px-2.5 py-0.5 rounded-full">
                        Mesa {call.tableNumber}
                      </span>
                      <p className="text-sm font-semibold text-white mt-2">
                        {call.type}
                      </p>
                      <p className="text-xs text-zinc-400">
                        Solicitado por {call.clientName}
                      </p>
                    </div>
                    <motion.button
                      whileTap={{ scale: 0.92 }}
                      onClick={() => resolveWaiterCall(call.id)}
                      className="px-3.5 py-2 rounded-xl bg-amber-400 text-zinc-950 text-xs font-bold shrink-0"
                    >
                      Atender
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Grid de Comandas por Item/Rodada */}
        <section>
          {activeOrders.length === 0 ? (
            <div className="bg-[#111115] border border-white/[0.05] rounded-3xl p-16 text-center">
              <UtensilsCrossed className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-zinc-400">
                Nenhum pedido pendente nesta praça agora.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <AnimatePresence>
                {activeOrders.map((order) => {
                  const isReady = order.status === 'READY';
                  const isBar = order.destination === 'BAR';

                  return (
                    <motion.div
                      layout
                      key={order.orderId}
                      initial={{ opacity: 0, scale: 0.92, y: 20 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.88 }}
                      transition={spring}
                      className={`rounded-3xl p-5 border flex flex-col justify-between gap-5 ${
                        isReady
                          ? 'bg-emerald-950/20 border-emerald-500/40'
                          : 'bg-[#121216] border-white/[0.07]'
                      }`}
                    >
                      <div>
                        {/* Topo do Card: Mesa + Setor */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-3 py-1 rounded-full bg-white text-zinc-950 font-bold text-xs tabular-nums">
                              Mesa {order.tableNumber || '08'}
                            </span>
                            <span className="text-xs text-zinc-400 font-medium">
                              • {order.clientName || 'Cliente'}
                            </span>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                              isBar
                                ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                                : 'bg-orange-500/15 text-orange-300 border border-orange-500/30'
                            }`}
                          >
                            {isBar ? <Wine className="w-3 h-3" /> : <Flame className="w-3 h-3" />}
                            {isBar ? 'Bar' : 'Cozinha'}
                          </span>
                        </div>

                        {/* Quantidade e Produto */}
                        <div className="mt-4 flex items-start gap-3">
                          <span className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-400 font-bold text-sm flex items-center justify-center shrink-0 tabular-nums">
                            {order.qty}x
                          </span>
                          <div>
                            <h3 className="text-base font-bold text-white leading-snug">
                              {order.name}
                            </h3>
                            {order.notes && (
                              <p className="text-xs text-amber-300 bg-amber-400/10 px-2.5 py-1 rounded-lg mt-1.5 inline-block">
                                Obs: {order.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Rodapé de Ação Rápida */}
                      <div className="pt-3 border-t border-white/[0.06] flex items-center justify-between gap-3">
                        <span className="inline-flex items-center gap-1.5 text-xs text-zinc-400 tabular-nums">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(order.sentAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>

                        {!isReady ? (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateOrderStatus(order.orderId, 'READY')}
                            className="px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 font-bold text-xs"
                          >
                            Marcar Pronto
                          </motion.button>
                        ) : (
                          <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => updateOrderStatus(order.orderId, 'DELIVERED')}
                            className="px-4 py-2 rounded-xl bg-emerald-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            Entregue na Mesa
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}