import { prisma } from "@/app/lib/prisma";
import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import { ProductsHeader } from "./ProductsHeader";
import { DeleteCategoryButton, DeleteProductButton } from "../components/DeleteButtons";
import { EditCategoryButton, EditProductButton } from "../components/EditButtons";

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  // Num cenário real, pegaríamos o ID pelo login
  const restaurant = await prisma.restaurant.findFirst();

  if (!restaurant) return <div>Nenhum restaurante encontrado.</div>;

  // Busca as categorias já com os produtos embutidos!
  const categories = await prisma.category.findMany({
    where: { restaurantId: restaurant.id },
    include: {
      products: {
        orderBy: { position: 'asc' }
      }
    },
    orderBy: { position: 'asc' },
  });

  return (
    <div className="min-h-screen bg-stone-50 p-8">
      {/* Removemos o header em HTML daqui e colocamos o componente que tem os botões e modais */}
        <ProductsHeader restaurantId={restaurant.id} categories={categories} />
      <div className="flex flex-col gap-8">
        {categories.map((category) => (
          <div key={category.id} className="bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
            
            {/* Cabeçalho da Categoria */}
            <div className="bg-stone-100/50 px-6 py-4 border-b border-stone-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-stone-900">{category.name}</h2>
              <div className="flex items-center gap-2">
                <EditCategoryButton category={category} />
                {/* O NOSSO NOVO BOTÃO DE APAGAR CATEGORIA AQUI */}
                <DeleteCategoryButton categoryId={category.id} categoryName={category.name} />
              </div>
            </div>

            {/* Lista de Produtos da Categoria */}
            <div className="divide-y divide-stone-100">
              {category.products.length === 0 ? (
                <div className="p-6 text-center text-stone-400 text-sm">
                  Nenhum produto nesta categoria.
                </div>
              ) : (
                category.products.map((product) => (
                  <div key={product.id} className="p-6 flex items-center justify-between group hover:bg-stone-50/50 transition-colors">
                    
                    <div className="flex items-center gap-4">
                      {/* Imagem do Produto */}
                      <div className="w-16 h-16 bg-stone-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden border border-stone-200">
                        {product.imageUrl ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon size={24} className="text-stone-300" />
                        )}
                      </div>
                      
                      {/* Info do Produto */}
                      <div>
                        <h3 className="font-medium text-stone-900 flex items-center gap-2">
                          {product.name}
                          {!product.available && (
                            <span className="text-[10px] uppercase font-bold bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                              Esgotado
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-stone-500 line-clamp-1 mt-0.5 max-w-md">
                          {product.description || "Sem descrição"}
                        </p>
                        <p className="font-medium text-stone-900 mt-1">
                          {(product.price / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                    </div>

                    {/* Ações do Produto */}
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <EditProductButton product={product} categories={categories} />
                      {/* O NOSSO NOVO BOTÃO DE APAGAR PRODUTO AQUI */}
                      <DeleteProductButton productId={product.id} productName={product.name} />
                    </div>

                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}