import { Injectable } from '@nestjs/common';
import { JumiaService } from './jumia.service';
import { KongaService } from './konga.service';
import { JijiService } from './jiji.service';

@Injectable()
export class ProductsService {

    constructor(
        private readonly jumiaService: JumiaService,
        private readonly kongaService: KongaService,
        private readonly jijiService: JijiService,
    ) {}


    async searchProducts(query:string){

        try{
            const [jumia, jiji] = await Promise.all([
                this.jumiaService.searchJumia(query),
                this.jijiService.searchJiji(query),
            ]);
            const jumiaResults = jumia?.results ?? [];
            const jijiResults = jiji?.results ?? [];
            const allResults = [...jumiaResults, ...jijiResults];

            const averagePrice = Math.round(allResults.map(r => parseInt(r.price.replace(/\D/g, ""))).reduce((sum, val) => sum + val, 0) / allResults.length);
            const filteredResults = allResults.filter(r => {
                const numericPrice = parseInt(r.price.replace(/\D/g, ""));
                return numericPrice >= averagePrice * 0.7 && numericPrice <= averagePrice * 5;
            });

            return {
                query,
                count: filteredResults.length,
                lowestPrice: filteredResults.length ? Math.min(...filteredResults.map(r => parseInt(r.price.replace(/\D/g, "")))) : null,
                highestPrice: filteredResults.length ? Math.max(...filteredResults.map(r => parseInt(r.price.replace(/\D/g, "")))) : null,
                averagePrice: averagePrice,
                filteredResults
            };
            
        }catch(error){
            console.error("Error scraping: ", query, error.message)
        }
    }
}

