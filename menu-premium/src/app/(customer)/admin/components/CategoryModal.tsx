"use client";

import { useState } from "react";
import { X, Loader2 } from "lucide-react";
import { createCategoryAction } from "@/app/server/actions/products";

interface CategoryModalProps {
  restaurantId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CategoryModal({ restaurantId, isOpen, onClose }: CategoryModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    
    const result = await createCategoryAction(restaurantId, name, description);
    
    setIsSubmitting(false);

    if (result.success) {
      setName("");
      setDescription("");
      onClose(); // Fecha o modal após sucesso
    } else {
      alert("Ocorreu um erro ao guardar a categoria.");
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200">
        
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <h2 className="text-xl font-semibold text-stone-900">Nova Categoria</h2>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="name" className="text-sm font-medium text-stone-700">Nome da Categoria *</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Sobremesas, Entradas..."
              required
              className="px-4 py-2.5 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="desc" className="text-sm font-medium text-stone-700">Descrição (opcional)</label>
            <textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Deliciosas opções para fechar com chave de ouro."
              rows={3}
              className="px-4 py-2.5 rounded-lg border border-stone-200 bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !name.trim()}
              className="px-5 py-2.5 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              Guardar Categoria
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}