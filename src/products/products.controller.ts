import { Controller, Get, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
    constructor(private readonly ProductsService: ProductsService) {}
    
    @Get("search")
    getProduct(@Query('query') query: string){
        return this.ProductsService.searchProducts(query);
    }
}
