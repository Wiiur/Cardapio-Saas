"use client";

import { useState } from "react";
import { X, Loader2, Image as ImageIcon } from "lucide-react";
import { createProductAction } from "@/app/server/actions/products";
import type { Category } from "@prisma/client";

interface ProductModalProps {
  restaurantId: string;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
}

export function ProductModal({ restaurantId, categories = [], isOpen, onClose }: ProductModalProps) {
  const [categoryId, setCategoryId] = useState(categories?.[0]?.id || "");
  const [name, setName] = useState("");
  const [priceString, setPriceString] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState(""); // Novo estado para a imagem
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      alert("Crie uma categoria primeiro antes de adicionar produtos!");
      return;
    }
    if (!name.trim() || !priceString) return;

    setIsSubmitting(true);
    
    const priceNumber = parseFloat(priceString.replace(',', '.'));
    const priceInCents = Math.round(priceNumber * 100);
    
    const result = await createProductAction(
      restaurantId, 
      categoryId, 
      name, 
      priceInCents, 
      description,
      imageUrl // Enviamos a imagem para a Server Action
    );
    
    setIsSubmitting(false);

    if (result.success) {
      setName("");
      setPriceString("");
      setDescription("");
      setImageUrl("");
      onClose();
    } else {
      alert("Ocorreu um erro ao guardar o produto.");
    }
  };

  return (
    <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl animate-in fade-in zoom-in-95 duration-200 my-8">
        
        <div className="flex items-center justify-between p-6 border-b border-stone-100">
          <h2 className="text-xl font-semibold text-stone-900">Novo Produto</h2>
          <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-700">Categoria *</label>
            {categories.length === 0 ? (
              <div className="px-4 py-2.5 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 text-sm">
                Nenhuma categoria encontrada. Crie uma categoria primeiro!
              </div>
            ) : (
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                required
                className="px-4 py-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-700">Nome do Produto *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Tiramisu"
              required
              disabled={categories.length === 0}
              className="px-4 py-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-stone-700">Preço (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={priceString}
                onChange={(e) => setPriceString(e.target.value)}
                placeholder="Ex: 25.90"
                required
                disabled={categories.length === 0}
                className="px-4 py-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-stone-700">Link da Imagem</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <ImageIcon size={16} className="text-stone-400" />
                </div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  disabled={categories.length === 0}
                  className="pl-9 pr-4 py-2.5 w-full rounded-lg border border-stone-200 bg-stone-50 text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all disabled:opacity-50"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-stone-700">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ex: Clássica sobremesa italiana..."
              rows={3}
              disabled={categories.length === 0}
              className="px-4 py-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-stone-900 transition-all resize-none disabled:opacity-50"
            />
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-stone-100">
            <button type="button" onClick={onClose} disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-lg">
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || !name.trim() || categories.length === 0} 
              className="px-5 py-2.5 text-sm font-medium text-white bg-stone-900 hover:bg-stone-800 rounded-lg flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 size={16} className="animate-spin" />}
              Guardar Produto
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}