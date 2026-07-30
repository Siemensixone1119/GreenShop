import 'dotenv/config';
import { PrismaClient } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from "bcrypt";

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
  await prisma.cartItem.deleteMany();
  await prisma.session.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const indoorCategory = await prisma.category.create({
    data: { name: "Комнатные растения" },
  });

  const succulentsCategory = await prisma.category.create({
    data: { name: "Суккуленты" },
  });

  const cactiCategory = await prisma.category.create({
    data: { name: "Кактусы" },
  });

  const floweringCategory = await prisma.category.create({
    data: { name: "Цветущие растения" },
  });

  const foliageCategory = await prisma.category.create({
    data: { name: "Декоративно-лиственные" },
  });

  const palmsCategory = await prisma.category.create({
    data: { name: "Пальмы" },
  });

  const ficusCategory = await prisma.category.create({
    data: { name: "Фикусы" },
  });

  const orchidsCategory = await prisma.category.create({
    data: { name: "Орхидеи" },
  });

  const fernsCategory = await prisma.category.create({
    data: { name: "Папоротники" },
  });

  const bonsaiCategory = await prisma.category.create({
    data: { name: "Бонсай" },
  });

  await prisma.category.create({
    data: { name: "Грунты и удобрения" },
  });

  await prisma.category.create({
    data: { name: "Кашпо и аксессуары" },
  });

  const monstera = await prisma.product.create({
    data: {
      name: "Монстера Делициоза",
      description: "Тропическое растение с крупными резными листьями.",
      price: 2490,
      stock: 18,
      image: "/images/products/monstera-deliciosa.jpg",
      categoryId: foliageCategory.id,
    },
  });

  const calathea = await prisma.product.create({
    data: {
      name: "Калатея Орбифолия",
      description: "Декоративное растение с широкими полосатыми листьями.",
      price: 2190,
      stock: 11,
      image: "/images/products/calathea-orbifolia.jpg",
      categoryId: foliageCategory.id,
    },
  });

  const sansevieria = await prisma.product.create({
    data: {
      name: "Сансевиерия Лауренти",
      description: "Неприхотливое растение с плотными листьями.",
      price: 1390,
      stock: 25,
      image: "/images/products/sansevieria-laurenti.jpg",
      categoryId: indoorCategory.id,
    },
  });

  const zamioculcas = await prisma.product.create({
    data: {
      name: "Замиокулькас",
      description: "Теневыносливое растение с глянцевыми тёмными листьями.",
      price: 1890,
      stock: 16,
      image: "/images/products/zamioculcas.jpg",
      categoryId: indoorCategory.id,
    },
  });

  const echeveria = await prisma.product.create({
    data: {
      name: "Эхеверия",
      description: "Компактный суккулент с симметричной розеткой листьев.",
      price: 590,
      stock: 32,
      image: "/images/products/echeveria.jpg",
      categoryId: succulentsCategory.id,
    },
  });

  const crassula = await prisma.product.create({
    data: {
      name: "Крассула Овата",
      description: "Суккулент, известный также как денежное дерево.",
      price: 890,
      stock: 21,
      image: "/images/products/crassula-ovata.jpg",
      categoryId: succulentsCategory.id,
    },
  });

  const echinocactus = await prisma.product.create({
    data: {
      name: "Эхинокактус Грузона",
      description:
        "Шаровидный кактус с выраженными рёбрами и золотистыми колючками.",
      price: 990,
      stock: 17,
      image: "/images/products/echinocactus-grusonii.jpg",
      categoryId: cactiCategory.id,
    },
  });

  const opuntia = await prisma.product.create({
    data: {
      name: "Опунция",
      description: "Кактус с плоскими сегментированными побегами.",
      price: 790,
      stock: 20,
      image: "/images/products/opuntia.jpg",
      categoryId: cactiCategory.id,
    },
  });

  const anthurium = await prisma.product.create({
    data: {
      name: "Антуриум Андре",
      description: "Цветущее растение с яркими красными соцветиями.",
      price: 2290,
      stock: 14,
      image: "/images/products/anthurium-andre.jpg",
      categoryId: floweringCategory.id,
    },
  });

  const spathiphyllum = await prisma.product.create({
    data: {
      name: "Спатифиллум",
      description: "Комнатное растение с белыми цветами и тёмной листвой.",
      price: 1590,
      stock: 19,
      image: "/images/products/spathiphyllum.jpg",
      categoryId: floweringCategory.id,
    },
  });

  const areca = await prisma.product.create({
    data: {
      name: "Пальма Арека",
      description: "Комнатная пальма с длинными перистыми листьями.",
      price: 3490,
      stock: 8,
      image: "/images/products/areca-palm.jpg",
      categoryId: palmsCategory.id,
    },
  });

  const ficusLyrata = await prisma.product.create({
    data: {
      name: "Фикус Лирата",
      description: "Высокое растение с крупными листьями скрипичной формы.",
      price: 3990,
      stock: 9,
      image: "/images/products/ficus-lyrata.jpg",
      categoryId: ficusCategory.id,
    },
  });

  const phalaenopsis = await prisma.product.create({
    data: {
      name: "Орхидея Фаленопсис",
      description: "Популярная орхидея с продолжительным цветением.",
      price: 1990,
      stock: 13,
      image: "/images/products/phalaenopsis.jpg",
      categoryId: orchidsCategory.id,
    },
  });

  const nephrolepis = await prisma.product.create({
    data: {
      name: "Нефролепис Бостон",
      description: "Пышный папоротник с длинными изогнутыми вайями.",
      price: 1490,
      stock: 15,
      image: "/images/products/nephrolepis-boston.jpg",
      categoryId: fernsCategory.id,
    },
  });

  const ficusGinseng = await prisma.product.create({
    data: {
      name: "Бонсай Фикус Гинсенг",
      description: "Миниатюрный фикус с выразительным утолщённым стволом.",
      price: 2890,
      stock: 10,
      image: "/images/products/ficus-ginseng-bonsai.jpg",
      categoryId: bonsaiCategory.id,
    },
  });

  const passwordHash = await bcrypt.hash("GreenShop123!", 10);

  const admin = await prisma.user.create({
    data: {
      email: "admin@greenshop.test",
      passwordHash,
      name: "Администратор",
      role: "ADMIN",
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: "manager@greenshop.test",
      passwordHash,
      name: "Менеджер",
      role: "ADMIN",
    },
  });

  const alexandra = await prisma.user.create({
    data: {
      email: "alexandra@greenshop.test",
      passwordHash,
      name: "Александра",
    },
  });

  const ivan = await prisma.user.create({
    data: {
      email: "ivan@greenshop.test",
      passwordHash,
      name: "Иван",
    },
  });

  const maria = await prisma.user.create({
    data: {
      email: "maria@greenshop.test",
      passwordHash,
      name: "Мария",
    },
  });

  const dmitry = await prisma.user.create({
    data: {
      email: "dmitry@greenshop.test",
      passwordHash,
      name: "Дмитрий",
    },
  });

  const elena = await prisma.user.create({
    data: {
      email: "elena@greenshop.test",
      passwordHash,
      name: "Елена",
    },
  });

  const nikita = await prisma.user.create({
    data: {
      email: "nikita@greenshop.test",
      passwordHash,
      name: "Никита",
    },
  });

  const olga = await prisma.user.create({
    data: {
      email: "olga@greenshop.test",
      passwordHash,
      name: "Ольга",
    },
  });

  const sergey = await prisma.user.create({
    data: {
      email: "sergey@greenshop.test",
      passwordHash,
      name: "Сергей",
    },
  });

  const anna = await prisma.user.create({
    data: {
      email: "anna@greenshop.test",
      passwordHash,
      name: "Анна",
    },
  });

  const pavel = await prisma.user.create({
    data: {
      email: "pavel@greenshop.test",
      passwordHash,
      name: "Павел",
    },
  });

  const refreshHash = await bcrypt.hash("test-refresh-token", 10);
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await prisma.session.createMany({
    data: [
      { userId: admin.id, refreshHash, expiresAt },
      { userId: manager.id, refreshHash, expiresAt },
      { userId: alexandra.id, refreshHash, expiresAt },
      { userId: ivan.id, refreshHash, expiresAt },
      { userId: maria.id, refreshHash, expiresAt },
      { userId: dmitry.id, refreshHash, expiresAt },
      { userId: elena.id, refreshHash, expiresAt },
      { userId: nikita.id, refreshHash, expiresAt },
      { userId: olga.id, refreshHash, expiresAt },
      { userId: sergey.id, refreshHash, expiresAt },
      { userId: anna.id, refreshHash, expiresAt },
      { userId: pavel.id, refreshHash, expiresAt },
    ],
  });

  const adminCart = await prisma.cart.create({
    data: { userId: admin.id },
  });

  const managerCart = await prisma.cart.create({
    data: { userId: manager.id },
  });

  const alexandraCart = await prisma.cart.create({
    data: { userId: alexandra.id },
  });

  const ivanCart = await prisma.cart.create({
    data: { userId: ivan.id },
  });

  const mariaCart = await prisma.cart.create({
    data: { userId: maria.id },
  });

  const dmitryCart = await prisma.cart.create({
    data: { userId: dmitry.id },
  });

  const elenaCart = await prisma.cart.create({
    data: { userId: elena.id },
  });

  const nikitaCart = await prisma.cart.create({
    data: { userId: nikita.id },
  });

  const olgaCart = await prisma.cart.create({
    data: { userId: olga.id },
  });

  const sergeyCart = await prisma.cart.create({
    data: { userId: sergey.id },
  });

  const annaCart = await prisma.cart.create({
    data: { userId: anna.id },
  });

  const pavelCart = await prisma.cart.create({
    data: { userId: pavel.id },
  });

  await prisma.cartItem.createMany({
    data: [
      { cartId: adminCart.id, productId: monstera.id, quantity: 1 },
      { cartId: adminCart.id, productId: echeveria.id, quantity: 2 },
      { cartId: managerCart.id, productId: calathea.id, quantity: 1 },
      {
        cartId: alexandraCart.id,
        productId: sansevieria.id,
        quantity: 1,
      },
      {
        cartId: alexandraCart.id,
        productId: nephrolepis.id,
        quantity: 2,
      },
      { cartId: ivanCart.id, productId: zamioculcas.id, quantity: 2 },
      { cartId: mariaCart.id, productId: crassula.id, quantity: 1 },
      { cartId: mariaCart.id, productId: ficusGinseng.id, quantity: 1 },
      { cartId: dmitryCart.id, productId: echinocactus.id, quantity: 1 },
      { cartId: elenaCart.id, productId: opuntia.id, quantity: 3 },
      { cartId: nikitaCart.id, productId: anthurium.id, quantity: 1 },
      { cartId: olgaCart.id, productId: spathiphyllum.id, quantity: 2 },
      { cartId: sergeyCart.id, productId: areca.id, quantity: 1 },
      { cartId: annaCart.id, productId: ficusLyrata.id, quantity: 1 },
      { cartId: pavelCart.id, productId: phalaenopsis.id, quantity: 1 },
    ],
  });

  console.log("Тестовые данные созданы");
  console.log("Пароль пользователей: GreenShop123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
