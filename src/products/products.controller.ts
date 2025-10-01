import { Controller, Get } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
    constructor(private readonly ProductsService: ProductsService) {}
    
    @Get("search")
    getProduct(){
        return this.ProductsService.searchProducts();
    }
}
