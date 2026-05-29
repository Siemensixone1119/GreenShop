import { Controller, Get, Post, Param, Query, Body, Patch, Delete, ParseIntPipe } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js'
import { UpdateProductDto } from './dto/update-product.dto.js';
import { Product } from '../../generated/prisma/client.js';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    findAll(@Query('search') search?: string): Promise<Product[]> {
        return this.productsService.findAll(search)
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number): Promise<Product> {
        return this.productsService.findOne(id)
    }

    @Post()
    create(@Body() body: CreateProductDto): Promise<Product> {
        return this.productsService.create(body)
    }

    @Patch(':id')
    update(@Param('id', ParseIntPipe) id: number, @Body() body: UpdateProductDto): Promise<Product> {
        return this.productsService.update(id, body)
    }

    @Delete(':id')
    delete(@Param('id', ParseIntPipe) id: number): Promise<Product>{
        return this.productsService.delete(id)
    }
}
