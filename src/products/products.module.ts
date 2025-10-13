import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { KongaService } from './konga.service';
import { JumiaService } from './jumia.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, KongaService, JumiaService]
})
export class ProductsModule {}
