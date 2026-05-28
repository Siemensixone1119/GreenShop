import { Controller, Get, Post, Param, Query, Body, Patch } from '@nestjs/common';
import { ProductsService } from './products.service.js';
import { CreateProductDto } from './dto/create-product.dto.js'
import { UpdateProductDto } from './dto/update-product.dto.js';

@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    findAll(@Query('search') search?: string) {
        return this.productsService.findAll(search)
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.productsService.findOne(Number(id))
    }

    @Post()
    create(@Body() body: CreateProductDto) {
        return this.productsService.create(body)
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: UpdateProductDto) {
        return this.productsService.update(Number(id), body)
    }
}
