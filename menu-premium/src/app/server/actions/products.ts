"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCategoryAction(restaurantId: string, name: string, description?: string) {
  try {
    // Conta quantas categorias já existem para colocar a nova no fim (position)
    const existingCount = await prisma.category.count({
      where: { restaurantId }
    });

    await prisma.category.create({
      data: {
        restaurantId,
        name,
        description,
        position: existingCount,
        isActive: true,
      },
    });

    // Revalida a página para atualizar a lista instantaneamente
    revalidatePath("/admin/products");
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    return { success: false, error: "Falha ao criar categoria." };
  }
}

export async function createProductAction(
  restaurantId: string, 
  categoryId: string, 
  name: string, 
  price: number, 
  description?: string,
  imageUrl?: string
) {
  try {
    // Conta quantos produtos já existem nesta categoria para organizar a posição
    const existingCount = await prisma.product.count({
      where: { categoryId }
    });

    await prisma.product.create({
      data: {
        restaurantId,
        categoryId,
        name,
        price, // Lembre-se: preço é gravado em centavos (ex: 2500 = R$ 25,00)
        description,
        imageUrl,
        position: existingCount,
        available: true,
      },
    });

    revalidatePath("/admin/products");
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar produto:", error);
    return { success: false, error: "Falha ao criar produto." };
  }
}

// Ação para apagar um Produto
export async function deleteProductAction(productId: string) {
  try {
    await prisma.product.delete({
      where: { id: productId },
    });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Erro ao apagar produto:", error);
    return { success: false, error: "Falha ao apagar produto." };
  }
}

// Ação para apagar uma Categoria
export async function deleteCategoryAction(categoryId: string) {
  try {
    // PROTEÇÃO: O Prisma não deixa apagar uma categoria se ela ainda tiver produtos dentro.
    // Primeiro, temos de apagar todos os produtos dessa categoria.
    await prisma.product.deleteMany({
      where: { categoryId: categoryId },
    });

    // Depois apagamos a categoria em si
    await prisma.category.delete({
      where: { id: categoryId },
    });

    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Erro ao apagar categoria:", error);
    return { success: false, error: "Falha ao apagar categoria." };
  }
}

// Ação para atualizar uma Categoria
export async function updateCategoryAction(categoryId: string, name: string, description?: string) {
  try {
    await prisma.category.update({
      where: { id: categoryId },
      data: { name, description },
    });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar categoria:", error);
    return { success: false, error: "Falha ao atualizar categoria." };
  }
}

// Ação para atualizar um Produto
export async function updateProductAction(
  productId: string,
  categoryId: string,
  name: string,
  price: number,
  description?: string,
  imageUrl?: string,
  available?: boolean
) {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: { categoryId, name, price, description, imageUrl, available },
    });
    revalidatePath("/admin/products");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    return { success: false, error: "Falha ao atualizar produto." };
  }
}