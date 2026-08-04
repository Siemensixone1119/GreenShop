import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CartRepository } from './cart.repository.js';
import { CartItemRepository } from './cart-item.repository.js';
import { AddCartItemDto } from './dto/add-cart-item.dto.js';
import type { Cart, CartItem } from '../../generated/prisma/client.js';
import { ProductsService } from '../products/products.service.js';
import type { CartWithItems } from './types/cart-with-items.type.js';
import { UpdateCartItemDto } from './dto/update-cart-item.dto.js';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly cartItemRepository: CartItemRepository,
    private readonly productService: ProductsService,
  ) {}

  async getMyCart(userId: number): Promise<CartWithItems> {
    await this.findOrCreateCart(userId);
    const cart = await this.cartRepository.findByUserIdWithItems(userId);
    if (!cart) {
      throw new NotFoundException('Корзина не найдена');
    }
    return cart;
  }

  async addItem(userId: number, data: AddCartItemDto): Promise<CartItem> {
    const productId = data.productId;
    const quantity = data.quantity;

    const product = await this.productService.findOne(productId);
    this.validateStock(quantity, product.stock);

    const cart = await this.findOrCreateCart(userId);
    const cartItem = await this.cartItemRepository.findItem(
      cart.id,
      product.id,
    );
    if (!cartItem) {
      return this.cartItemRepository.create(cart.id, product.id, quantity);
    }

    const finalQuantity = cartItem.quantity + quantity;
    this.validateStock(finalQuantity, product.stock);

    return this.cartItemRepository.updateQuantity(cartItem.id, finalQuantity);
  }

  async updateQuantity(
    userId: number,
    productId: number,
    data: UpdateCartItemDto,
  ): Promise<CartItem> {
    if (!productId || productId <= 0) {
      throw new BadRequestException('Некорректный id товара');
    }

    const quantity = data.quantity;
    const product = await this.productService.findOne(productId);
    this.validateStock(quantity, product.stock);

    const cart = await this.findCartOrThrow(userId);
    const cartItem = await this.findCartItemOrThrow(cart.id, productId);

    return this.cartItemRepository.updateQuantity(cartItem.id, quantity);
  }

  async removeItem(userId: number, productId: number): Promise<CartItem> {
    if (!productId || productId <= 0) {
      throw new BadRequestException('Некорректный id товара');
    }

    const cart = await this.findCartOrThrow(userId);
    const cartItem = await this.findCartItemOrThrow(cart.id, productId);

    return this.cartItemRepository.delete(cartItem.id);
  }

  private async findOrCreateCart(userId: number): Promise<Cart> {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      return this.cartRepository.create(userId);
    }

    return cart;
  }

  private async findCartOrThrow(userId: number): Promise<Cart> {
    const cart = await this.cartRepository.findByUserId(userId);
    if (!cart) {
      throw new NotFoundException('Корзина не найдена');
    }
    return cart;
  }

  private async findCartItemOrThrow(
    cartId: number,
    productId: number,
  ): Promise<CartItem> {
    const cartItem = await this.cartItemRepository.findItem(cartId, productId);
    if (!cartItem) {
      throw new NotFoundException('Товар не найден в корзине');
    }
    return cartItem;
  }

  private validateStock(requestedQuantity: number, stock: number): void {
    if (requestedQuantity > stock) {
      throw new BadRequestException('Недостаточно товара на складе');
    }
  }
}
