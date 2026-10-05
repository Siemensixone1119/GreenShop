# GreenShop API

Backend интернет-магазина декоративных растений. Проект построен на NestJS, TypeScript, Prisma и PostgreSQL. API предоставляет каталог с фильтрацией и пагинацией, варианты товаров, корзину, заказы, регистрацию и авторизацию с cookie-сессиями, а также административные операции.

## Быстрый запуск для проверки

Нужны Git, Node.js 22 или новее, npm и Docker с Compose.

1. Клонируйте репозиторий с GitHub и откройте его каталог в терминале:

   ```bash
   cd greenshop-backend
   ```

2. Создайте локальный файл окружения:

   ```bash
   cp .env.example .env
   ```

   В `.env` замените `JWT_ACCESS_SECRET` на случайную строку не короче 32 символов. Например, сгенерируйте её командой `openssl rand -hex 32`. Не публикуйте `.env` и не отправляйте его в Git.

3. Установите зависимости, сгенерируйте Prisma Client и запустите PostgreSQL вместе с API:

   ```bash
   npm ci
   npx prisma generate
   docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d
   ```

   Compose дождётся готовности PostgreSQL, применит миграции и запустит API. База данных будет доступна с компьютера на `localhost:5433`, API — на `localhost:1119`.

4. Заполните базу демонстрационными данными:

   ```bash
   npx prisma db seed
   ```

   **Важно:** seed сначала удаляет данные из настроенной базы и создаёт демонстрационные заново. Используйте его только для локальной базы проекта, в которой нет нужных данных. После изменений в seed повторный запуск также пересоздаст содержимое.

5. Откройте интерактивную документацию:

   **[http://localhost:1119/docs](http://localhost:1119/docs)**

   В Swagger UI можно просматривать маршруты, схемы запросов и ответов, а также отправлять запросы через **Try it out**. Начните с публичных `GET /api/products` и `GET /api/categories`. Для защищённых операций сначала зарегистрируйтесь или войдите через `/api/auth/register` или `/api/auth/login`; браузер сохранит auth cookies для последующих запросов.

Данные для входа после seed:

| Роль | Email | Пароль |
| --- | --- | --- |
| Администратор | `admin@greenshop.test` | `GreenShop123!` |
| Покупатель | `alexandra@greenshop.test` | `GreenShop123!` |

Это демонстрационные учётные записи локальной базы, не используйте их в production.

Остановить контейнеры, сохранив базу:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

## Запуск тестов

E2E-тесты используют отдельную PostgreSQL на порту `5434`; они не должны запускаться против демонстрационной базы на `5433`.

```bash
cp .env.test.example .env.test.local
docker compose --env-file .env.test.local -f docker-compose.test.yml up -d
npm run db:test:migrate
npm test -- --runInBand
npm run test:e2e
```

После тестов тестовую БД можно остановить:

```bash
docker compose --env-file .env.test.local -f docker-compose.test.yml down
```

`.env.test.local` содержит только параметры локальной тестовой базы и игнорируется Git.

## Основные маршруты

Все API-маршруты имеют префикс `/api`.

| Область | Примеры |
| --- | --- |
| Каталог | `GET /api/products`, `GET /api/products/{productId}` |
| Категории | `GET /api/categories` |
| Авторизация | `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout` |
| Корзина | `GET /api/cart`, `POST /api/cart/items` |
| Заказы | `POST /api/orders`, `GET /api/orders` |

Полный список маршрутов и доступов указан в Swagger: [http://localhost:1119/docs](http://localhost:1119/docs).

## Настройки окружения

`.env.example` содержит шаблон локальных настроек. Для Docker Compose используются `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB` и `JWT_ACCESS_SECRET`; `DATABASE_URL` в этом файле нужна Prisma-командам, запускаемым непосредственно на компьютере, например `prisma db seed`.

Не коммитьте `.env`, `.env.test.local` или реальные секреты. Для публикации API потребуется развернуть приложение и базу на сервере/хостинге, настроить домен и HTTPS; локальный адрес `localhost` доступен только на компьютере, где запущен проект.
