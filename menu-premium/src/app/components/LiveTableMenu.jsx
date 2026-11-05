'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Utensils,
  Receipt,
  Plus,
  Minus,
  Sparkles,
  Check,
  Flame,
  Wine,
  Eye,
  EyeOff,
  Clock
} from 'lucide-react';
import { useTableStore } from '../../store/useTableStore';

const CATEGORIES = [
  { id: 'burgers', label: 'Artesanais' },
  { id: 'porcoes', label: 'Para Compartilhar' },
  { id: 'drinks', label: 'Drinks & Chopp' },
  { id: 'sobremesas', label: 'Sobremesas' }
];

const PRODUCTS = [
  {
    id: 'p1',
    category: 'burgers',
    name: 'Smash Trufado Duplo',
    description: 'Dois blends 90g na crosta, cheddar inglês, maionese de trufas negras no brioche selado.',
    price: 42.90,
    tag: 'Mais Pedido',
    destination: 'KITCHEN',
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&q=80',
    upsellItem: {
      id: 'u1',
      name: 'Batata Rústica com Alecrim',
      price: 16.00,
      destination: 'KITCHEN'
    }
  },
  {
    id: 'p2',
    category: 'drinks',
    name: 'Gin Tônica Botânico',
    description: 'Gin importado, tônica artesanal, infusão de hibisco, zimbro e laranja Bahia desidratada.',
    price: 34.00,
    tag: 'Entrega Rápida',
    destination: 'BAR',
    image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&q=80'
  }
];

const springConfig = { type: 'spring', stiffness: 420, damping: 32 };

export default function LiveTableMenu() {
  const [isMounted, setIsMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState('burgers');
  const [isBillOpen, setIsBillOpen] = useState(false);
  const [serviceFee, setServiceFee] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const {
    customer,
    currentRound,
    upsellSuggestion,
    activeCall,
    restaurantSettings,
    toggleShowTableTotal,
    addToRound,
    removeFromRound,
    dismissUpsell,
    sendRoundToPreparation,
    getBillSummary,
    triggerWaiterCall
  } = useTableStore();

  if (!isMounted) return <div className="min-h-screen bg-[#0A0A0C]" />;

  const showTotal = restaurantSettings?.showTableTotal ?? true;
  const roundCount = currentRound.reduce((acc, i) => acc + i.qty, 0);
  const roundTotal = currentRound.reduce((acc, i) => acc + i.price * i.qty, 0);
  const bill = getBillSummary(serviceFee);

  return (
    <div className="min-h-screen bg-[#0A0A0C] text-[#F4F4F6] pb-36 font-sans selection:bg-amber-500/30">
      {/* Barra de Simulação para Apresentação Comercial */}
      <div className="bg-zinc-900/90 border-b border-white/[0.06] px-4 py-2">
        <div className="max-w-lg mx-auto flex items-center justify-between text-xs">
          <span className="text-zinc-400 font-medium">
            Configuração do Dono:
          </span>
          <button
            onClick={toggleShowTableTotal}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/[0.06] hover:bg-white/[0.12] text-amber-400 font-semibold transition-colors"
          >
            {showTotal ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                Mostrando Saldo da Mesa
              </>
            ) : (
              <>
                <EyeOff className="w-3.5 h-3.5" />
                Modo Consumo Livre (Saldo Oculto)
              </>
            )}
          </button>
        </div>
      </div>

      {/* Top Bar Compacta da Mesa */}
      <header className="sticky top-0 z-30 bg-[#0A0A0C]/80 backdrop-blur-xl border-b border-white/[0.06] px-5 py-4">
        <div className="flex items-center justify-between max-w-lg mx-auto">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs uppercase tracking-widest text-zinc-400 font-medium">
                Mesa 08 • Comanda Viva
              </span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight mt-0.5">
              Olá, {customer.name || 'Visitante'}
            </h1>
          </div>

          <button
            onClick={() => setIsBillOpen(true)}
            className="flex items-center gap-2 bg-white/[0.05] hover:bg-white/[0.09] active:scale-95 transition-all border border-white/[0.08] rounded-full px-4 py-2 text-sm font-medium"
          >
            <Receipt className="w-4 h-4 text-amber-400" />
            {showTotal ? (
              <span className="tabular-nums">R$ {bill.myTotal.toFixed(2)}</span>
            ) : (
              <span>
                Comanda {bill.totalItemsCount > 0 ? `(${bill.totalItemsCount})` : ''}
              </span>
            )}
          </button>
        </div>

        {/* Barra de Chamados Rápidos de Salão */}
        <div className="flex gap-2 max-w-lg mx-auto mt-3 overflow-x-auto no-scrollbar">
          {[
            { id: 'Garçom a caminho', label: 'Chamar Garçom', icon: Bell },
            { id: 'Talheres/Copos solicitados', label: 'Copos & Talheres', icon: Utensils }
          ].map((action) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => triggerWaiterCall(action.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-white/[0.06] text-xs text-zinc-300 whitespace-nowrap"
              >
                <Icon className="w-3.5 h-3.5 text-amber-400" />
                {action.label}
              </motion.button>
            );
          })}
        </div>

        {/* Categorias com Pílula Magnética */}
        <div className="flex gap-1 max-w-lg mx-auto mt-4 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`relative px-4 py-2 text-sm font-medium rounded-full transition-colors whitespace-nowrap ${
                  isActive ? 'text-zinc-950' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeCategoryPill"
                    transition={springConfig}
                    className="absolute inset-0 bg-amber-400 rounded-full"
                  />
                )}
                <span className="relative z-10">{cat.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Toast Animado de Chamado do Garçom */}
      <AnimatePresence>
        {activeCall && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={springConfig}
            className="fixed top-28 inset-x-5 max-w-sm mx-auto z-50 bg-emerald-500 text-zinc-950 px-4 py-3 rounded-2xl font-medium text-sm flex items-center justify-center gap-2 shadow-2xl"
          >
            <Check className="w-4 h-4 stroke-[2.5]" />
            {activeCall.type}!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista Editorial de Produtos */}
      <main className="max-w-lg mx-auto px-5 pt-6 space-y-4">
        {PRODUCTS.filter((p) => p.category === activeCategory).map((product) => {
          const inRound = currentRound.find((i) => i.id === product.id);
          const qty = inRound ? inRound.qty : 0;

          return (
            <motion.div
              layout
              key={product.id}
              transition={springConfig}
              className="group relative bg-[#121216] border border-white/[0.06] rounded-3xl p-4 flex gap-4 items-center overflow-hidden"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-400/10 text-amber-300 border border-amber-400/20">
                    {product.destination === 'BAR' ? (
                      <Wine className="w-3 h-3" />
                    ) : (
                      <Flame className="w-3 h-3" />
                    )}
                    {product.tag}
                  </span>
                </div>

                <h3 className="text-base font-semibold tracking-tight text-white">
                  {product.name}
                </h3>
                <p className="text-xs text-zinc-400 line-clamp-2 mt-1 leading-relaxed">
                  {product.description}
                </p>

                <div className="mt-3 flex items-center justify-between">
                  <span className="text-base font-bold tabular-nums text-amber-400">
                    R$ {product.price.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Imagem + Controle Tátil de Quantidade */}
              <div className="relative w-28 h-28 shrink-0">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-2xl border border-white/[0.08]"
                />

                <div className="absolute -bottom-2 inset-x-2 flex justify-center">
                  <motion.div
                    layout
                    transition={springConfig}
                    className="flex items-center bg-zinc-950/95 backdrop-blur-md border border-white/15 rounded-full p-1 shadow-xl"
                  >
                    {qty > 0 && (
                      <>
                        <motion.button
                          whileTap={{ scale: 0.85 }}
                          onClick={() => removeFromRound(product.id)}
                          className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-300 hover:bg-white/10"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </motion.button>
                        <span className="px-2.5 text-xs font-bold tabular-nums">
                          {qty}
                        </span>
                      </>
                    )}
                    <motion.button
                      whileTap={{ scale: 0.85 }}
                      onClick={() => addToRound(product)}
                      className="w-7 h-7 rounded-full bg-amber-400 text-zinc-950 flex items-center justify-center font-bold"
                    >
                      <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                    </motion.button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </main>

      {/* Gaveta de Upsell de 1 Toque */}
      <AnimatePresence>
        {upsellSuggestion && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={springConfig}
            className="fixed bottom-24 inset-x-4 max-w-lg mx-auto z-40 bg-zinc-900/95 backdrop-blur-xl border border-amber-400/30 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400/15 flex items-center justify-center text-amber-400 shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-wider text-amber-400 font-semibold">
                  Combina perfeitamente
                </p>
                <p className="text-sm font-medium text-white">
                  {upsellSuggestion.name} (+R$ {upsellSuggestion.price.toFixed(2)})
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={dismissUpsell}
                className="px-2.5 py-1.5 text-xs text-zinc-400 hover:text-white"
              >
                Agora não
              </button>
              <motion.button
                whileTap={{ scale: 0.94 }}
                onClick={() => {
                  addToRound(upsellSuggestion);
                  dismissUpsell();
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-400 text-zinc-950 text-xs font-semibold"
              >
                Adicionar
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ilha Flutuante de Envio da Rodada */}
      <AnimatePresence>
        {roundCount > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={springConfig}
            className="fixed bottom-5 inset-x-4 max-w-lg mx-auto z-40"
          >
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={sendRoundToPreparation}
              className="w-full bg-amber-400 text-zinc-950 rounded-2xl p-4 shadow-[0_20px_50px_rgba(251,191,36,0.25)] flex items-center justify-between font-semibold"
            >
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-zinc-950 text-amber-400 text-xs flex items-center justify-center font-bold tabular-nums">
                  {roundCount}
                </span>
                <span className="text-sm tracking-tight">
                  Enviar rodada para preparo
                </span>
              </div>
              {showTotal ? (
                <span className="text-base font-bold tabular-nums">
                  R$ {roundTotal.toFixed(2)}
                </span>
              ) : (
                <span className="text-xs font-bold uppercase tracking-wider bg-zinc-950/15 px-3 py-1 rounded-full">
                  ConfirmarEnvio
                </span>
              )}
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Sheet: Comanda da Mesa (Com ou Sem Valores) */}
      <AnimatePresence>
        {isBillOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsBillOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={springConfig}
              className="fixed bottom-0 inset-x-0 max-w-lg mx-auto z-50 bg-[#121216] border-t border-white/10 rounded-t-3xl p-6 space-y-5 max-h-[82vh] overflow-y-auto"
            >
              <div className="w-12 h-1.5 bg-zinc-700 rounded-full mx-auto" />

              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">
                  {showTotal ? 'Resumo da Mesa 08' : 'Pedidos da Mesa 08'}
                </h2>
                {showTotal && (
                  <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={serviceFee}
                      onChange={(e) => setServiceFee(e.target.checked)}
                      className="accent-amber-400 rounded"
                    />
                    10% atendimento
                  </label>
                )}
              </div>

              {/* Lista de Itens Enviados e Status de Preparo */}
              <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                {bill.allItems.length === 0 ? (
                  <p className="text-xs text-zinc-500 text-center py-6">
                    Nenhum pedido enviado para preparo ainda.
                  </p>
                ) : (
                  bill.allItems.map((item) => (
                    <div
                      key={item.orderId}
                      className="flex items-center justify-between bg-zinc-900/70 border border-white/[0.05] rounded-2xl p-3 text-xs"
                    >
                      <div>
                        <p className="font-semibold text-white">
                          {item.qty}x {item.name}
                        </p>
                        <span className="text-zinc-400">
                          Pedido por {item.clientName || 'Visitante'}
                        </span>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full font-medium flex items-center gap-1 ${
                          item.status === 'READY'
                            ? 'bg-emerald-500/15 text-emerald-400'
                            : 'bg-amber-400/10 text-amber-300'
                        }`}
                      >
                        <Clock className="w-3 h-3" />
                        {item.status === 'READY' ? 'Pronto' : 'Preparando'}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Exibe os cards de R$ apenas se o restaurante habilitar */}
              {showTotal ? (
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-900/90 border border-amber-400/30 rounded-2xl p-4">
                    <span className="text-xs text-zinc-400">
                      Sua Parte ({customer.name || 'Você'})
                    </span>
                    <p className="text-xl font-bold text-amber-400 tabular-nums mt-1">
                      R$ {bill.myTotal.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-zinc-900/50 border border-white/[0.06] rounded-2xl p-4">
                    <span className="text-xs text-zinc-400">Total da Mesa</span>
                    <p className="text-xl font-bold text-white tabular-nums mt-1">
                      R$ {bill.tableTotal.toFixed(2)}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-900/50 border border-white/[0.06] rounded-2xl p-3.5 text-center text-xs text-zinc-400">
                  Acompanhe o preparo acima. Para conferir a parcial ou encerrar, solicite ao garçom.
                </div>
              )}

              <button
                onClick={() => {
                  triggerWaiterCall('Fechamento de conta solicitado');
                  setIsBillOpen(false);
                }}
                className="w-full py-3.5 rounded-2xl bg-white text-zinc-950 font-semibold text-sm active:scale-98 transition-transform"
              >
                Pedir Fechamento ao Garçom
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}