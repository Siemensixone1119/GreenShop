import { Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service.js';
import type { ProductImage } from '../../generated/prisma/client.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import type { ProductWithDetails } from './types/product-with-detail.type.js';
import { CreateProductImageDto } from './dto/create-product-image.dto.js';
import { UpdateProductImageDto } from './dto/update-product-image.dto.js';

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findAll(query?: string): Promise<ProductWithDetails[]> {
    return this.prisma.product.findMany({
      where: query
        ? {
            name: {
              contains: query,
              mode: 'insensitive',
            },
          }
        : undefined,
      include: {
        category: true,
        images: {
          orderBy: {
            position: 'asc',
          },
        },
        variants: true,
      },
    });
  }

  findOne(productId: number): Promise<ProductWithDetails | null> {
    return this.prisma.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        category: true,
        images: {
          orderBy: {
            position: 'asc',
          },
        },
        variants: true,
      },
    });
  }

  create(data: CreateProductDto): Promise<ProductWithDetails> {
    const { images, variants, ...productData } = data;
    return this.prisma.product.create({
      data: {
        ...productData,
        images: images?.length ? { create: images } : undefined,
        variants: { create: variants },
      },
      include: {
        category: true,
        images: {
          orderBy: {
            position: 'asc',
          },
        },
        variants: true,
      },
    });
  }

  update(
    productId: number,
    data: UpdateProductDto,
  ): Promise<ProductWithDetails> {
    return this.prisma.product.update({
      where: { id: productId },
      data,
      include: {
        category: true,
        images: {
          orderBy: {
            position: 'asc',
          },
        },
        variants: true,
      },
    });
  }

  delete(productId: number): Promise<ProductWithDetails> {
    return this.prisma.product.delete({
      where: {
        id: productId,
      },
      include: {
        category: true,
        images: {
          orderBy: {
            position: 'asc',
          },
        },
        variants: true,
      },
    });
  }

  findImage(productId: number, imageId: number): Promise<ProductImage | null> {
    return this.prisma.productImage.findUnique({
      where: {
        id: imageId,
        productId,
      },
    });
  }

  addImage(
    productId: number,
    imageData: CreateProductImageDto,
  ): Promise<ProductImage> {
    return this.prisma.productImage.create({
      data: {
        productId,
        ...imageData,
      },
    });
  }

  updateImage(
    productId: number,
    imageId: number,
    data: UpdateProductImageDto,
  ): Promise<ProductImage> {
    return this.prisma.productImage.update({
      where: {
        id: imageId,
        productId,
      },
      data: data,
    });
  }

  deleteImage(productId: number, imageId: number): Promise<ProductImage> {
    return this.prisma.productImage.delete({
      where: {
        id: imageId,
        productId,
      },
    });
  }
}
