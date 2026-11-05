import { prisma } from "@/app/lib/prisma";
import { TablesHeader } from "../components/TablesHeader";
import QRCode from "react-qr-code";
import { PrintQRButton, EditTableButton } from "../components/TableButtons";

export const dynamic = 'force-dynamic';

export default async function AdminTablesPage() {
  const restaurant = await prisma.restaurant.findFirst();

  if (!restaurant) return <div>Nenhum restaurante encontrado.</div>;

  const tables = await prisma.table.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { name: 'asc' },
  });

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      <TablesHeader restaurantId={restaurant.id} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.length === 0 ? (
          <div className="col-span-full py-12 text-center text-stone-500">
            Ainda não há mesas criadas. Clique em "+ Nova Mesa" para começar!
          </div>
        ) : (
          tables.map((table) => {
            const menuUrl = `http://192.168.1.12:3000/menu/${restaurant.slug}/${table.slug}${table.qrToken ? `?t=${table.qrToken}` : ''}`;

            return (
              <div key={table.id} className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6 flex flex-col items-center text-center">
                <div className="w-full flex items-center justify-between mb-2">
                  <h2 className="text-xl font-bold text-stone-900">{table.name}</h2>
                  {!table.isActive && (
                    <span className="bg-stone-100 text-stone-500 text-xs px-2 py-1 rounded-md font-medium">Inativa</span>
                  )}
                </div>
                <p className="text-xs text-stone-400 mb-6 break-all px-2 min-h-8">{menuUrl}</p>

                <div className={`bg-white p-4 rounded-xl border-2 border-stone-100 mb-6 transition-opacity ${table.isActive ? 'opacity-100' : 'opacity-50'}`}>
                  <QRCode value={menuUrl} size={160} level="Q" />
                </div>

                <div className="w-full flex gap-2">
                  <PrintQRButton tableName={table.name} url={menuUrl} />
                  <EditTableButton table={table} />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}