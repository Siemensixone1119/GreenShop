import 'dotenv/config';
import { PrismaClient, Size } from '../generated/prisma/client.js';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

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

async function createProductWithVariants(data: {
  name: string;
  description: string;
  categoryId: number;
  skuBase: string;
  basePrice: number;
  baseStock: number;
}) {
  return prisma.product.create({
    data: {
      name: data.name,
      description: data.description,
      categoryId: data.categoryId,
      variants: {
        create: [
          {
            size: Size.SMALL,
            price: data.basePrice,
            stock: data.baseStock,
            sku: `${data.skuBase}01`,
          },
          {
            size: Size.MEDIUM,
            price: data.basePrice + 500,
            stock: Math.max(data.baseStock - 4, 1),
            sku: `${data.skuBase}02`,
          },
          {
            size: Size.LARGE,
            price: data.basePrice + 1000,
            stock: Math.max(data.baseStock - 8, 1),
            sku: `${data.skuBase}03`,
          },
        ],
      },
    },
    include: {
      variants: true,
    },
  });
}

function getVariant(
  product: { variants: Array<{ id: number; size: Size }> },
  size: Size,
) {
  const variant = product.variants.find((item) => item.size === size);

  if (!variant) {
    throw new Error(`У товара отсутствует вариант размера ${size}`);
  }

  return variant;
}

async function main() {
  await prisma.cartItem.deleteMany();
  await prisma.session.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  const indoorCategory = await prisma.category.create({
    data: { name: 'Комнатные растения' },
  });

  const succulentsCategory = await prisma.category.create({
    data: { name: 'Суккуленты' },
  });

  const cactiCategory = await prisma.category.create({
    data: { name: 'Кактусы' },
  });

  const floweringCategory = await prisma.category.create({
    data: { name: 'Цветущие растения' },
  });

  const foliageCategory = await prisma.category.create({
    data: { name: 'Декоративно-лиственные' },
  });

  const palmsCategory = await prisma.category.create({
    data: { name: 'Пальмы' },
  });

  const ficusCategory = await prisma.category.create({
    data: { name: 'Фикусы' },
  });

  const orchidsCategory = await prisma.category.create({
    data: { name: 'Орхидеи' },
  });

  const fernsCategory = await prisma.category.create({
    data: { name: 'Папоротники' },
  });

  const bonsaiCategory = await prisma.category.create({
    data: { name: 'Бонсай' },
  });

  await prisma.category.create({
    data: { name: 'Грунты и удобрения' },
  });

  await prisma.category.create({
    data: { name: 'Кашпо и аксессуары' },
  });

  const monstera = await createProductWithVariants({
    name: 'Монстера Делициоза',
    description: 'Тропическое растение с крупными резными листьями.',
    categoryId: foliageCategory.id,
    skuBase: '10000000001',
    basePrice: 2490,
    baseStock: 18,
  });

  const calathea = await createProductWithVariants({
    name: 'Калатея Орбифолия',
    description: 'Декоративное растение с широкими полосатыми листьями.',
    categoryId: foliageCategory.id,
    skuBase: '10000000002',
    basePrice: 2190,
    baseStock: 11,
  });

  const sansevieria = await createProductWithVariants({
    name: 'Сансевиерия Лауренти',
    description: 'Неприхотливое растение с плотными листьями.',
    categoryId: indoorCategory.id,
    skuBase: '10000000003',
    basePrice: 1390,
    baseStock: 25,
  });

  const zamioculcas = await createProductWithVariants({
    name: 'Замиокулькас',
    description: 'Теневыносливое растение с глянцевыми тёмными листьями.',
    categoryId: indoorCategory.id,
    skuBase: '10000000004',
    basePrice: 1890,
    baseStock: 16,
  });

  const echeveria = await createProductWithVariants({
    name: 'Эхеверия',
    description: 'Компактный суккулент с симметричной розеткой листьев.',
    categoryId: succulentsCategory.id,
    skuBase: '10000000005',
    basePrice: 590,
    baseStock: 32,
  });

  const crassula = await createProductWithVariants({
    name: 'Крассула Овата',
    description: 'Суккулент, известный также как денежное дерево.',
    categoryId: succulentsCategory.id,
    skuBase: '10000000006',
    basePrice: 890,
    baseStock: 21,
  });

  const echinocactus = await createProductWithVariants({
    name: 'Эхинокактус Грузона',
    description:
      'Шаровидный кактус с выраженными рёбрами и золотистыми колючками.',
    categoryId: cactiCategory.id,
    skuBase: '10000000007',
    basePrice: 990,
    baseStock: 17,
  });

  const opuntia = await createProductWithVariants({
    name: 'Опунция',
    description: 'Кактус с плоскими сегментированными побегами.',
    categoryId: cactiCategory.id,
    skuBase: '10000000008',
    basePrice: 790,
    baseStock: 20,
  });

  const anthurium = await createProductWithVariants({
    name: 'Антуриум Андре',
    description: 'Цветущее растение с яркими красными соцветиями.',
    categoryId: floweringCategory.id,
    skuBase: '10000000009',
    basePrice: 2290,
    baseStock: 14,
  });

  const spathiphyllum = await createProductWithVariants({
    name: 'Спатифиллум',
    description: 'Комнатное растение с белыми цветами и тёмной листвой.',
    categoryId: floweringCategory.id,
    skuBase: '10000000010',
    basePrice: 1590,
    baseStock: 19,
  });

  const areca = await createProductWithVariants({
    name: 'Пальма Арека',
    description: 'Комнатная пальма с длинными перистыми листьями.',
    categoryId: palmsCategory.id,
    skuBase: '10000000011',
    basePrice: 3490,
    baseStock: 8,
  });

  const ficusLyrata = await createProductWithVariants({
    name: 'Фикус Лирата',
    description: 'Высокое растение с крупными листьями скрипичной формы.',
    categoryId: ficusCategory.id,
    skuBase: '10000000012',
    basePrice: 3990,
    baseStock: 9,
  });

  const phalaenopsis = await createProductWithVariants({
    name: 'Орхидея Фаленопсис',
    description: 'Популярная орхидея с продолжительным цветением.',
    categoryId: orchidsCategory.id,
    skuBase: '10000000013',
    basePrice: 1990,
    baseStock: 13,
  });

  const nephrolepis = await createProductWithVariants({
    name: 'Нефролепис Бостон',
    description: 'Пышный папоротник с длинными изогнутыми вайями.',
    categoryId: fernsCategory.id,
    skuBase: '10000000014',
    basePrice: 1490,
    baseStock: 15,
  });

  const ficusGinseng = await createProductWithVariants({
    name: 'Бонсай Фикус Гинсенг',
    description: 'Миниатюрный фикус с выразительным утолщённым стволом.',
    categoryId: bonsaiCategory.id,
    skuBase: '10000000015',
    basePrice: 2890,
    baseStock: 10,
  });

  await prisma.productImage.createMany({
    data: [
      {
        productId: monstera.id,
        url: '/images/products/monstera-deliciosa.jpg',
        alt: 'Монстера Делициоза',
        position: 0,
      },
      {
        productId: monstera.id,
        url: '/images/products/monstera-deliciosa-2.jpg',
        alt: 'Листья монстеры',
        position: 1,
      },
      {
        productId: monstera.id,
        url: '/images/products/monstera-deliciosa-3.jpg',
        alt: 'Монстера в интерьере',
        position: 2,
      },
      {
        productId: calathea.id,
        url: '/images/products/calathea-orbifolia.jpg',
        alt: 'Калатея Орбифолия',
        position: 0,
      },
      {
        productId: calathea.id,
        url: '/images/products/calathea-orbifolia-2.jpg',
        alt: 'Листья калатеи',
        position: 1,
      },
      {
        productId: sansevieria.id,
        url: '/images/products/sansevieria-laurenti.jpg',
        alt: 'Сансевиерия Лауренти',
        position: 0,
      },
      {
        productId: sansevieria.id,
        url: '/images/products/sansevieria-laurenti-2.jpg',
        alt: 'Сансевиерия в горшке',
        position: 1,
      },
      {
        productId: zamioculcas.id,
        url: '/images/products/zamioculcas.jpg',
        alt: 'Замиокулькас',
        position: 0,
      },
      {
        productId: zamioculcas.id,
        url: '/images/products/zamioculcas-2.jpg',
        alt: 'Замиокулькас в интерьере',
        position: 1,
      },
      {
        productId: echeveria.id,
        url: '/images/products/echeveria.jpg',
        alt: 'Эхеверия',
        position: 0,
      },
      {
        productId: echeveria.id,
        url: '/images/products/echeveria-2.jpg',
        alt: 'Розетка эхеверии',
        position: 1,
      },
      {
        productId: crassula.id,
        url: '/images/products/crassula-ovata.jpg',
        alt: 'Крассула Овата',
        position: 0,
      },
      {
        productId: crassula.id,
        url: '/images/products/crassula-ovata-2.jpg',
        alt: 'Крассула в горшке',
        position: 1,
      },
      {
        productId: echinocactus.id,
        url: '/images/products/echinocactus-grusonii.jpg',
        alt: 'Эхинокактус Грузона',
        position: 0,
      },
      {
        productId: echinocactus.id,
        url: '/images/products/echinocactus-grusonii-2.jpg',
        alt: 'Колючки эхинокактуса',
        position: 1,
      },
      {
        productId: opuntia.id,
        url: '/images/products/opuntia.jpg',
        alt: 'Опунция',
        position: 0,
      },
      {
        productId: opuntia.id,
        url: '/images/products/opuntia-2.jpg',
        alt: 'Побеги опунции',
        position: 1,
      },
      {
        productId: anthurium.id,
        url: '/images/products/anthurium-andre.jpg',
        alt: 'Антуриум Андре',
        position: 0,
      },
      {
        productId: anthurium.id,
        url: '/images/products/anthurium-andre-2.jpg',
        alt: 'Цветок антуриума',
        position: 1,
      },
      {
        productId: spathiphyllum.id,
        url: '/images/products/spathiphyllum.jpg',
        alt: 'Спатифиллум',
        position: 0,
      },
      {
        productId: spathiphyllum.id,
        url: '/images/products/spathiphyllum-2.jpg',
        alt: 'Цветок спатифиллума',
        position: 1,
      },
      {
        productId: areca.id,
        url: '/images/products/areca-palm.jpg',
        alt: 'Пальма Арека',
        position: 0,
      },
      {
        productId: areca.id,
        url: '/images/products/areca-palm-2.jpg',
        alt: 'Листья пальмы Арека',
        position: 1,
      },
      {
        productId: ficusLyrata.id,
        url: '/images/products/ficus-lyrata.jpg',
        alt: 'Фикус Лирата',
        position: 0,
      },
      {
        productId: ficusLyrata.id,
        url: '/images/products/ficus-lyrata-2.jpg',
        alt: 'Листья фикуса Лирата',
        position: 1,
      },
      {
        productId: phalaenopsis.id,
        url: '/images/products/phalaenopsis.jpg',
        alt: 'Орхидея Фаленопсис',
        position: 0,
      },
      {
        productId: phalaenopsis.id,
        url: '/images/products/phalaenopsis-2.jpg',
        alt: 'Цветы орхидеи',
        position: 1,
      },
      {
        productId: nephrolepis.id,
        url: '/images/products/nephrolepis-boston.jpg',
        alt: 'Нефролепис Бостон',
        position: 0,
      },
      {
        productId: nephrolepis.id,
        url: '/images/products/nephrolepis-boston-2.jpg',
        alt: 'Листья нефролеписа',
        position: 1,
      },
      {
        productId: ficusGinseng.id,
        url: '/images/products/ficus-ginseng-bonsai.jpg',
        alt: 'Бонсай Фикус Гинсенг',
        position: 0,
      },
      {
        productId: ficusGinseng.id,
        url: '/images/products/ficus-ginseng-bonsai-2.jpg',
        alt: 'Ствол фикуса Гинсенг',
        position: 1,
      },
    ],
  });

  const passwordHash = await bcrypt.hash('GreenShop123!', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@greenshop.test',
      passwordHash,
      name: 'Администратор',
      role: 'ADMIN',
    },
  });

  const manager = await prisma.user.create({
    data: {
      email: 'manager@greenshop.test',
      passwordHash,
      name: 'Менеджер',
      role: 'ADMIN',
    },
  });

  const alexandra = await prisma.user.create({
    data: {
      email: 'alexandra@greenshop.test',
      passwordHash,
      name: 'Александра',
    },
  });

  const ivan = await prisma.user.create({
    data: {
      email: 'ivan@greenshop.test',
      passwordHash,
      name: 'Иван',
    },
  });

  const maria = await prisma.user.create({
    data: {
      email: 'maria@greenshop.test',
      passwordHash,
      name: 'Мария',
    },
  });

  const dmitry = await prisma.user.create({
    data: {
      email: 'dmitry@greenshop.test',
      passwordHash,
      name: 'Дмитрий',
    },
  });

  const elena = await prisma.user.create({
    data: {
      email: 'elena@greenshop.test',
      passwordHash,
      name: 'Елена',
    },
  });

  const nikita = await prisma.user.create({
    data: {
      email: 'nikita@greenshop.test',
      passwordHash,
      name: 'Никита',
    },
  });

  const olga = await prisma.user.create({
    data: {
      email: 'olga@greenshop.test',
      passwordHash,
      name: 'Ольга',
    },
  });

  const sergey = await prisma.user.create({
    data: {
      email: 'sergey@greenshop.test',
      passwordHash,
      name: 'Сергей',
    },
  });

  const anna = await prisma.user.create({
    data: {
      email: 'anna@greenshop.test',
      passwordHash,
      name: 'Анна',
    },
  });

  const pavel = await prisma.user.create({
    data: {
      email: 'pavel@greenshop.test',
      passwordHash,
      name: 'Павел',
    },
  });

  const refreshHash = await bcrypt.hash('test-refresh-token', 10);
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

  const monsteraMedium = getVariant(monstera, Size.MEDIUM);
  const echeveriaSmall = getVariant(echeveria, Size.SMALL);
  const calatheaMedium = getVariant(calathea, Size.MEDIUM);
  const sansevieriaLarge = getVariant(sansevieria, Size.LARGE);
  const nephrolepisSmall = getVariant(nephrolepis, Size.SMALL);
  const zamioculcasMedium = getVariant(zamioculcas, Size.MEDIUM);
  const crassulaSmall = getVariant(crassula, Size.SMALL);
  const ficusGinsengMedium = getVariant(ficusGinseng, Size.MEDIUM);
  const echinocactusSmall = getVariant(echinocactus, Size.SMALL);
  const opuntiaSmall = getVariant(opuntia, Size.SMALL);
  const anthuriumLarge = getVariant(anthurium, Size.LARGE);
  const spathiphyllumMedium = getVariant(spathiphyllum, Size.MEDIUM);
  const arecaLarge = getVariant(areca, Size.LARGE);
  const ficusLyrataLarge = getVariant(ficusLyrata, Size.LARGE);
  const phalaenopsisMedium = getVariant(phalaenopsis, Size.MEDIUM);

  await prisma.cartItem.createMany({
    data: [
      {
        cartId: adminCart.id,
        productVariantId: monsteraMedium.id,
        quantity: 1,
      },
      {
        cartId: adminCart.id,
        productVariantId: echeveriaSmall.id,
        quantity: 2,
      },
      {
        cartId: managerCart.id,
        productVariantId: calatheaMedium.id,
        quantity: 1,
      },
      {
        cartId: alexandraCart.id,
        productVariantId: sansevieriaLarge.id,
        quantity: 1,
      },
      {
        cartId: alexandraCart.id,
        productVariantId: nephrolepisSmall.id,
        quantity: 2,
      },
      {
        cartId: ivanCart.id,
        productVariantId: zamioculcasMedium.id,
        quantity: 2,
      },
      {
        cartId: mariaCart.id,
        productVariantId: crassulaSmall.id,
        quantity: 1,
      },
      {
        cartId: mariaCart.id,
        productVariantId: ficusGinsengMedium.id,
        quantity: 1,
      },
      {
        cartId: dmitryCart.id,
        productVariantId: echinocactusSmall.id,
        quantity: 1,
      },
      {
        cartId: elenaCart.id,
        productVariantId: opuntiaSmall.id,
        quantity: 3,
      },
      {
        cartId: nikitaCart.id,
        productVariantId: anthuriumLarge.id,
        quantity: 1,
      },
      {
        cartId: olgaCart.id,
        productVariantId: spathiphyllumMedium.id,
        quantity: 2,
      },
      {
        cartId: sergeyCart.id,
        productVariantId: arecaLarge.id,
        quantity: 1,
      },
      {
        cartId: annaCart.id,
        productVariantId: ficusLyrataLarge.id,
        quantity: 1,
      },
      {
        cartId: pavelCart.id,
        productVariantId: phalaenopsisMedium.id,
        quantity: 1,
      },
    ],
  });

  console.log('Тестовые данные созданы');
  console.log('Пароль пользователей: GreenShop123!');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
