"use client";

import * as motion from "framer-motion/client";
import type { Product } from "@prisma/client";
import { useCartStore } from "@/store/cartStore";

export function ProductItem({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    addItem(product, 1);
    // Um mini feedback no console só para vermos funcionando por enquanto!
    console.log(`Adicionado: ${product.name} | Total no carrinho: 1`);
  };

  return (
    <motion.div 
      whileTap={{ scale: 0.98 }}
      onClick={handleAddToCart}
      className="flex gap-4 cursor-pointer group bg-white p-4 rounded-2xl shadow-sm border border-stone-100 hover:border-stone-300 transition-all"
    >
      <div className="flex-1">
        <h4 className="font-medium text-stone-900 group-hover:text-stone-600 transition-colors">
          {product.name}
        </h4>
        <p className="text-sm text-stone-500 mt-1 line-clamp-2 leading-relaxed">
          {product.description}
        </p>
        <p className="font-medium mt-3 text-stone-900">
          {(product.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </p>
      </div>
      {product.imageUrl && (
        <div className="w-24 h-24 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          />
        </div>
      )}
    </motion.div>
  );
}