import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';

const databaseUrl = process.env['DATABASE_URL'];

if (!databaseUrl) {
  throw new Error('DATABASE_URL не задан в .env');
}

const adapter = new PrismaPg({
  connectionString: databaseUrl,
});

const prisma = new PrismaClient({
  adapter,
});

async function main() {
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  const indoorPlants = await prisma.category.create({
    data: {
      name: 'Комнатные растения',
    },
  });

  const succulents = await prisma.category.create({
    data: {
      name: 'Суккуленты',
    },
  });

  const pots = await prisma.category.create({
    data: {
      name: 'Кашпо и горшки',
    },
  });

  const soil = await prisma.category.create({
    data: {
      name: 'Грунты и удобрения',
    },
  });

  await prisma.product.createMany({
    data: [
      {
        name: 'Сансевиерия',
        description: 'Неприхотливое комнатное растение',
        price: 1450,
        stock: 10,
        categoryId: indoorPlants.id,
        image: '/images/products/sansevieria.png',
      },
      {
        name: 'Монстера',
        description: 'Крупное декоративное растение с резными листьями',
        price: 3200,
        stock: 5,
        categoryId: indoorPlants.id,
        image: '/images/products/monstera.png',
      },
      {
        name: 'Эхеверия',
        description: 'Компактный суккулент для подоконника',
        price: 650,
        stock: 18,
        categoryId: succulents.id,
        image: '/images/products/echeveria.png',
      },
      {
        name: 'Кашпо керамическое белое',
        description: 'Керамическое кашпо для комнатных растений',
        price: 890,
        stock: 20,
        categoryId: pots.id,
        image: '/images/products/white-pot.png',
      },
      {
        name: 'Грунт универсальный 5 л',
        description: 'Питательный грунт для комнатных растений',
        price: 280,
        stock: 30,
        categoryId: soil.id,
        image: '/images/products/soil-5l.png',
      },
    ],
  });

  console.log('Seed completed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
