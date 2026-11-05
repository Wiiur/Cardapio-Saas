import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Limpando o banco de dados...')
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.table.deleteMany()
  await prisma.restaurant.deleteMany()

  console.log('🏠 Criando o Restaurante...')
  const restaurant = await prisma.restaurant.create({
    data: {
      name: 'Osteria Bella',
      slug: 'osteria-bella',
      logoUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=100&h=100&fit=crop',
    }
  })

  console.log('🪑 Criando a Mesa 12...')
  const table = await prisma.table.create({
    data: {
      restaurantId: restaurant.id,
      name: 'Mesa 12',
      slug: 'mesa-12',
      qrToken: 'token-secreto-mesa-12'
    }
  })

  console.log('📋 Criando Categorias e Produtos...')
  const catMassas = await prisma.category.create({
    data: { restaurantId: restaurant.id, name: 'Massas', position: 1 }
  })

  await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catMassas.id,
      name: 'Ravioli de Trufa',
      description: 'Massa fresca recheada, creme de parmesão e lascas de trufa negra.',
      price: 6800, // Salvo em centavos (R$ 68,00)
      position: 1,
      imageUrl: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=300&q=80',
      available: true
    }
  })

  await prisma.product.create({
    data: {
      restaurantId: restaurant.id,
      categoryId: catMassas.id,
      name: 'Carbonara Originale',
      description: 'Guanciale crocante, pecorino romano, gema caipira e pimenta preta.',
      price: 5500, // R$ 55,00
      position: 2,
      imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=300&q=80',
      available: true
    }
  })

  console.log('✅ Tudo pronto! O banco já tem dados reais.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })