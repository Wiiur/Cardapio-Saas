"use server";

import { prisma } from "@/app/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateOrderStatusAction(orderId: string, newStatus: string) {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus },
    });

    // Esta linha é mágica: diz ao Next.js para recarregar a página do admin automaticamente!
    revalidatePath("/admin");
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar pedido:", error);
    return { success: false, error: "Falha ao atualizar estado." };
  }
}