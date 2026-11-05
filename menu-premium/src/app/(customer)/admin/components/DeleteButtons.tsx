"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { deleteCategoryAction, deleteProductAction } from "@/app/server/actions/products";

// --- BOTÃO DE APAGAR CATEGORIA ---
export function DeleteCategoryButton({ categoryId, categoryName }: { categoryId: string, categoryName: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    // Alerta nativo do navegador para evitar acidentes
    const isConfirmed = window.confirm(
      `ATENÇÃO: Tem a certeza que deseja apagar a categoria "${categoryName}"?\n\nISSO VAI APAGAR TODOS OS PRODUTOS DENTRO DELA!`
    );
    
    if (!isConfirmed) return;

    setIsDeleting(true);
    const result = await deleteCategoryAction(categoryId);
    setIsDeleting(false);

    if (!result.success) alert(result.error);
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-1.5 text-stone-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors disabled:opacity-50"
      title="Apagar Categoria"
    >
      {isDeleting ? <Loader2 size={16} className="animate-spin text-red-600" /> : <Trash2 size={16} />}
    </button>
  );
}

// --- BOTÃO DE APAGAR PRODUTO ---
export function DeleteProductButton({ productId, productName }: { productId: string, productName: string }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const isConfirmed = window.confirm(`Tem a certeza que deseja apagar o produto "${productName}"?`);
    if (!isConfirmed) return;

    setIsDeleting(true);
    const result = await deleteProductAction(productId);
    setIsDeleting(false);

    if (!result.success) alert(result.error);
  };

  return (
    <button 
      onClick={handleDelete}
      disabled={isDeleting}
      className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
    >
      {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
      Apagar
    </button>
  );
}