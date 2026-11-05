import { notFound } from "next/navigation";
import { prisma } from "@/app/lib/prisma";
import * as motion from "framer-motion/client";
import type { Category, Product } from "@prisma/client";

// Importando os nossos novos Client Components
import { CartHeader } from "@/app/components/CartHeader";
import { ProductItem } from "@/app/components/ProductItem";

export const dynamic = 'force-dynamic';

export default async function CustomerMenuPage({
  params,
  searchParams,
}: {
  params: Promise<{ restaurantSlug: string; tableSlug: string }>;
  searchParams: Promise<{ t?: string }>; // Adicionamos o token t aqui
}) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams; // Esperamos pelo token da URL
  
  const { restaurantSlug, tableSlug } = resolvedParams;
  const token = resolvedSearchParams.t;

  const restaurant = await prisma.restaurant.findUnique({
    where: { slug: restaurantSlug },
  });

  if (!restaurant || !restaurant.isActive) return notFound();

  const table = await prisma.table.findFirst({
    where: { slug: tableSlug, restaurantId: restaurant.id, isActive: true },
  });

  if (!table) return notFound();

  // --- MEDIDA DE SEGURANÇA (TOKEN ROTATIVO) ---
  // Se a mesa tem um token de segurança, mas a pessoa tentou aceder sem ele
  // ou com um token velho, bloqueamos o acesso!
  if (table.qrToken && table.qrToken !== token) {
    return (
      <div className="min-h-screen bg-stone-900 flex items-center justify-center p-6 text-center font-sans">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-sm w-full animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
          </div>
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Acesso Expirado</h2>
          <p className="text-stone-500 mb-6">
            Por motivos de segurança, o link desta mesa foi atualizado. 
            Por favor, <b>leia novamente o QR Code</b> que está na sua mesa para aceder ao cardápio.
          </p>
        </div>
      </div>
    );
  }
  // ---------------------------------------------

  const categories = await prisma.category.findMany({
    where: { restaurantId: restaurant.id, isActive: true },
    orderBy: { position: 'asc' },
  });

  const products = await prisma.product.findMany({
    where: { restaurantId: restaurant.id, available: true },
    orderBy: { position: 'asc' },
  });

  const tableOrders = await prisma.order.findMany({
    where: {
      restaurantId: restaurant.id,
      tableId: table.id,
      status: { not: "closed" },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-stone-50 text-stone-900 font-sans pb-24">
      {/* O Cabeçalho Reativo entra aqui */}
      <CartHeader restaurant={restaurant} table={table} tableOrders={tableOrders} />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="px-6 pt-8 pb-4"
      >
        <h2 className="text-3xl font-light tracking-tight mb-2">Nosso Cardápio</h2>
        <p className="text-stone-500">Escolha o que desejar. Entregaremos na sua mesa.</p>
      </motion.div>

      <div className="px-6 py-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <div className="flex gap-4">
          {categories.map((cat: Category, i: number) => (
            <motion.button 
              key={cat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="text-sm font-medium text-stone-400 hover:text-stone-900 transition-colors"
            >
              {cat.name}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="px-6 flex flex-col gap-8 mt-4">
        {categories.map((category: Category) => {
          const categoryProducts = products.filter((p: Product) => p.categoryId === category.id);
          if (categoryProducts.length === 0) return null;

          return (
            <div key={category.id} className="scroll-mt-24">
              <h3 className="text-xl font-semibold mb-4">{category.name}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categoryProducts.map((product: Product) => (
                  <ProductItem key={product.id} product={product} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}