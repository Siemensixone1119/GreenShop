import { Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service.js';
import type { Prisma, ProductImage } from '../../generated/prisma/client.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';
import type { ProductWithDetails } from './types/product-with-detail.type.js';
import { CreateProductImageDto } from './dto/create-product-image.dto.js';
import { UpdateProductImageDto } from './dto/update-product-image.dto.js';
import type { ProductFilterDto } from './dto/filter-product.dto.js';
import { ProductCollection } from './enums/product-collection.enum.js';
import { PaginatedProducts } from './types/paginated-products.type.js';
import { ProductSort } from './enums/product-sort.enum.js';

@Injectable()
export class ProductsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: ProductFilterDto): Promise<PaginatedProducts> {
    const variantWhere: Prisma.ProductVariantWhereInput = {};
    const productWhere: Prisma.ProductWhereInput = {};

    const page = filters.page;
    const limit = filters.limit;
    const offset = (page - 1) * limit;

    if (filters.search) {
      productWhere.name = {
        contains: filters.search,
        mode: 'insensitive',
      };
    }

    if (filters.categoryId !== undefined) {
      productWhere.categoryId = filters.categoryId;
    }

    if (filters.size) {
      variantWhere.size = filters.size;
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      variantWhere.price = {
        gte: filters.minPrice,
        lte: filters.maxPrice,
      };
    }

    if (filters.collection === ProductCollection.SALE) {
      variantWhere.discountPercent = {
        gt: 0,
      };
    }

    const hasVariantFilters =
      filters.size !== undefined ||
      filters.minPrice !== undefined ||
      filters.maxPrice !== undefined ||
      filters.collection === ProductCollection.SALE;

    if (hasVariantFilters) {
      productWhere.variants = {
        some: variantWhere,
      };
    }

    if (filters.collection === ProductCollection.NEW) {
      const newProductSince = Date.now() - 1000 * 60 * 60 * 24 * 30;

      productWhere.createdAt = {
        gte: new Date(newProductSince),
      };
    }

    let items: ProductWithDetails[];

    const isPriceSort =
      filters.sort === ProductSort.PRICE_ASC ||
      filters.sort === ProductSort.PRICE_DESC;

    if (isPriceSort) {
      const sortBy = filters.sort === ProductSort.PRICE_ASC ? 'asc' : 'desc';

      const sortedPrices = await this.prisma.productVariant.groupBy({
        by: ['productId'],

        where: {
          ...variantWhere,

          product: productWhere,
        },

        _min: {
          price: true,
        },

        orderBy: [
          {
            _min: {
              price: sortBy,
            },
          },
          {
            productId: 'asc',
          },
        ],

        skip: offset,
        take: limit,
      });

      const productIds = sortedPrices.map((item) => item.productId);

      const products = await this.prisma.product.findMany({
        where: {
          ...productWhere,

          id: {
            in: productIds,
          },
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

      const productMap = new Map(
        products.map((product) => [product.id, product]),
      );

      items = productIds
        .map((id) => productMap.get(id))
        .filter(
          (product): product is ProductWithDetails => product !== undefined,
        );
    } else {
      let sort: Prisma.ProductOrderByWithRelationInput[];

      switch (filters.sort) {
        case ProductSort.CREATE_ASC:
          sort = [{ createdAt: 'asc' }, { id: 'asc' }];
          break;

        case ProductSort.CREATE_DESC:
          sort = [{ createdAt: 'desc' }, { id: 'asc' }];
          break;

        case ProductSort.NAME_ASC:
          sort = [{ name: 'asc' }, { id: 'asc' }];
          break;

        case ProductSort.NAME_DESC:
          sort = [{ name: 'desc' }, { id: 'asc' }];
          break;

        default:
          sort = [{ id: 'asc' }];
          break;
      }

      items = await this.prisma.product.findMany({
        where: productWhere,

        include: {
          category: true,

          images: {
            orderBy: {
              position: 'asc',
            },
          },

          variants: true,
        },

        skip: offset,
        take: limit,

        orderBy: sort,
      });
    }

    const total = await this.prisma.product.count({
      where: productWhere,
    });

    const totalPages = Math.ceil(total / limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages,
    };
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
