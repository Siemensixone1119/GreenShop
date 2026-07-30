import { Module } from '@nestjs/common';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { ProductsModule } from './products/products.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { CategoriesModule } from './categories/categories.module.js';
import { UsersModule } from './users/users.module.js';
import { AuthModule } from './auth/auth.module.js';
import { SessionsModule } from './sessions/sessions.module.js';
import { ConfigModule } from '@nestjs/config'
import { CartModule } from './cart/cart.module.js';

@Module({
  imports: [
    ProductsModule,
    PrismaModule,
    CategoriesModule,
    UsersModule,
    AuthModule,
    SessionsModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CartModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
