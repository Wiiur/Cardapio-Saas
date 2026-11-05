"use server";

import { prisma } from "@/app/lib/prisma";
// Importamos o tipo para o ESLint parar de reclamar do 'any'
import type { CartItem } from "@/store/cartStore";

export async function createOrderAction(
  restaurantId: string,
  tableId: string,
  totalAmount: number,
  cartItems: CartItem[]
) {
  try {
    // Para simplificar agora, o orderNumber será um número aleatório de 1 a 9999.
    // Num sistema real avançado, você contaria quantos pedidos o restaurante teve no dia.
    const randomOrderNumber = Math.floor(Math.random() * 9000) + 1000;

    // Como OrderItem é um "Type" embutido no MongoDB (definido no seu schema.prisma),
    // o Prisma espera receber um array direto com os campos exatos.
    const orderItemsForMongo = cartItems.map((item) => ({
      productId: item.product.id,
      nameSnapshot: item.product.name,
      unitPrice: item.product.price,
      quantity: item.quantity,
      // O seu schema pede o campo addons como um array obrigatório, mesmo que vazio
      addons: [] 
    }));

    const order = await prisma.order.create({
      data: {
        restaurantId,
        tableId,
        subtotal: totalAmount,
        total: totalAmount,
        status: "pending",
        orderNumber: randomOrderNumber,
        items: orderItemsForMongo,
      },
    });

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Erro ao criar pedido no banco:", error);
    return { success: false, error: "Falha ao enviar o pedido." };
  }
}