"use client";

import { useState } from "react";
import { updateOrderStatusAction } from "@/app/server/actions/admin";
import { Loader2, MapPin, CalendarClock } from "lucide-react";

interface OrderCardProps {
  order: any; 
  nextStatus?: string;
  nextLabel?: string;
}

export function OrderCard({ order, nextStatus, nextLabel }: OrderCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    if (!nextStatus) return;
    setIsUpdating(true);
    await updateOrderStatusAction(order.id, nextStatus);
    setIsUpdating(false);
  };

  // Formata a data e hora (Ex: 26/09/2026 00:05)
  const orderDate = new Date(order.createdAt);
  const formattedDate = orderDate.toLocaleDateString('pt-BR');
  const formattedTime = orderDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-stone-100 flex flex-col gap-3">
      
      {/* CABEÇALHO: NÚMERO, MESA E TOTAL */}
      <div className="flex justify-between items-start">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold bg-stone-900 text-white px-2 py-0.5 rounded-md">
              #{order.orderNumber}
            </span>
            <span className="text-xs font-medium text-stone-600 flex items-center gap-1 bg-stone-100 px-2 py-0.5 rounded-md">
              <MapPin size={12} />
              {order.table?.name || "Mesa não informada"}
            </span>
          </div>
          
          <div className="flex items-center gap-1 text-xs text-stone-500 mt-1">
            <CalendarClock size={12} />
            <span>{formattedDate} às {formattedTime}</span>
          </div>
        </div>
        
        <span className="font-semibold text-stone-900">
          {(order.total / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
        </span>
      </div>

      {/* LISTA DE PRODUTOS */}
      <div className="border-t border-stone-100 pt-3 mt-1">
        <ul className="text-sm text-stone-600 flex flex-col gap-1.5">
          {order.items.map((item: any, idx: number) => (
            <li key={idx} className="flex justify-between">
              <span>
                <b className="text-stone-900 bg-stone-100 px-1.5 py-0.5 rounded mr-2">
                  {item.quantity}x
                </b> 
                {item.nameSnapshot}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* BOTÃO DE AÇÃO */}
      {nextStatus && (
        <button
          onClick={handleUpdate}
          disabled={isUpdating}
          className="mt-3 w-full py-2.5 bg-stone-900 text-white rounded-lg text-sm font-medium hover:bg-stone-800 transition-colors flex justify-center items-center gap-2 disabled:opacity-70"
        >
          {isUpdating ? <Loader2 size={16} className="animate-spin" /> : nextLabel}
        </button>
      )}
    </div>
  );
}