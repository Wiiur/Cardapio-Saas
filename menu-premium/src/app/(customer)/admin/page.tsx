import { prisma } from "@/app/lib/prisma";
import { Clock, ChefHat, CheckCircle2 } from "lucide-react";
import { OrderCard } from "./components/OrderCard";
import { AutoRefresh } from "./components/AutoRefresh";

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const restaurant = await prisma.restaurant.findFirst();

  if (!restaurant) {
    return <div>Nenhum restaurante encontrado.</div>;
  }

  const orders = await prisma.order.findMany({
    where: { restaurantId: restaurant.id },
    include: {
      restaurant: true,
      table: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const preparingOrders = orders.filter((o) => o.status === "preparing");
  const completedOrders = orders.filter((o) => o.status === "completed");

  return (
    <div className="min-h-screen bg-stone-100 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-stone-900">Gestão de Pedidos</h1>
        <p className="text-stone-500">Acompanhe e gira os pedidos em tempo real.</p>
      </header>

      <AutoRefresh interval={15000} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/50 rounded-2xl p-4 border border-stone-200">
          <div className="flex items-center gap-2 mb-4 text-amber-600 font-semibold px-2">
            <Clock size={20} />
            <h2>Novos Pedidos ({pendingOrders.length})</h2>
          </div>
          <div className="flex flex-col gap-4">
            {pendingOrders.map((order) => (
              <OrderCard key={order.id} order={order} nextStatus="preparing" nextLabel="Preparar" />
            ))}
          </div>
        </div>

        <div className="bg-white/50 rounded-2xl p-4 border border-stone-200">
          <div className="flex items-center gap-2 mb-4 text-blue-600 font-semibold px-2">
            <ChefHat size={20} />
            <h2>Na Cozinha ({preparingOrders.length})</h2>
          </div>
          <div className="flex flex-col gap-4">
            {preparingOrders.map((order) => (
              <OrderCard key={order.id} order={order} nextStatus="completed" nextLabel="Finalizar" />
            ))}
          </div>
        </div>

        <div className="bg-white/50 rounded-2xl p-4 border border-stone-200 opacity-70">
          <div className="flex items-center gap-2 mb-4 text-emerald-600 font-semibold px-2">
            <CheckCircle2 size={20} />
            <h2>Prontos ({completedOrders.length})</h2>
          </div>
          <div className="flex flex-col gap-4">
            {completedOrders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}