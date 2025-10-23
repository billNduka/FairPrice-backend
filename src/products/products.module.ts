import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { KongaService } from './konga.service';
import { JumiaService } from './jumia.service';
import { JijiService } from './jiji.service';

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, KongaService, JumiaService, JijiService]
})
export class ProductsModule {}
