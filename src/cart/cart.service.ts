import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CartRepository } from './cart.repository.js';
import { CartItemRepository } from './cart-item.repository.js';
import { AddCartItemDto } from './dto/add-cart-item.dto.js';
import type { Cart, CartItem } from '../../generated/prisma/client.js';
import type { CartWithItems } from './types/cart-with-items.type.js';
import { UpdateCartItemDto } from './dto/update-cart-item.dto.js';
import { ProductVariantService } from '../product-variant/product-variant.service.js';

@Injectable()
export class CartService {
  constructor(
    private readonly cartRepository: CartRepository,
    private readonly cartItemRepository: CartItemRepository,
    private readonly productVariantService: ProductVariantService,
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
    const productVariantId = data.productVariantId;
    const quantity = data.quantity;

    const productVariant =
      await this.productVariantService.findOneById(productVariantId);
    this.validateStock(quantity, productVariant.stock);

    const cart = await this.findOrCreateCart(userId);
    const cartItem = await this.cartItemRepository.findItem(
      cart.id,
      productVariant.id,
    );
    if (!cartItem) {
      return this.cartItemRepository.create(
        cart.id,
        productVariant.id,
        quantity,
      );
    }

    const finalQuantity = cartItem.quantity + quantity;
    this.validateStock(finalQuantity, productVariant.stock);

    return this.cartItemRepository.updateQuantity(cartItem.id, finalQuantity);
  }

  async updateQuantity(
    userId: number,
    productVariantId: number,
    data: UpdateCartItemDto,
  ): Promise<CartItem> {
    if (!productVariantId || productVariantId <= 0) {
      throw new BadRequestException('Некорректный id варианта товара');
    }

    const quantity = data.quantity;
    const productVariant =
      await this.productVariantService.findOneById(productVariantId);
    this.validateStock(quantity, productVariant.stock);

    const cart = await this.findCartOrThrow(userId);
    const cartItem = await this.findCartItemOrThrow(cart.id, productVariantId);

    return this.cartItemRepository.updateQuantity(cartItem.id, quantity);
  }

  async removeItem(
    userId: number,
    productVariantId: number,
  ): Promise<CartItem> {
    if (!productVariantId || productVariantId <= 0) {
      throw new BadRequestException('Некорректный id варианта товара');
    }

    const cart = await this.findCartOrThrow(userId);
    const cartItem = await this.findCartItemOrThrow(cart.id, productVariantId);

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
    productVariantId: number,
  ): Promise<CartItem> {
    const cartItem = await this.cartItemRepository.findItem(
      cartId,
      productVariantId,
    );
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
