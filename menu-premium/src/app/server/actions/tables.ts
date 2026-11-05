"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

// Função para criar uma nova mesa, incluindo a geração de um slug e token QR
export async function createTableAction(restaurantId: string, name: string) {
  try {
    // Cria um identificador limpo (slug) para a URL. Ex: "Mesa 12" vira "mesa-12"
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    // Um token único de segurança para o QR Code não ser adivinhado facilmente
    const qrToken = Math.random().toString(36).substring(2, 15);

    await prisma.table.create({
      data: {
        restaurantId,
        name,
        slug,
        qrToken,
        isActive: true,
      },
    });

    revalidatePath("/admin/tables");
    return { success: true };
  } catch (error) {
    console.error("Erro ao criar mesa:", error);
    return { success: false, error: "Falha ao criar mesa. Pode já existir uma mesa com esse nome." };
  }
}

// Função para atualizar uma mesa, incluindo o nome e o estado ativo/inativo
export async function updateTableAction(tableId: string, name: string, isActive: boolean) {
  try {
    // Recriar o slug caso o nome tenha mudado
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    
    await prisma.table.update({
      where: { id: tableId },
      data: { name, slug, isActive },
    });

    revalidatePath("/admin/tables");
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar mesa:", error);
    return { success: false, error: "Falha ao atualizar mesa." };
  }
}

// Função para apagar uma mesa, com tratamento de erro caso a mesa tenha pedidos associados
export async function deleteTableAction(tableId: string) {
  try {
    await prisma.table.delete({
      where: { id: tableId },
    });

    revalidatePath("/admin/tables");
    return { success: true };
  } catch (error) {
    console.error("Erro ao apagar mesa:", error);
    // Se a mesa já tiver pedidos associados a ela, o Prisma bloqueia a eliminação por segurança.
    return { 
      success: false, 
      error: "Não é possível apagar esta mesa porque já tem pedidos registados. Em vez de apagar, experimente desativá-la na opção Editar." 
    };
  }
}

// Função para renovar o token QR de uma mesa, garantindo que o link antigo expira
export async function refreshTableTokenAction(tableId: string) {
  try {
    // Gera uma nova chave aleatória!
    const newQrToken = Math.random().toString(36).substring(2, 15);
    
    await prisma.table.update({
      where: { id: tableId },
      data: { qrToken: newQrToken },
    });

    revalidatePath("/admin/tables");
    return { success: true };
  } catch (error) {
    console.error("Erro ao renovar token:", error);
    return { success: false, error: "Falha ao renovar o QR Code." };
  }
}