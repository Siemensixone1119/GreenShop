import { Module } from '@nestjs/common';
import { OrderService } from './order.service.js';
import { OrderController } from './order.controller.js';
import { OrderRepository } from './order.repository.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { CartModule } from '../cart/cart.module.js';

@Module({
  providers: [OrderService, OrderRepository],
  controllers: [OrderController],
  imports: [PrismaModule, CartModule],
})
export class OrderModule {}
