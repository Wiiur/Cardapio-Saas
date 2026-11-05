"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { createTableAction } from "@/app/server/actions/tables";

export function TablesHeader({ restaurantId }: { restaurantId: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const result = await createTableAction(restaurantId, name);
    setIsSubmitting(false);

    if (result.success) {
      setName("");
      setIsOpen(false);
    } else {
      alert(result.error);
    }
  };

  return (
    <>
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Gestão de Mesas</h1>
          <p className="text-stone-500">Crie mesas e gere os QR Codes para os clientes.</p>
        </div>
        <button 
          onClick={() => setIsOpen(true)}
          className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors"
        >
          + Nova Mesa
        </button>
      </header>

      {isOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <h2 className="text-xl font-semibold text-stone-900">Nova Mesa</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-700">Nome ou Número da Mesa *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Mesa 12, Varanda 1..."
                  required
                  className="px-4 py-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
                />
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-stone-100">
                <button type="button" onClick={() => setIsOpen(false)} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg">Cancelar</button>
                <button type="submit" disabled={isSubmitting || !name.trim()} className="px-5 py-2.5 text-sm font-medium text-white bg-stone-900 rounded-lg flex items-center gap-2">
                  {isSubmitting && <Loader2 size={16} className="animate-spin" />}
                  Criar Mesa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}