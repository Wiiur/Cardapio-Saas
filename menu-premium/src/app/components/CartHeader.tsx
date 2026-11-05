"use client";

import { ShoppingBag } from "lucide-react";
import { useCartStore } from "../../store/cartStore";
import { useEffect, useState } from "react";
import type { Restaurant, Table } from "@prisma/client";
import { CartDrawer } from "./CartDrawer";

interface CartHeaderProps {
  restaurant: Restaurant;
  table: Table;
}

export function CartHeader({ restaurant, table }: CartHeaderProps) {
  const totalItems = useCartStore((state) => state.getTotalItems());
  const [isHydrated, setIsHydrated] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsHydrated(true);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur-md border-b border-stone-200/50">
        <div className="flex items-center gap-2">
          {restaurant.logoUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={restaurant.logoUrl} alt={restaurant.name} className="h-8 w-8 rounded-full object-cover" />
          ) : (
            <div className="h-8 w-8 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold">
              {restaurant.name.charAt(0)}
            </div>
          )}
          <div>
            <h1 className="text-sm font-semibold leading-none">{restaurant.name}</h1>
            <p className="text-xs text-stone-500 mt-1">{table.name}</p>
          </div>
        </div>
        
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all shadow-sm ${
            isHydrated && totalItems > 0 
              ? "bg-stone-900 text-white hover:bg-stone-800" 
              : "bg-stone-100 text-stone-900 hover:bg-stone-200"
          }`}
        >
          <ShoppingBag size={16} />
          <span>{isHydrated ? totalItems : 0}</span>
        </button>
      </header>

      <CartDrawer 
        restaurant={restaurant} // <- Adicione esta linha de volta!
        table={table} 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
      />
    </>
  );
}