"use client";

import { useState } from "react";
import { Pencil, X, Loader2, Image as ImageIcon } from "lucide-react";
import { updateCategoryAction, updateProductAction } from "@/app/server/actions/products";
import type { Category } from "@prisma/client";

// --- BOTÃO E MODAL DE EDITAR CATEGORIA ---
export function EditCategoryButton({ category }: { category: Category }) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(category.name);
  const [description, setDescription] = useState(category.description || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    const result = await updateCategoryAction(category.id, name, description);
    setIsSubmitting(false);

    if (result.success) {
      setIsOpen(false);
    } else {
      alert("Erro ao atualizar categoria.");
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-1.5 text-stone-400 hover:text-stone-900 rounded-md hover:bg-stone-200 transition-colors"
      >
        <Pencil size={16} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl">
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <h2 className="text-xl font-semibold text-stone-900">Editar Categoria</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 text-stone-400 hover:bg-stone-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-700">Nome</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="px-4 py-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-900"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-700">Descrição</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="px-4 py-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-900 resize-none"
                />
              </div>
              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-stone-100">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium text-white bg-stone-900 rounded-lg">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

// --- BOTÃO E MODAL DE EDITAR PRODUTO ---
export function EditProductButton({ product, categories }: { product: any, categories: Category[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [name, setName] = useState(product.name);
  const [priceString, setPriceString] = useState((product.price / 100).toFixed(2));
  const [description, setDescription] = useState(product.description || "");
  const [imageUrl, setImageUrl] = useState(product.imageUrl || "");
  const [available, setAvailable] = useState(product.available);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !priceString) return;

    setIsSubmitting(true);
    const priceNumber = parseFloat(priceString.replace(',', '.'));
    const priceInCents = Math.round(priceNumber * 100);
    
    const result = await updateProductAction(product.id, categoryId, name, priceInCents, description, imageUrl, available);
    setIsSubmitting(false);

    if (result.success) {
      setIsOpen(false);
    } else {
      alert("Erro ao atualizar produto.");
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-3 py-1.5 text-sm font-medium text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-lg transition-colors"
      >
        Editar
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-xl my-8">
            <div className="flex items-center justify-between p-6 border-b border-stone-100">
              <h2 className="text-xl font-semibold text-stone-900">Editar Produto</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 text-stone-400 hover:bg-stone-100 rounded-full">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
              
              {/* O Toggle de Disponibilidade */}
              <div className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-200">
                <span className="text-sm font-medium text-stone-900">Produto Disponível</span>
                <button
                  type="button"
                  onClick={() => setAvailable(!available)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${available ? 'bg-emerald-500' : 'bg-stone-300'}`}
                >
                  <span className={`absolute top-1 bg-white w-4 h-4 rounded-full transition-all ${available ? 'left-6' : 'left-1'}`} />
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-700">Categoria</label>
                <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="px-4 py-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-900">
                  {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </div>
              
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-700">Nome</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="px-4 py-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-900" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-stone-700">Preço (R$)</label>
                  <input type="number" step="0.01" value={priceString} onChange={(e) => setPriceString(e.target.value)} required className="px-4 py-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-900" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-stone-700">Link da Imagem</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><ImageIcon size={16} className="text-stone-400" /></div>
                    <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="pl-9 pr-4 py-2.5 w-full rounded-lg border border-stone-200 bg-stone-50 text-stone-900" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-stone-700">Descrição</label>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="px-4 py-2.5 rounded-lg border border-stone-200 bg-stone-50 text-stone-900 resize-none" />
              </div>

              <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-stone-100">
                <button type="button" onClick={() => setIsOpen(false)} className="px-5 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-100 rounded-lg">Cancelar</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 text-sm font-medium text-white bg-stone-900 rounded-lg">
                  {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : "Salvar Alterações"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}