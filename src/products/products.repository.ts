import { Injectable } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service.js';
import { Product } from '../../generated/prisma/client.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

@Injectable()
export class ProductsRepository {
    constructor(private readonly prisma: PrismaService) { }

    findAll(): Promise<Product[]> {
        return this.prisma.product.findMany()
    }

    findOne(id: number): Promise<Product | null> {
        return this.prisma.product.findUnique({
            where: {
                id: id
            }
        })
    }

    create(data: CreateProductDto): Promise<Product> {
        return this.prisma.product.create({
            data
        })
    }

    update(id: number, data: UpdateProductDto): Promise<Product> {
        return this.prisma.product.update({
            where: { id },
            data
        })
    }
}