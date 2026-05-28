import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto.js'
import { UpdateProductDto } from './dto/update-product.dto.js'
import { ProductsRepository } from './products.repository.js';
import { Product } from '../../generated/prisma/client.js';

@Injectable()
export class ProductsService {
    constructor(private readonly productsRepository: ProductsRepository) { }

    async findAll(search?: string): Promise<Product[]> {
        const products = await this.productsRepository.findAll()
        const query = search?.trim()?.toLowerCase();

        if (!query) {
            return products
        }

        return products.filter(product => product.name.toLowerCase().includes(query));
    }

    async findOne(id: number): Promise<Product> {
        if (!id) {
            throw new BadRequestException('id пользователя не передан')
        }

        const product = await this.productsRepository.findOne(id);

        if (!product) {
            throw new NotFoundException('Товар не найден')
        }

        return product
    }

    create(body: CreateProductDto): Promise<Product> {
        if (!body) {
            throw new BadRequestException('Данные товара не переданы');
        }

        return this.productsRepository.create(body)
    }

    update(id: number, body: UpdateProductDto): Promise<Product> {
        if (!body) {
            throw new BadRequestException('Данные товара не переданы');
        }

        return this.productsRepository.update(id, body)
    }
}
