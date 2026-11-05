"use client";

import { useState } from "react";
import { CategoryModal } from "../components/CategoryModal";
import { ProductModal } from "../components/ProductModal";
import type { Category } from "@prisma/client";

interface ProductsHeaderProps {
  restaurantId: string;
  categories: Category[];
}

export function ProductsHeader({ restaurantId, categories }: ProductsHeaderProps) {
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  return (
    <>
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Gestão de Cardápio</h1>
          <p className="text-stone-500">Organize as suas categorias e produtos.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className="bg-stone-200 text-stone-900 px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-300 transition-colors"
          >
            + Categoria
          </button>
          <button 
            onClick={() => setIsProductModalOpen(true)}
            className="bg-stone-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors"
          >
            + Novo Produto
          </button>
        </div>
      </header>

      <CategoryModal 
        restaurantId={restaurantId}
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      <ProductModal 
        restaurantId={restaurantId}
        categories={categories}
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
      />
    </>
  );
}